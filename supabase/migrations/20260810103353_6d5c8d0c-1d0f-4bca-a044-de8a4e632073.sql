-- Migration to fix Auth Outage: Database error querying schema
-- This migration ensures that supabase_auth_admin (GoTrue) has all necessary permissions 
-- to execute triggers and access public schema objects during the login/signup process.

-- 1. Restore schema usage
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- 2. Restore type usage
GRANT USAGE ON TYPE public.app_role TO supabase_auth_admin;

-- 3. Restore execution grants for known auth triggers
GRANT EXECUTE ON FUNCTION public.handle_admin_signup_assignment() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user_admin_assignment() TO supabase_auth_admin;

-- 4. Restore table access for these triggers
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO supabase_auth_admin;

-- 5. Ensure profiles table is accessible
GRANT SELECT, INSERT, UPDATE ON public.profiles TO supabase_auth_admin;

-- 6. Re-verify Fix 1 (authenticated RLS helpers)
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;