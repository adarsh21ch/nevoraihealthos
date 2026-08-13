
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS goal text;

-- Re-grant access
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
