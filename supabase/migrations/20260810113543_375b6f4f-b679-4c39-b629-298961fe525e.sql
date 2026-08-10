-- The "Database error querying schema" at /token is extremely specific to Supabase Auth internals.
-- It almost always means the 'authenticator' role cannot read its OWN schema or the extensions schema.

-- 1. Grant everything back to authenticator and postgres to be sure
GRANT USAGE ON SCHEMA public, auth, extensions TO authenticator, postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator, postgres, service_role;

-- 2. Supabase GoTrue (Auth) relies on pg_catalog and information_schema
GRANT USAGE ON SCHEMA pg_catalog, information_schema TO authenticator;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO authenticator;
GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO authenticator;

-- 3. Reset the authenticator search path to the bare minimum required by Supabase
-- Often adding too much to the search_path causes issues if there are name collisions
ALTER ROLE authenticator SET search_path = public, auth, extensions;

-- 4. Check for any 'event triggers' that might be firing
SELECT * FROM pg_event_trigger;

-- 5. Final check on is_platform_admin function - if it's called in a policy
-- it might be causing the recursion. Let's simplify it to the absolute minimum.
CREATE OR REPLACE FUNCTION public.is_platform_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _uid AND role = 'admin'
  );
$$;
