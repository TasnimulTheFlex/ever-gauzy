#!/usr/bin/env bash
# Mirrors active Flex PMS users into the Base360 Time Tracker (Gauzy) DB: adds new users and copies changed bcrypt password hashes.
# Read-only on PMS: uses role gauzy_password_sync, which can only call the integrations.flex_* functions.
# A hash is copied only when PMS's hash changed since the last sync, so Gauzy's own rehash-on-login is left alone.
# New users get the same rows the original import created (user, employee with tracking on, user_organization) and their PMS role.
# Users the PMS no longer lists are deactivated (and reactivated if they come back). Super admins are exempt: switching
# tenant in the PMS moves their only membership, so they drop out of the Flex list while still on the team.
set -euo pipefail
cd "$(dirname "$0")"
exec 9>/tmp/pms-password-sync.lock
flock 9 # the listener and the timer can fire together
rows=$(docker run --rm --env-file pms-sync.env postgres:17-alpine psql -X -At -v ON_ERROR_STOP=1 \
	-c "copy (select email, first_name, last_name, lvl, encrypted_password from integrations.flex_time_tracker_users()) to stdout with csv")
n=$(printf '%s\n' "$rows" | grep -c '@.*,\$2[aby]\$' || true)
[ "$n" -ge 10 ] || { echo "$(date -Is) refusing to sync: only $n rows from PMS"; exit 1; }
{
	echo "begin;"
	echo "create table if not exists pms_password_sync (email text primary key, pms_hash text not null, synced_at timestamptz not null default now());"
	echo "alter table pms_password_sync add column if not exists deactivated_at timestamptz;"
	echo "create temp table incoming (email text, first_name text, last_name text, lvl text, hash text) on commit drop;"
	echo "copy incoming from stdin with (format csv);"
	printf '%s\n' "$rows"
	echo '\.'
	cat <<'SQL'
create temp table new_user on commit drop as
	select gen_random_uuid() user_id, gen_random_uuid() employee_id, i.*, o.id org_id, o."tenantId" tenant_id,
		(select r.id from role r where r.name = i.lvl and r."tenantId" = o."tenantId") role_id
	from incoming i
	cross join (select id, "tenantId" from organization where id = '2bf4caf9-7e76-4eb8-8fbf-09c20f6ea05d') o
	where not exists (select 1 from "user" u where lower(u.email) = i.email);
insert into "user" (id, "tenantId", email, "firstName", "lastName", hash, "roleId")
	select user_id, tenant_id, email, first_name, nullif(last_name, ''), hash, role_id from new_user;
insert into employee (id, "tenantId", "organizationId", "userId", "startedWorkOn", "isTrackingEnabled", "allowScreenshotCapture", profile_link)
	select employee_id, tenant_id, org_id, user_id, current_date, true, true,
		trim(both '-' from regexp_replace(lower(first_name || ' ' || last_name), '[^a-z0-9]+', '-', 'g'))
	from new_user;
insert into user_organization ("tenantId", "organizationId", "userId") select tenant_id, org_id, user_id from new_user;
select 'added ' || count(*) || coalesce(': ' || string_agg(email || ' (' || lvl || ')', ', '), '') from new_user;
create temp table gone on commit drop as
	select u.id user_id, s.email from pms_password_sync s
	join "user" u on lower(u.email) = s.email
	join role r on r.id = u."roleId"
	where u."isActive" and s.deactivated_at is null and r.name <> 'SUPER_ADMIN'
	  and not exists (select 1 from incoming i where i.email = s.email);
create temp table returning_user on commit drop as
	select u.id user_id, s.email from pms_password_sync s
	join "user" u on lower(u.email) = s.email
	where s.deactivated_at is not null and exists (select 1 from incoming i where i.email = s.email);
-- ponytail: more than 5 removals in one run looks like a broken PMS feed, so nothing is deactivated; deactivate by hand if real
delete from gone where (select count(*) from gone) > 5 returning 'deactivation skipped: ' || email;
update "user" u set "isActive" = (u.id in (select user_id from returning_user)), "updatedAt" = now()
	where u.id in (select user_id from gone union all select user_id from returning_user);
update employee e set "isActive" = (e."userId" in (select user_id from returning_user)), "updatedAt" = now()
	where e."userId" in (select user_id from gone union all select user_id from returning_user);
update pms_password_sync s set deactivated_at = case when s.email in (select email from gone) then now() end
	where s.email in (select email from gone union all select email from returning_user);
select 'deactivated ' || count(*) || coalesce(': ' || string_agg(email, ', '), '') from gone;
select 'reactivated ' || count(*) || coalesce(': ' || string_agg(email, ', '), '') from returning_user;
with changed as (
	select i.email, i.hash from incoming i
	left join pms_password_sync s on s.email = i.email
	where s.pms_hash is distinct from i.hash
), updated as (
	update "user" u set hash = c.hash, "updatedAt" = now()
	from changed c where lower(u.email) = c.email and u.hash is distinct from c.hash
	returning u.email
)
select 'updated ' || count(*) from updated;
insert into pms_password_sync (email, pms_hash, synced_at)
	select email, hash, now() from incoming
	on conflict (email) do update set pms_hash = excluded.pms_hash, synced_at = excluded.synced_at
	where pms_password_sync.pms_hash is distinct from excluded.pms_hash;
commit;
SQL
} | docker exec -i gauzy-db psql -U postgres gauzy -X -q -At -v ON_ERROR_STOP=1 | paste -sd' ' - | sed "s/^/$(date -Is) pms=$n /"
