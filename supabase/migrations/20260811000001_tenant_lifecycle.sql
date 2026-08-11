CREATE TABLE IF NOT EXISTS public.tenant_signup_credentials (
    tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    access_code text NOT NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_signup_credentials TO authenticated;
GRANT ALL ON public.tenant_signup_credentials TO service_role;

ALTER TABLE public.tenant_signup_credentials ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _uid
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Platform admins can manage credentials" ON public.tenant_signup_credentials;
CREATE POLICY "Platform admins can manage credentials"
ON public.tenant_signup_credentials
FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()));

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#16a34a';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
