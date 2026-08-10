-- Forward-only fix for Auth Outage: Database error querying schema
-- The linter migration revoked PUBLIC execution, which stripped supabase_auth_admin's access.
-- We also ensure Fix 1 (authenticated RLS helpers) is fully applied with correct signatures.

-- 1. Restore minimal required access for GoTrue (supabase_auth_admin)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- 2. Restore execution grants for triggers/hooks fired during login
-- supabase_auth_admin runs triggers on auth.users
GRANT EXECUTE ON FUNCTION public.handle_new_user_admin_assignment() TO supabase_auth_admin;

-- 3. Restore access to tables touched by auth triggers
GRANT SELECT, INSERT ON public.user_roles TO supabase_auth_admin;

-- 4. Restore Fix 1 (authenticated access to RLS helper functions)
-- Using correct signatures found in previous diagnostic
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Also grant to service_role to be safe for server functions
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
