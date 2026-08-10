-- 1. Try setting search_path without the 'cache' schema
DO $$
BEGIN
  EXECUTE 'ALTER ROLE authenticator SET search_path TO public, auth, extensions';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not set search_path for authenticator: %', SQLERRM;
END $$;

-- 2. Massive permission grant to ensure nothing is blocking the GoTrue server
GRANT USAGE ON SCHEMA public, auth, extensions TO authenticator, anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT SELECT ON public.user_roles TO authenticator;
GRANT SELECT ON public.platform_admins TO authenticator;

-- 3. Check for any complex triggers on auth.users one more time
SELECT tgname, relname, proname 
FROM pg_trigger t 
JOIN pg_class c ON t.tgrelid = c.oid 
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- 4. Audit RLS on public.user_roles which might be accessed by auth functions
SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- 5. Check search path of important functions
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE proname IN ('is_platform_admin', 'has_role', 'can_access_customer');
