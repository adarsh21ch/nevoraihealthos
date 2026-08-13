CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID;
    _role public.app_role;
    _onboarding_complete BOOLEAN;
BEGIN
    _user_id := auth.uid();
    
    SELECT role INTO _role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;

    SELECT onboarding_complete INTO _onboarding_complete
    FROM public.customers
    WHERE user_id = _user_id
    LIMIT 1;

    RETURN json_build_object(
        'role', _role,
        'onboarding_complete', COALESCE(_onboarding_complete, FALSE)
    );
END;
$$;
