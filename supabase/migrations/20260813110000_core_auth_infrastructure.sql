-- 1. Ensure essential roles exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'participant') THEN
        ALTER TYPE public.app_role ADD VALUE 'participant';
    END IF;
END $$;

-- 2. Clean and rebuild the get_my_auth_context function
-- This is the single source of truth for the frontend identity.
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID := auth.uid();
    _role TEXT;
    _onboarding_complete BOOLEAN := FALSE;
    _tenant_slug TEXT := 'fat2fit';
    _customer_id UUID;
    _is_platform_admin BOOLEAN;
BEGIN
    IF _user_id IS NULL THEN RETURN NULL; END IF;

    -- A. Check for platform admin (hardwired table)
    SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) INTO _is_platform_admin;
    
    -- B. Get primary role
    IF _is_platform_admin THEN
        _role := 'platform_admin';
    ELSE
        SELECT role::text INTO _role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
    END IF;

    -- C. Get customer/participant state
    SELECT id, COALESCE(onboarding_complete, FALSE), t.slug 
    INTO _customer_id, _onboarding_complete, _tenant_slug
    FROM public.customers c
    LEFT JOIN public.tenants t ON c.tenant_id = t.id
    WHERE c.user_id = _user_id
    LIMIT 1;

    -- D. Fallbacks
    IF _role IS NULL THEN
        _role := 'participant';
    END IF;
    
    IF _tenant_slug IS NULL THEN
        _tenant_slug := 'fat2fit';
    END IF;

    RETURN json_build_object(
        'role', _role,
        'onboarding_complete', _onboarding_complete,
        'tenant_slug', _tenant_slug,
        'customer_id', _customer_id
    );
END;
$$;

-- 3. Ensure global access code exists for signups
INSERT INTO public.access_codes (code, tenant_id)
SELECT 'FAT2FIT', id FROM public.tenants WHERE slug = 'fat2fit'
ON CONFLICT (code) DO NOTHING;

-- 4. Correct Permissions (PostgREST requires explicit grants)
GRANT SELECT ON public.tenants TO anon, authenticated;
GRANT SELECT ON public.customers TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;

-- 5. RLS for identity resolution
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own customer profile" ON public.customers;
CREATE POLICY "Users can view own customer profile" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
