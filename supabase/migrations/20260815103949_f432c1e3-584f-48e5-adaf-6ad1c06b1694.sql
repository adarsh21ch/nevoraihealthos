
-- Add columns to access_codes to support permanent master codes
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS is_permanent boolean DEFAULT false;
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS distributor_id uuid;

-- Update existing FAT2FIT code to be permanent if it exists, otherwise seed it
DO $$
DECLARE
    first_dist_id uuid;
BEGIN
    SELECT id INTO first_dist_id FROM public.distributors LIMIT 1;
    
    IF EXISTS (SELECT 1 FROM public.access_codes WHERE code = 'FAT2FIT') THEN
        UPDATE public.access_codes 
        SET is_permanent = true, distributor_id = COALESCE(distributor_id, first_dist_id)
        WHERE code = 'FAT2FIT';
    ELSIF first_dist_id IS NOT NULL THEN
        INSERT INTO public.access_codes (code, is_permanent, distributor_id)
        VALUES ('FAT2FIT', true, first_dist_id);
    END IF;
END $$;

-- RLS and Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO authenticated;
GRANT ALL ON public.access_codes TO service_role;
GRANT SELECT ON public.access_codes TO anon;

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Clean up policies before recreating
DROP POLICY IF EXISTS "Admins can manage all access codes" ON public.access_codes;
DROP POLICY IF EXISTS "Distributors can manage their own codes" ON public.access_codes;

-- Admins can do everything
CREATE POLICY "Admins can manage all access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Distributors can manage their own codes
CREATE POLICY "Distributors can manage their own codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.distributors
    WHERE user_id = auth.uid() AND id = access_codes.distributor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.distributors
    WHERE user_id = auth.uid() AND id = access_codes.distributor_id
  )
);
