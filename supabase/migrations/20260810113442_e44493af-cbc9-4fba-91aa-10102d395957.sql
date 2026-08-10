-- Attempting to drop triggers in a way that avoids permission issues if they are owned by auth/postgres
DO $$
BEGIN
  -- We use dynamic SQL to drop triggers from auth schema if we have permission
  EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
  EXECUTE 'DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users';
  EXECUTE 'DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not drop some triggers, might be permission restricted';
END $$;

-- Try to grant explicit access to the entire auth schema tables just in case
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role;

-- Re-verify role search path
ALTER ROLE authenticator SET search_path = public, auth, pg_catalog;

-- Check for any remaining custom functions in public that might be used by triggers
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE 'handle_%';
