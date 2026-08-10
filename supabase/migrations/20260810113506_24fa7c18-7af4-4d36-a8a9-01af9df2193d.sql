-- Force Drop triggers if they exist by qualifying them correctly
DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS handle_admin_signup_assignment ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_admin_assignment ON auth.users;

-- Also check if they are on public.users (sometimes users create a mirror table)
DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON public.profiles;

-- Ensure handle functions are SECURE and qualified
ALTER FUNCTION public.handle_admin_signup_assignment() SET search_path = public, auth;
ALTER FUNCTION public.handle_new_user_admin_assignment() SET search_path = public, auth;

-- Double check roles search paths
ALTER ROLE authenticator SET search_path = public, auth;
ALTER ROLE postgres SET search_path = public, auth, extensions;
ALTER ROLE authenticated SET search_path = public, auth;
ALTER ROLE anon SET search_path = public, auth;

-- Grant broad SELECT on auth to avoid "querying schema" errors
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role;
