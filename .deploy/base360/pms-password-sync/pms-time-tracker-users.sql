-- Read-only feed of active Flex PMS users (name, Time Tracker role, bcrypt hash) for the Base360 Time Tracker sync.
begin;
create or replace function integrations.flex_time_tracker_users()
returns table (email text, first_name text, last_name text, lvl text, encrypted_password text)
language sql stable security definer set search_path = ''
as $$
	select lower(u.email)::text,
		coalesce(nullif(trim(p.first_name), ''), nullif(split_part(trim(p.display_name), ' ', 1), ''), split_part(u.email, '@', 1))::text,
		coalesce(nullif(trim(p.last_name), ''), nullif(trim(substr(trim(p.display_name), length(split_part(trim(p.display_name), ' ', 1)) + 2)), ''), '')::text,
		case when ut.role = 'super_admin' or u.raw_app_meta_data->>'role' = 'super_admin' then 'SUPER_ADMIN'
			when ut.role in ('admin', 'owner') or ut.is_owner or u.raw_app_meta_data->>'role' = 'admin' then 'ADMIN'
			else 'EMPLOYEE' end,
		u.encrypted_password::text
	from auth.users u
	join public.user_tenants ut on ut.user_id = u.id
	left join public.user_profiles p on p.user_id = u.id
	where ut.tenant_id = 'a860bda4-b44f-471c-9464-8456bbeb7d38'
	  and ut.is_active
	  and (u.banned_until is null or u.banned_until < now())
	  and u.email is not null
	  and u.encrypted_password like '$2%'
	  and lower(u.email) not in ('ai@theflex.global', 'tester@theflex.global', 'test@theflex.global')
$$;
revoke all on function integrations.flex_time_tracker_users() from public;
grant execute on function integrations.flex_time_tracker_users() to gauzy_password_sync;
commit;
