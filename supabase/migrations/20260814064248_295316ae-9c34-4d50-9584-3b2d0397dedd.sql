-- Security fix: Remove hardcoded UUID bypass and use distributors table
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    _user_id UUID := auth.uid();
    _result JSON;
BEGIN
    IF _user_id IS NULL THEN
        RETURN json_build_object('role', 'guest');
    END IF;

    -- Standard lookup using tables
    SELECT json_build_object(
        'role', CASE 
            WHEN EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) THEN 'platform_admin'
            ELSE COALESCE((SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1), 'participant')
        END,
        'onboarding_complete', COALESCE((SELECT onboarding_complete FROM public.customers WHERE user_id = _user_id LIMIT 1), FALSE),
        'tenant_slug', COALESCE(
            (
                SELECT LOWER(REPLACE(d.name, ' ', '-'))
                FROM public.customers c 
                JOIN public.distributors d ON c.distributor_id = d.id 
                WHERE c.user_id = _user_id 
                LIMIT 1
            ), 
            'fat2fit'
        )
    ) INTO _result;

    RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO anon;
