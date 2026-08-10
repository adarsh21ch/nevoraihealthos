-- The "Database error querying schema" can be caused by the 'authenticator' 
-- role not having access to the 'auth' schema's tables or the 'public' schema's 
-- functions that might be used in any auth hooks (though none are currently active).

-- 1. Grant everything to authenticator on both public and auth
GRANT USAGE ON SCHEMA public, auth, extensions TO authenticator, anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA auth TO authenticator;

-- 2. Audit triggers on auth.users again - but check pg_trigger directly 
-- without joining pg_proc in case the function is missing (causing the error)
SELECT tgname, tgenabled, tgtype, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- 3. Check for any "security label" or "event trigger" that might be interfering
SELECT * FROM pg_event_trigger;

-- 4. Check for any "schema" named things that might be missing
SELECT nspname, rolname 
FROM pg_namespace n 
JOIN pg_roles r ON n.nspowner = r.oid;

-- 5. Force search path at session level if we could, but let's try 
-- making all public functions used in RLS ultra-safe.
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public, auth;
ALTER FUNCTION public.can_access_customer(uuid, uuid) SET search_path = public, auth;
