CREATE OR REPLACE FUNCTION public.complete_registration(_code text, _fbo_id text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _dist_id uuid;
  _customer_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.validate_registration_code(_code) THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = _uid) THEN
    SELECT id INTO _customer_id FROM public.customers WHERE user_id = _uid;
    RETURN _customer_id;
  END IF;

  -- Pick the default distributor
  SELECT id INTO _dist_id FROM public.distributors ORDER BY is_default DESC NULLS LAST LIMIT 1;

  -- Insert customer row WITHOUT the email column since it is missing in the physical schema
  INSERT INTO public.customers (user_id, fbo_id, distributor_id, name, onboarding_complete)
  VALUES (_uid, _fbo_id, _dist_id, '', false)
  RETURNING id INTO _customer_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'participant'::public.app_role)
  ON CONFLICT DO NOTHING;

  RETURN _customer_id;
END;
$$;