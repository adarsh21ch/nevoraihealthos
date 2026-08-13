-- 1. Ensure the platform_admin role exists in the enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END IF;
END $$;

-- 2. Create the admin user in auth.users if not exists, and set password
-- Using a DO block to handle the user creation and role assignment
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
    _password TEXT := '88888888';
BEGIN
    -- Find or create the user
    SELECT id INTO _user_id FROM auth.users WHERE email = _email;
    
    IF _user_id IS NULL THEN
        _user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, is_super_admin, confirmed_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', _user_id, 'authenticated', 'authenticated', 
            _email, crypt(_password, gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Nevorai Admin"}',
            now(), now(), false, now()
        );
    ELSE
        UPDATE auth.users 
        SET encrypted_password = crypt(_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            confirmed_at = COALESCE(confirmed_at, now())
        WHERE id = _user_id;
    END IF;

    -- 3. Force Admin Identity in all relevant tables
    -- platform_admins table
    INSERT INTO public.platform_admins (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- user_roles table
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'platform_admin'::public.app_role);

    -- app_admins table (legacy)
    INSERT INTO public.app_admins (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END $$;

-- 4. Secure the auth context function with robust fallback
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
    IF _user_id IS NULL THEN RETURN NULL; END IF;
    
    -- Priority 1: Check platform_admins table (most secure for internal admins)
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    ) INTO _is_platform_admin;

    -- Priority 2: Get role from user_roles
    SELECT role INTO _role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;

    -- Override if platform admin
    IF _is_platform_admin THEN
        _role := 'platform_admin';
    END IF;

    -- Priority 3: Get customer status (for participants)
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
        'role', COALESCE(_role::text, 'participant'),
        'onboarding_complete', COALESCE(_onboarding_complete, FALSE),
        'tenant_slug', COALESCE(_tenant_slug, 'fat2fit'),
        'custom_domain', _custom_domain
    );
END;
$$;
