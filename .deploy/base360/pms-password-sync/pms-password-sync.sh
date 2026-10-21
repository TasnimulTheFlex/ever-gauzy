#!/usr/bin/env bash
# Copies changed PMS (GoTrue) bcrypt password hashes for active Flex users into the Base360 Time Tracker (Gauzy) DB.
# Read-only on PMS: uses role gauzy_password_sync, which can only call integrations.flex_password_hashes().
# A hash is copied only when PMS's hash changed since the last sync, so Gauzy's own rehash-on-login is left alone.
set -euo pipefail
cd "$(dirname "$0")"
rows=$(docker run --rm --env-file pms-sync.env postgres:17-alpine \
	psql -X -At -F ',' -v ON_ERROR_STOP=1 -c "select email, encrypted_password from integrations.flex_password_hashes()")
n=$(printf '%s\n' "$rows" | grep -c '^[^,]*@[^,]*,\$2' || true)
[ "$n" -ge 10 ] || { echo "$(date -Is) refusing to sync: only $n rows from PMS"; exit 1; }
{
	echo "begin;"
	echo "create table if not exists pms_password_sync (email text primary key, pms_hash text not null, synced_at timestamptz not null default now());"
	echo "create temp table incoming (email text, hash text) on commit drop;"
	echo "copy incoming from stdin with (format csv);"
	printf '%s\n' "$rows"
	echo '\.'
	cat <<'SQL'
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
} | docker exec -i gauzy-db psql -U postgres gauzy -X -q -At -v ON_ERROR_STOP=1 | sed "s/^/$(date -Is) pms=$n /"
