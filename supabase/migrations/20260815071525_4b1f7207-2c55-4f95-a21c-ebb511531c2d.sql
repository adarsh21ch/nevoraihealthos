-- 1. Redefine the unified authorization function
-- SECURITY DEFINER allows this function to bypass RLS and read auth.users safely
CREATE OR REPLACE FUNCTION public.has_elevated_access(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Check if user is a platform admin (linked to hardcoded email or explicitly in table)
  IF EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _uid) THEN
    RETURN true;
  END IF;

  -- 2. Fallback for the platform admin email check (SAFE here because of SECURITY DEFINER)
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = _uid AND email = 'teamnevorai@gmail.com') THEN
    -- Auto-seed them into platform_admins if they aren't there yet
    INSERT INTO public.platform_admins (user_id) VALUES (_uid) ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;

  -- 3. Check for specific elevated roles in user_roles
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role::text IN ('admin', 'platform_admin', 'tenant_owner', 'coach')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_elevated_access(uuid) TO authenticated, service_role;

-- 2. Clean up Registration Codes policies
DROP POLICY IF EXISTS "Admins manage registration codes" ON public.registration_codes;
DROP POLICY IF EXISTS "Public read registration codes" ON public.registration_codes;
DROP POLICY IF EXISTS "Elevated users manage registration codes" ON public.registration_codes;

CREATE POLICY "Elevated users manage registration codes"
ON public.registration_codes
FOR ALL
TO authenticated
USING (public.has_elevated_access(auth.uid()))
WITH CHECK (public.has_elevated_access(auth.uid()));

-- No more public read! Validation happens in server functions or via is_registration_code_valid RPC
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_codes TO authenticated;
GRANT SELECT ON public.registration_codes TO service_role;

-- 3. Audit and fix Customers policies to avoid auth.users lookups
DROP POLICY IF EXISTS "Distributors can see their own customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can see all customers" ON public.customers;

CREATE POLICY "Elevated users view all customers"
ON public.customers
FOR SELECT
TO authenticated
USING (public.has_elevated_access(auth.uid()));

CREATE POLICY "Elevated users manage all customers"
ON public.customers
FOR ALL
TO authenticated
USING (public.has_elevated_access(auth.uid()))
WITH CHECK (public.has_elevated_access(auth.uid()));

-- 4. Seed the platform admin if user exists
DO $$
DECLARE
    _user_id uuid;
BEGIN
    SELECT id INTO _user_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF _user_id IS NOT NULL THEN
        INSERT INTO public.platform_admins (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
    END IF;
END $$;
