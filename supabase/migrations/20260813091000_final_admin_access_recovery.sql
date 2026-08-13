-- 1. Ensure the platform_admin role exists in the app_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'tenant_owner') THEN
        ALTER TYPE public.app_role ADD VALUE 'tenant_owner';
    END IF;
END $$;

-- 2. Repair Admin Account and ensure it's in the hardwired table
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
    _password TEXT := '88888888';
BEGIN
    -- Create user if missing
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = _email) THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, is_super_admin, confirmed_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
            _email, crypt(_password, gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Nevorai Admin"}',
            now(), now(), false, now()
        );
    END IF;

    SELECT id INTO _user_id FROM auth.users WHERE email = _email;
    
    -- Force password and confirmation
    UPDATE auth.users 
    SET encrypted_password = crypt(_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmed_at = COALESCE(confirmed_at, now()),
        updated_at = now()
    WHERE id = _user_id;

    -- Hardwired platform admin entry
    INSERT INTO public.platform_admins (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
    
    -- Explicit role entry
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'platform_admin'::public.app_role);
END $$;

-- 3. Robust Auth Context with Hardwired Security
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID;
    _role TEXT;
    _is_platform_admin BOOLEAN;
    _onboarding_complete BOOLEAN;
    _tenant_slug TEXT;
    _custom_domain TEXT;
    _customer_id UUID;
BEGIN
    _user_id := auth.uid();
    IF _user_id IS NULL THEN RETURN NULL; END IF;
    
    -- Secure check: platform_admins table
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    ) INTO _is_platform_admin;

    -- Get role from user_roles (cast to text for safety)
    SELECT role::text INTO _role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;

    -- Override/Set if platform admin
    IF _is_platform_admin THEN
        _role := 'platform_admin';
    ELSIF _role IS NULL THEN
        _role := 'participant';
    END IF;

    -- Get relationship data
    SELECT 
        c.id,
        COALESCE(c.onboarding_complete, FALSE),
        t.slug,
        t.custom_domain
    INTO 
        _customer_id,
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
        'tenant_slug', COALESCE(_tenant_slug, 'fat2fit'),
        'custom_domain', _custom_domain,
        'customer_id', _customer_id
    );
END;
$$;

-- 4. Essential Grants for the Frontend to Read Its Own Identity
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.platform_admins TO authenticated;

-- Policies to allow users to see their own role/admin status
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own admin status" ON public.platform_admins;
CREATE POLICY "Users can view own admin status" ON public.platform_admins FOR SELECT TO authenticated USING (auth.uid() = user_id);
