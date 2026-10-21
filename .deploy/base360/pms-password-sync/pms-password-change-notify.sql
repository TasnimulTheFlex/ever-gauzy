-- Instant password sync for the Base360 Time Tracker: ping a LISTEN channel when a GoTrue password changes.
-- The payload is empty (no email, no hash); the listener then pulls hashes through integrations.flex_password_hashes().
-- AFTER trigger that only calls pg_notify: it cannot change or block the password update.
-- Verify: select tgname from pg_trigger where tgname = 'zz_notify_gauzy_password_sync';
-- Rollback: drop trigger zz_notify_gauzy_password_sync on auth.users; drop function integrations.notify_gauzy_password_sync();
begin;
create or replace function integrations.notify_gauzy_password_sync()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
	perform pg_notify('pms_password_changed', '');
	return null;
end;
$$;
revoke all on function integrations.notify_gauzy_password_sync() from public;

drop trigger if exists zz_notify_gauzy_password_sync on auth.users;
create trigger zz_notify_gauzy_password_sync
	after update of encrypted_password on auth.users
	for each row
	when (old.encrypted_password is distinct from new.encrypted_password)
	execute function integrations.notify_gauzy_password_sync();
commit;
