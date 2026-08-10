-- The "Database error querying schema" error from Supabase Auth (/token endpoint) 
-- is a sign that the GoTrue server cannot execute its internal queries because 
-- of broken permissions or search paths for the 'authenticator' role.

-- 1. Grant USAGE on key schemas
GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated, authenticator;

-- 2. Grant SELECT on all auth tables to authenticator (CRITICAL for login)
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;

-- 3. Check for any policies on auth.users which might cause recursion
SELECT * FROM pg_policies WHERE schemaname = 'auth' AND tablename = 'users';

-- 4. Check for any custom functions in public that qualify for triggers
SELECT proname, prosrc, prosecdef, proconfig 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' AND proname LIKE 'handle_%';

-- 5. Final check of the admin user status
SELECT id, email, confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'teamnevorai@gmail.com';
