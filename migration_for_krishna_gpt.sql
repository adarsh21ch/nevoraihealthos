# Fat2Fit (Health OS) - Multi-Language Support Migration

-- This SQL script adds the necessary columns to enable persistent language preferences
-- for the AI Nutrition Engine and Coach Assistant.

-- 1. Add preferred_language to customers (Profile level)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English';

-- 2. Add language to nutrition_plans (Plan level context)
ALTER TABLE public.nutrition_plans 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';

-- 3. Update existing records to default 'English'
UPDATE public.customers SET preferred_language = 'English' WHERE preferred_language IS NULL;
UPDATE public.nutrition_plans SET language = 'English' WHERE language IS NULL;

-- 4. Grant access (Required for Supabase Data API)
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.nutrition_plans TO authenticated;
