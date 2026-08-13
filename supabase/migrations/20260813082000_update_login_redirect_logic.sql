-- Fix get_my_auth_context and app_role to support login redirects
DO $$
BEGIN
    -- Ensure platform_admin and tenant_owner exist in app_role enum
    -- Check if they exist by trying to cast text to app_role
    BEGIN
        PERFORM 'platform_admin'::public.app_role;
    EXCEPTION WHEN invalid_text_representation THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END;
    
    BEGIN
        PERFORM 'tenant_owner'::public.app_role;
    EXCEPTION WHEN invalid_text_representation THEN
        ALTER TYPE public.app_role ADD VALUE 'tenant_owner';
    END;
END $$;

-- Update the admin user to have platform_admin role
UPDATE public.user_roles 
SET role = 'platform_admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teamnevorai@gmail.com');

-- Also ensure the admin function returns what's expected
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
    _tenant_slug TEXT;
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

    -- If coach/distributor, they might have a tenant slug
    -- For now, let's just make sure role is returned
    RETURN json_build_object(
        'role', _role,
        'onboarding_complete', COALESCE(_onboarding_complete, FALSE),
        'tenant_slug', NULL
    );
END;
$$;
