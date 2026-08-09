GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticated;
