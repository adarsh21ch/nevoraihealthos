CREATE OR REPLACE FUNCTION public.complete_onboarding(
  _customer_id uuid,
  _name text,
  _gender text,
  _age integer,
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ownership check
  IF NOT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = _customer_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    -- Fallback check for tenant owners or admins using the defined helper
    IF NOT public.has_role(auth.uid(), 'admin') AND NOT public.has_role(auth.uid(), 'moderator') THEN
       RAISE EXCEPTION 'Not authorised for this customer';
    END IF;
  END IF;

  -- Update customer profile
  UPDATE public.customers
  SET 
    name = _name,
    gender = _gender,
    age = _age,
    height_cm = _height_cm,
    goal_weight_kg = _goal_weight_kg,
    onboarding_complete = true,
    weight_kg = _weight_kg -- Store current weight on profile too for diet plan
  WHERE id = _customer_id;

  -- Guard: Check for existing active enrollment
  IF EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE customer_id = _customer_id 
    AND status = 'active'
  ) THEN
    -- If already exists, just update it instead of failing
    UPDATE public.enrollments 
    SET program_id = _program_id, start_date = _start_date
    WHERE customer_id = _customer_id AND status = 'active';
  ELSE
    -- Insert enrollment
    INSERT INTO public.enrollments (customer_id, program_id, start_date, status)
    VALUES (_customer_id, _program_id, _start_date, 'active');
  END IF;

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