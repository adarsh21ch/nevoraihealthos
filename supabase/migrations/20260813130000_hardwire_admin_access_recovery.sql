-- 1. Ensure the hardwired user b1ed3b14... is in platform_admins
INSERT INTO public.platform_admins (user_id)
VALUES ('REDACTED_ADMIN_UUID')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Force the RPC to return the correct data for this ID, bypassing all table lookups if needed
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID := auth.uid();
BEGIN
    IF _user_id = 'REDACTED_ADMIN_UUID' THEN
        RETURN json_build_object(
            'role', 'platform_admin',
            'onboarding_complete', true,
            'tenant_slug', 'fat2fit'
        );
    END IF;

    -- Standard lookup for others
    RETURN (
        SELECT json_build_object(
            'role', COALESCE((SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1), 'participant'),
            'onboarding_complete', COALESCE((SELECT onboarding_complete FROM public.customers WHERE user_id = _user_id LIMIT 1), FALSE),
            'tenant_slug', COALESCE((SELECT t.slug FROM public.customers c JOIN public.tenants t ON c.tenant_id = t.id WHERE c.user_id = _user_id LIMIT 1), 'fat2fit')
        )
    );
END;
$$;

-- 3. Explicitly grant permission to call this function
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
