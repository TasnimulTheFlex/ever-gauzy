-- Read-only access for the Base360 Time Tracker password sync (time.base360.ai).
-- Exposes ONLY email + bcrypt hash of active, unbanned The Flex users, through one function.
-- Verify: select count(*) from integrations.flex_password_hashes();   -- expect ~77
-- Rollback: drop function integrations.flex_password_hashes(); drop role gauzy_password_sync; drop schema integrations;
begin;
create schema if not exists integrations;
revoke all on schema integrations from public;

create or replace function integrations.flex_password_hashes()
returns table (email text, encrypted_password text)
language sql stable security definer set search_path = ''
as $$
	select lower(u.email)::text, u.encrypted_password::text
	from auth.users u
	join public.user_tenants ut on ut.user_id = u.id
	where ut.tenant_id = 'a860bda4-b44f-471c-9464-8456bbeb7d38'
	  and ut.is_active
	  and (u.banned_until is null or u.banned_until < now())
	  and u.email is not null
	  and u.encrypted_password like '$2%'
$$;
revoke all on function integrations.flex_password_hashes() from public;

create role gauzy_password_sync login password '<generated; stored only in ~/gauzy/pms-sync.env on the time-tracker box>' connection limit 2;
grant usage on schema integrations to gauzy_password_sync;
grant execute on function integrations.flex_password_hashes() to gauzy_password_sync;
commit;
