-- Clean break migration
CREATE TABLE IF NOT EXISTS public.registration_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true
);

ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage registration codes" ON public.registration_codes;
DROP POLICY IF EXISTS "Public read registration codes" ON public.registration_codes;

CREATE POLICY "Admins manage registration codes"
ON public.registration_codes
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'teamnevorai@gmail.com'
);

CREATE POLICY "Public read registration codes"
ON public.registration_codes
FOR SELECT
TO anon, authenticated
USING (is_active = true);

INSERT INTO public.registration_codes (code, is_active)
VALUES ('FAT2FIT', true)
ON CONFLICT (code) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_codes TO authenticated;
GRANT ALL ON public.registration_codes TO service_role;
GRANT SELECT ON public.registration_codes TO anon;
