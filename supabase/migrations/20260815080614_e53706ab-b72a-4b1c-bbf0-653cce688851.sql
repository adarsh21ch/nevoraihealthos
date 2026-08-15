-- 1. SECURITY DEFINER function to validate code without exposing it to client
CREATE OR REPLACE FUNCTION public.validate_registration_code(_code text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registration_codes
    WHERE upper(code) = upper(_code) AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.validate_registration_code(text) TO anon, authenticated;

-- 2. SECURITY DEFINER function to complete registration for the CURRENTLY AUTHENTICATED user
CREATE OR REPLACE FUNCTION public.complete_registration(_code text, _fbo_id text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _dist_id uuid;
  _customer_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Use the new validation function
  IF NOT public.validate_registration_code(_code) THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  -- Check if customer already exists for this user
  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = _uid) THEN
    SELECT id INTO _customer_id FROM public.customers WHERE user_id = _uid;
    RETURN _customer_id;
  END IF;

  -- Get email from auth.users (accessible via SECURITY DEFINER)
  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  -- Find default distributor
  SELECT id INTO _dist_id FROM public.distributors ORDER BY is_default DESC NULLS LAST LIMIT 1;

  -- Insert customer row
  INSERT INTO public.customers (user_id, email, fbo_id, distributor_id, name, onboarding_complete)
  VALUES (_uid, _email, _fbo_id, _dist_id, split_part(_email, '@', 1), false)
  RETURNING id INTO _customer_id;

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'participant'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _customer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_registration(text, text) TO authenticated;

-- 3. Drop policy that lets anonymous users read codes
DROP POLICY IF EXISTS "Public read registration codes" ON public.registration_codes;
DROP POLICY IF EXISTS "registration_codes_select_policy" ON public.registration_codes;

-- 4. Ensure we have the FAT2FIT code
INSERT INTO public.registration_codes (code, is_active)
VALUES ('FAT2FIT', true)
ON CONFLICT (code) DO UPDATE SET is_active = true;