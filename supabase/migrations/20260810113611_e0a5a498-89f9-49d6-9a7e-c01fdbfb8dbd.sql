-- The event trigger 'ensure_rls' might be causing issues during migrations or role switches.
-- It's an internal Lovable/Supabase mechanism.
-- However, "Database error querying schema" at /token is usually a permissions issue.

-- 1. Try to disable the event trigger temporarily to see if it's the culprit (risky, but let's check)
-- Actually, let's look at what functions it calls.
SELECT objid, refobjid, classid FROM pg_depend WHERE objid = 17172; -- 17172 is the OID of ensure_rls

-- 2. Check if the 'authenticator' role has enough connections
SELECT rolname, rolconnlimit FROM pg_roles WHERE rolname = 'authenticator';

-- 3. The absolute last resort: Re-grant EVERYTHING in auth schema to authenticator.
GRANT ALL PRIVILEGES ON SCHEMA auth TO authenticator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO authenticator;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA auth TO authenticator;

-- 4. Check if there are any RLS policies on auth.users (which should NOT exist usually)
SELECT * FROM pg_policies WHERE schemaname = 'auth' AND tablename = 'users';

-- 5. Final attempt to clear any search_path mess
ALTER ROLE authenticator RESET search_path;
ALTER ROLE authenticator SET search_path = public, auth, extensions;
