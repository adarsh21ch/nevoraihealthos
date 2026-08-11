CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    _user_id uuid := auth.uid();
    _role text;
    _tenant_slug text;
    _onboarding_complete boolean := false;
BEGIN
    -- Check for Platform Admin
    IF EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) THEN
        _role := 'platform_admin';
    -- Check for Tenant Owner (Staff/Profile member)
    ELSIF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id) THEN
        _role := 'tenant_owner';
        SELECT t.slug INTO _tenant_slug
        FROM public.profiles p
        JOIN public.tenants t ON p.tenant_id = t.id
        WHERE p.user_id = _user_id
        LIMIT 1;
        _onboarding_complete := true;
    -- Check for Customer
    ELSIF EXISTS (SELECT 1 FROM public.customers WHERE user_id = _user_id) THEN
        _role := 'customer';
        SELECT t.slug, (c.health_consent_at IS NOT NULL) INTO _tenant_slug, _onboarding_complete
        FROM public.customers c
        JOIN public.tenants t ON c.tenant_id = t.id
        WHERE c.user_id = _user_id
        LIMIT 1;
    END IF;

    RETURN json_build_object(
        'role', _role,
        'tenant_slug', _tenant_slug,
        'onboarding_complete', _onboarding_complete
    );
END;
$$;

-- Drop the unused user_roles and app_role if they exist
DROP TABLE IF EXISTS public.user_roles;
-- We keep the enum for now in case it's used elsewhere, but usually it can be dropped too
-- DROP TYPE IF EXISTS public.app_role;

GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO service_role;
