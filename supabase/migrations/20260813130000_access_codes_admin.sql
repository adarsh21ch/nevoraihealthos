CREATE TABLE IF NOT EXISTS public.access_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    used_at timestamptz,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO authenticated;
GRANT ALL ON public.access_codes TO service_role;
GRANT SELECT ON public.access_codes TO anon;

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'platform_admin'))
WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Anyone can read an unused code by literal match"
ON public.access_codes
FOR SELECT
TO anon, authenticated
USING (used_at IS NULL);
