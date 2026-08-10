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
  -- 1. Update customer profile
  UPDATE public.customers
  SET 
    name = _name,
    gender = _gender,
    age = _age,
    height_cm = _height_cm,
    goal_weight_kg = _goal_weight_kg,
    health_consent_at = COALESCE(health_consent_at, now())
  WHERE id = _customer_id;

  -- 2. Guard: Check for existing active enrollment
  IF EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE customer_id = _customer_id 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Active enrollment already exists';
  END IF;

  -- 3. Insert enrollment
  INSERT INTO public.enrollments (customer_id, program_id, start_date, status)
  VALUES (_customer_id, _program_id, _start_date, 'active');

  -- 4. Insert/Update Day-0 measurement
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

GRANT EXECUTE ON FUNCTION public.complete_onboarding TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding TO service_role;
