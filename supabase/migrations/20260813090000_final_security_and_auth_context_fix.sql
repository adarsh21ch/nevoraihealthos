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

-- 2. Secure and optimize get_my_auth_context
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
    _customer_id UUID;
BEGIN
    _user_id := auth.uid();
    IF _user_id IS NULL THEN RETURN NULL; END IF;
    
    -- Check platform_admins table for hardwired admin status
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    ) INTO _is_platform_admin;

    -- Get explicit role from user_roles
    SELECT role INTO _role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;

    -- Override if explicitly a platform admin in the backend table
    IF _is_platform_admin THEN
        _role := 'platform_admin';
    END IF;

    -- Default to participant if no role assigned yet (standard signup flow)
    IF _role IS NULL THEN
        _role := 'participant';
    END IF;

    -- Get customer relationship
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

-- 3. Fix user_roles RLS to allow users to see their own role (needed for the above RPC to work for the user)
-- First ensure the table is readable by authenticated users for their own rows
GRANT SELECT ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. Seed/Repair Admin Account
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
BEGIN
    SELECT id INTO _user_id FROM auth.users WHERE email = _email;
    
    IF _user_id IS NOT NULL THEN
        -- Force correct admin state
        INSERT INTO public.platform_admins (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
        
        DELETE FROM public.user_roles WHERE user_id = _user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'platform_admin'::public.app_role);
        
        UPDATE auth.users 
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            confirmed_at = COALESCE(confirmed_at, now())
        WHERE id = _user_id;
    END IF;
END $$;
