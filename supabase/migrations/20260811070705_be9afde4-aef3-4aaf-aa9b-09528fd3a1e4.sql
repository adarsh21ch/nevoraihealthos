-- A. SKIPPED IN SQL: storage.buckets is not writable from migrations on this platform.
-- Verified already correct: progress-photos public=false, public-assets public=true.

-- B. Remove client-role access to the auth schema's tables (keep USAGE + function EXECUTE)
revoke all privileges on all tables    in schema auth from authenticator, authenticated, anon;
revoke all privileges on all sequences in schema auth from authenticator, authenticated, anon;
revoke create on schema auth from authenticator;
grant usage on schema auth to anon, authenticated, service_role;

-- C. authenticator holds no table privileges; it only SET ROLEs
revoke all privileges on all tables    in schema public from authenticator;
revoke all privileges on all sequences in schema public from authenticator;
revoke all privileges on all functions in schema public from authenticator;
revoke create on schema public from authenticator;
grant usage on schema public to authenticator;

-- D. supabase_auth_admin back to narrow grants.
-- Task 1f returned zero triggers on auth.users, so NO grant is added back.
revoke all privileges on all tables    in schema public from supabase_auth_admin;
revoke all privileges on all sequences in schema public from supabase_auth_admin;

-- E. SKIPPED: public.user_roles does not exist (dropped 2026-08-11). Nothing to revoke.
-- F. SKIPPED: public.is_platform_admin already reads only public.platform_admins.
--    Not recreated, to preserve its DEFAULT auth.uid() argument.

-- G. anon must not be able to probe admin status.
-- Functions grant EXECUTE to PUBLIC by default, so revoke from PUBLIC too,
-- then restore the explicit grants the app's policies depend on.
revoke execute on function public.is_platform_admin(uuid) from public;
revoke execute on function public.is_platform_admin(uuid) from anon;
grant execute on function public.is_platform_admin(uuid) to authenticated, service_role;
-- public.has_role(uuid, app_role) no longer exists; nothing to revoke.

-- H. Reset the role search_path overrides added during the outage (LAST)
alter role authenticated reset search_path;
alter role anon          reset search_path;
alter role authenticator reset search_path;