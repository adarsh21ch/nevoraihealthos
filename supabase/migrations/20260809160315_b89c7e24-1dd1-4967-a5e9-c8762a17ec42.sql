-- Revoke public execute from security definer functions to address linter warnings
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_customer_ids(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) FROM public, anon, authenticated;

-- Ensure service_role and owner (postgres) can still execute them
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO service_role;