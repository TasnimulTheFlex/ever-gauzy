#!/usr/bin/env bash
# Mirrors active PMS users into the Base360 Time Tracker (Gauzy) DB, one tracker tenant per PMS workspace: adds new
# users and copies changed bcrypt password hashes.
# Read-only on PMS: uses role gauzy_password_sync, which can only call the integrations.* functions.
# Each feed row names the tracker organization of the user's PMS workspace (public.time_tracker_workspaces), and
# everything below is matched per tracker TENANT: a user exists, is added, deactivated or re-hashed only inside the
# tenant of their own workspace, so no workspace's people ever land in another's tracker.
# A hash is copied only when PMS's hash changed since the last sync, so Gauzy's own rehash-on-login is left alone.
# New users get the same rows the original import created (user, employee with tracking on, user_organization) and their PMS role.
# Users the PMS no longer lists are deactivated (and reactivated if they come back). Super admins are exempt: switching
# tenant in the PMS moves their only membership, so they drop out of The Flex's list while still on the team. The feed
# only lists them for The Flex, so they never land in a customer workspace's tracker.
# Accounts the PMS never listed (each tenant's integration account, tracker-side admins) are never touched.
set -euo pipefail
cd "$(dirname "$0")"
exec 9>/tmp/pms-password-sync.lock
flock 9 # the listener and the timer can fire together
rows=$(docker run --rm --env-file pms-sync.env postgres:17-alpine psql -X -At -v ON_ERROR_STOP=1 \
	-c "copy (select tracker_organization_id, email, first_name, last_name, lvl, encrypted_password from integrations.time_tracker_users()) to stdout with csv")
