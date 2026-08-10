-- Instead of dropping the function which has many dependencies, 
-- we will update its search_path and verify its source directly.
-- The previous error showed parameter name was '_uid'.

CREATE OR REPLACE FUNCTION public.is_platform_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _uid
  );
$$;

-- Grant usage on schemas to all roles 
-- This is often the root cause of "Database error querying schema" in GoTrue.
GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated, authenticator;

-- Ensure all tables in 'auth' are readable by authenticator
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticator;

-- Verify policies on auth schema again
SELECT schemaname, tablename, policyname, roles FROM pg_policies WHERE schemaname = 'auth';
