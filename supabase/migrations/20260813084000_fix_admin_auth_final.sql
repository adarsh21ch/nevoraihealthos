-- Force correct role and admin status for teamnevorai@gmail.com
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
BEGIN
    SELECT id INTO _user_id FROM auth.users WHERE email = _email;
    
    IF _user_id IS NOT NULL THEN
        -- 1. Ensure user is in platform_admins
        INSERT INTO public.platform_admins (user_id)
        VALUES (_user_id)
        ON CONFLICT (user_id) DO NOTHING;

        -- 2. Ensure user has 'platform_admin' role in user_roles
        -- Delete any conflicting roles first
        DELETE FROM public.user_roles WHERE user_id = _user_id;
        
        -- Insert with the correct cast
        INSERT INTO public.user_roles (user_id, role)
        VALUES (_user_id, 'platform_admin'::public.app_role);
    END IF;
END $$;

-- Fix the auth context function to properly check both platform_admins and user_roles
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID;
    _role public.app_role;
    _is_platform_admin BOOLEAN;
    _onboarding_complete BOOLEAN;
    _tenant_slug TEXT;
    _custom_domain TEXT;
BEGIN
    _user_id := auth.uid();
    
    -- Check platform admin status
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    ) INTO _is_platform_admin;

    -- Get role from user_roles
    SELECT role INTO _role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;

    -- If they are in platform_admins but don't have the role, treat them as platform_admin
    IF _is_platform_admin AND (_role IS NULL OR _role != 'platform_admin') THEN
        _role := 'platform_admin';
    END IF;

    -- Get customer status
    SELECT 
        COALESCE(onboarding_complete, FALSE),
        t.slug,
        t.custom_domain
    INTO 
        _onboarding_complete,
        _tenant_slug,
        _custom_domain
    FROM public.customers c
    JOIN public.tenants t ON c.tenant_id = t.id
    WHERE c.user_id = _user_id
    LIMIT 1;

    RETURN json_build_object(
        'role', _role,
        'onboarding_complete', COALESCE(_onboarding_complete, FALSE),
        'tenant_slug', _tenant_slug,
        'custom_domain', _custom_domain
    );
END;
$$;
