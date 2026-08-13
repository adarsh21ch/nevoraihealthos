-- 1. Ensure absolute base roles exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'platform_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'participant') THEN
        ALTER TYPE public.app_role ADD VALUE 'participant';
    END IF;
END $$;

-- 2. Repair schema: Ensure platform_admins exists
CREATE TABLE IF NOT EXISTS public.platform_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. The Source of Truth: Auth Context Resolver
-- This function MUST return a valid role and tenant for PostgREST/Vite to proceed.
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

    -- A. Platform Admin Logic (Highest Priority)
    SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) INTO _is_platform_admin;
    
    -- B. Role Discovery
    IF _is_platform_admin THEN
        _role := 'platform_admin';
    ELSE
        SELECT role::text INTO _role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
    END IF;

    -- C. Customer Data Discovery
    SELECT c.id, COALESCE(c.onboarding_complete, FALSE), t.slug 
    INTO _customer_id, _onboarding_complete, _tenant_slug
    FROM public.customers c
    JOIN public.tenants t ON c.tenant_id = t.id
    WHERE c.user_id = _user_id
    LIMIT 1;

    -- D. Safe Defaults (Post-signup state)
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

-- 4. Permission Bridge: Grants and RLS
GRANT SELECT ON public.tenants TO anon, authenticated;
GRANT SELECT ON public.customers TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;

-- Ensure RLS doesn't block identity resolution
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can view own customer profile" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Seed essential infrastructure
INSERT INTO public.tenants (name, slug) VALUES ('Fat2Fit', 'fat2fit') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.access_codes (code, tenant_id)
SELECT 'FAT2FIT', id FROM public.tenants WHERE slug = 'fat2fit'
ON CONFLICT (code) DO NOTHING;
