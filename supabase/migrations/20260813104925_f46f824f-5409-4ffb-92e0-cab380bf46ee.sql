
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS dob date,
ADD COLUMN IF NOT EXISTS target_weight_kg numeric,
ADD COLUMN IF NOT EXISTS lifestyle text,
ADD COLUMN IF NOT EXISTS lifestyle_details jsonb,
ADD COLUMN IF NOT EXISTS activity_level text,
ADD COLUMN IF NOT EXISTS diet_preference text,
ADD COLUMN IF NOT EXISTS allergies text[],
ADD COLUMN IF NOT EXISTS disliked_foods text[],
ADD COLUMN IF NOT EXISTS cooking_access text,
ADD COLUMN IF NOT EXISTS meal_timing jsonb,
ADD COLUMN IF NOT EXISTS health_concerns text,
ADD COLUMN IF NOT EXISTS hip_cm numeric,
ADD COLUMN IF NOT EXISTS thigh_cm numeric,
ADD COLUMN IF NOT EXISTS weight_kg numeric,
ADD COLUMN IF NOT EXISTS waist_cm numeric;

-- Grant access to authenticated users
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
