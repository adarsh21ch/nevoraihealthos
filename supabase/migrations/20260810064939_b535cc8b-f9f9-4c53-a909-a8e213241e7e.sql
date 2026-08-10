-- 1. Refine complete_onboarding for consent and ownership
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  _customer_id uuid,
  _name text,
  _gender text,
  _age int,
  _height_cm numeric,
  _goal_weight_kg numeric,
  _program_id uuid,
  _start_date date,
  _weight_kg numeric,
  _waist_cm numeric,
  _hip_cm numeric DEFAULT NULL,
  _chest_cm numeric DEFAULT NULL,
  _thigh_cm numeric DEFAULT NULL,
  _arm_cm numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Ownership check (Fix 2)
  IF NOT public.can_access_customer(auth.uid(), _customer_id) THEN
    RAISE EXCEPTION 'Not authorised for this customer';
  END IF;

  -- Consent enforcement (Fix 1)
  IF NOT EXISTS (
    SELECT 1 FROM public.customers
    WHERE id = _customer_id AND health_consent_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Health consent required before completing onboarding';
  END IF;

  -- Update customer profile (Removed health_consent_at coalesce)
  UPDATE public.customers
  SET 
    name = _name,
    gender = _gender,
    age = _age,
    height_cm = _height_cm,
    goal_weight_kg = _goal_weight_kg
  WHERE id = _customer_id;

  -- Guard: Check for existing active enrollment
  IF EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE customer_id = _customer_id 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Active enrollment already exists';
  END IF;

  -- Insert enrollment
  INSERT INTO public.enrollments (customer_id, program_id, start_date, status)
  VALUES (_customer_id, _program_id, _start_date, 'active');

  -- Insert/Update Day-0 measurement
  INSERT INTO public.measurements (
    customer_id, 
    taken_on, 
    weight_kg, 
    waist_cm, 
    hip_cm, 
    chest_cm, 
    thigh_cm, 
    arm_cm
  )
  VALUES (
    _customer_id, 
    _start_date, 
    _weight_kg, 
    _waist_cm, 
    _hip_cm, 
    _chest_cm, 
    _thigh_cm, 
    _arm_cm
  )
  ON CONFLICT (customer_id, taken_on) 
  DO UPDATE SET
    weight_kg = EXCLUDED.weight_kg,
    waist_cm = EXCLUDED.waist_cm,
    hip_cm = EXCLUDED.hip_cm,
    chest_cm = EXCLUDED.chest_cm,
    thigh_cm = EXCLUDED.thigh_cm,
    arm_cm = EXCLUDED.arm_cm;
END;
$$;

-- 2. Hardened Progress Photo Privacy (Fix 3)
DROP POLICY IF EXISTS "Staff can view customer progress photos" ON storage.objects;

CREATE POLICY "Staff can view consented progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  EXISTS (
    SELECT 1
    FROM public.progress_photos p
    JOIN public.customers c ON c.id = p.customer_id
    WHERE p.storage_path = storage.objects.name
      AND p.share_consent = true
      AND public.can_access_customer(auth.uid(), c.id)
      AND c.user_id IS DISTINCT FROM auth.uid()
  )
);

-- 3. Allow photo retakes (UPDATE policy) (Fix 4)
CREATE POLICY "Users can update their own progress photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.current_customer_ids(auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.current_customer_ids(auth.uid())
  )
);