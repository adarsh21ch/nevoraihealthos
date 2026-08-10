-- 1. Restore the fundamental search_path to the authenticator role.
-- If the authenticator role doesn't have public in its search_path,
-- every proxy connection (PostgREST, Auth) will fail to see public schema objects by default.
ALTER ROLE authenticator SET search_path = public, auth, extensions;

-- 2. Restore core schema usage for ALL internal proxy roles
GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO authenticator, supabase_auth_admin;
GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin;

-- 3. Restore USAGE on the specific role type (app_role) to internal roles
GRANT USAGE ON TYPE public.app_role TO authenticator, supabase_auth_admin, anon, authenticated, service_role;

-- 4. Audit and Ensure Permissions on user_roles and profiles
-- The auth service (supabase_auth_admin) needs to be able to read/write these for hooks.
GRANT ALL PRIVILEGES ON public.user_roles TO supabase_auth_admin, authenticator, service_role;
GRANT ALL PRIVILEGES ON public.profiles TO supabase_auth_admin, authenticator, service_role;
GRANT ALL PRIVILEGES ON public.tenants TO supabase_auth_admin, authenticator, service_role;

-- 5. Final check: Ensure the admin user role is explicitly set
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'teamnevorai@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
