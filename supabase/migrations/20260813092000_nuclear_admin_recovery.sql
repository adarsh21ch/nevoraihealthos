-- 1. ENUM REPAIR
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'participant') THEN
        ALTER TYPE public.app_role ADD VALUE 'participant';
    END IF;
END $$;

-- 2. TABLE REPAIR
CREATE TABLE IF NOT EXISTS public.platform_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

-- 3. ADMIN SEED
DO $$
DECLARE
    _user_id UUID;
BEGIN
    SELECT id INTO _user_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF _user_id IS NOT NULL THEN
        INSERT INTO public.platform_admins (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
        
        -- Update user_roles if it exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
             DELETE FROM public.user_roles WHERE user_id = _user_id;
             INSERT INTO public.user_roles (user_id, role) 
             VALUES (_user_id, 'platform_admin'::public.app_role);
        END IF;
    END IF;
END $$;

-- 4. FUNCTION REPAIR
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID := auth.uid();
    _role TEXT;
    _is_platform_admin BOOLEAN;
BEGIN
    IF _user_id IS NULL THEN RETURN NULL; END IF;
    
    -- HARD CHECK platform_admins
    SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) INTO _is_platform_admin;

    IF _is_platform_admin THEN
        RETURN json_build_object(
            'role', 'platform_admin',
            'onboarding_complete', true,
            'tenant_slug', 'fat2fit'
        );
    END IF;

    -- Standard lookup...
    RETURN json_build_object(
        'role', 'participant',
        'onboarding_complete', false,
        'tenant_slug', 'fat2fit'
    );
END;
$$;
