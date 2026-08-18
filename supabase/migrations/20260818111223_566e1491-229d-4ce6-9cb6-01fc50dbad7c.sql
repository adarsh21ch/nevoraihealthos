CREATE OR REPLACE FUNCTION public.is_dashboard_staff(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_app_admin(_uid) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role IN ('admin','platform_admin','tenant_owner','coach')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_dashboard_staff(uuid) TO authenticated, service_role;