n=$(printf '%s\n' "$rows" | grep -c '@.*,\$2[aby]\$' || true)
[ "$n" -ge 10 ] || { echo "$(date -Is) refusing to sync: only $n rows from PMS"; exit 1; }
{
	echo "begin;"
	echo "create table if not exists pms_password_sync (email text primary key, pms_hash text not null, synced_at timestamptz not null default now());"
	echo "alter table pms_password_sync add column if not exists deactivated_at timestamptz;"
	# One row per (tracker tenant, email). Rows from the single-workspace sync all belong to The Flex's tenant.
	echo "alter table pms_password_sync add column if not exists tenant_id uuid;"
	echo "update pms_password_sync set tenant_id = '2e9647e5-e86a-4dfd-b451-b51d4901fb08' where tenant_id is null;"
	echo "alter table pms_password_sync alter column tenant_id set not null;"
	cat <<'SQL'
do $$ begin
	if (select array_agg(a.attname::text order by a.attname) from pg_index i
		join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
		where i.indrelid = 'pms_password_sync'::regclass and i.indisprimary) is distinct from array['email', 'tenant_id'] then
		alter table pms_password_sync drop constraint if exists pms_password_sync_pkey;
		alter table pms_password_sync add primary key (tenant_id, email);
	end if;
end $$;
SQL
	echo "create temp table feed (org_id uuid, email text, first_name text, last_name text, lvl text, hash text) on commit drop;"
	echo "copy feed from stdin with (format csv);"
	printf '%s\n' "$rows"
	echo '\.'
	cat <<'SQL'
-- Each row's tracker tenant comes from its organization; a row naming an organization the tracker does not have is dropped.
create temp table incoming on commit drop as
	select distinct on (o."tenantId", f.email) f.*, o."tenantId" tenant_id
	from feed f join organization o on o.id = f.org_id
	order by o."tenantId", f.email, f.lvl;
select 'skipped ' || count(*) || ' rows for unknown organizations' from feed f
	where not exists (select 1 from organization o where o.id = f.org_id) having count(*) > 0;
create temp table new_user on commit drop as
	select gen_random_uuid() user_id, gen_random_uuid() employee_id, i.*,
		(select r.id from role r where r.name = i.lvl and r."tenantId" = i.tenant_id) role_id
	from incoming i
	where not exists (select 1 from "user" u where lower(u.email) = i.email and u."tenantId" = i.tenant_id);
insert into "user" (id, "tenantId", email, "firstName", "lastName", hash, "roleId")
	select user_id, tenant_id, email, first_name, nullif(last_name, ''), hash, role_id from new_user;
insert into employee (id, "tenantId", "organizationId", "userId", "startedWorkOn", "isTrackingEnabled", "allowScreenshotCapture", profile_link)
	select employee_id, tenant_id, org_id, user_id, current_date, true, true,
		trim(both '-' from regexp_replace(lower(first_name || ' ' || last_name), '[^a-z0-9]+', '-', 'g'))
	from new_user;
insert into user_organization ("tenantId", "organizationId", "userId") select tenant_id, org_id, user_id from new_user;
select 'added ' || count(*) || coalesce(': ' || string_agg(email || ' (' || lvl || ')', ', '), '') from new_user;
create temp table gone on commit drop as
	select u.id user_id, s.tenant_id, s.email from pms_password_sync s
	join "user" u on lower(u.email) = s.email and u."tenantId" = s.tenant_id
	left join role r on r.id = u."roleId"
	where u."isActive" and s.deactivated_at is null and coalesce(r.name, '') <> 'SUPER_ADMIN'
	  and not exists (select 1 from incoming i where i.email = s.email and i.tenant_id = s.tenant_id);
create temp table returning_user on commit drop as
	select u.id user_id, s.tenant_id, s.email from pms_password_sync s
	join "user" u on lower(u.email) = s.email and u."tenantId" = s.tenant_id
	where s.deactivated_at is not null
	  and exists (select 1 from incoming i where i.email = s.email and i.tenant_id = s.tenant_id);
-- ponytail: more than 5 removals from ONE tracker tenant in one run looks like a broken PMS feed, so that tenant's are
-- held back (and logged every run until someone deactivates by hand); other tenants are still deactivated normally
delete from gone g where (select count(*) from gone x where x.tenant_id = g.tenant_id) > 5
	returning 'deactivation skipped (tenant ' || g.tenant_id || '): ' || g.email;
update "user" u set "isActive" = (u.id in (select user_id from returning_user)), "updatedAt" = now()
	where u.id in (select user_id from gone union all select user_id from returning_user);
update employee e set "isActive" = (e."userId" in (select user_id from returning_user)), "updatedAt" = now()
	where e."userId" in (select user_id from gone union all select user_id from returning_user);
update pms_password_sync s
	set deactivated_at = case when exists (select 1 from gone g where g.tenant_id = s.tenant_id and g.email = s.email) then now() end
	where exists (select 1 from gone g where g.tenant_id = s.tenant_id and g.email = s.email)
	   or exists (select 1 from returning_user r where r.tenant_id = s.tenant_id and r.email = s.email);
select 'deactivated ' || count(*) || coalesce(': ' || string_agg(email, ', '), '') from gone;
select 'reactivated ' || count(*) || coalesce(': ' || string_agg(email, ', '), '') from returning_user;
with changed as (
	select i.tenant_id, i.email, i.hash from incoming i
	left join pms_password_sync s on s.tenant_id = i.tenant_id and s.email = i.email
	where s.pms_hash is distinct from i.hash
), updated as (
	update "user" u set hash = c.hash, "updatedAt" = now()
	from changed c where lower(u.email) = c.email and u."tenantId" = c.tenant_id and u.hash is distinct from c.hash
	returning u.email
)
select 'updated ' || count(*) from updated;
insert into pms_password_sync (tenant_id, email, pms_hash, synced_at)
	select tenant_id, email, hash, now() from incoming
	on conflict (tenant_id, email) do update set pms_hash = excluded.pms_hash, synced_at = excluded.synced_at
	where pms_password_sync.pms_hash is distinct from excluded.pms_hash;
commit;
SQL
} | docker exec -i gauzy-db psql -U postgres gauzy -X -q -At -v ON_ERROR_STOP=1 | paste -sd' ' - | sed "s/^/$(date -Is) pms=$n /"
