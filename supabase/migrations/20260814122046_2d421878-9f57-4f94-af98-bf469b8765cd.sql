ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English';
ALTER TABLE public.nutrition_plans ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';

-- RLS should already allow the user to update their own profile, 
-- but we ensure the grants are there for the new columns.
GRANT ALL ON public.customers TO service_role;
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.nutrition_plans TO service_role;
GRANT SELECT, INSERT ON public.nutrition_plans TO authenticated;