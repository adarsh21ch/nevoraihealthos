CREATE TABLE IF NOT EXISTS public.tenant_signup_credentials (
    tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    access_code text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Access code is sensitive. Only platform admins or service role should touch this.
-- Customers use a server function to check it, they don't read the table.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_signup_credentials TO authenticated;
GRANT ALL ON public.tenant_signup_credentials TO service_role;

ALTER TABLE public.tenant_signup_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage credentials"
ON public.tenant_signup_credentials
FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- Modify tenants table to add logo and primary color if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'logo_url') THEN
        ALTER TABLE public.tenants ADD COLUMN logo_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'primary_color') THEN
        ALTER TABLE public.tenants ADD COLUMN primary_color text DEFAULT '#16a34a';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'tagline') THEN
        ALTER TABLE public.tenants ADD COLUMN tagline text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'whatsapp_number') THEN
        ALTER TABLE public.tenants ADD COLUMN whatsapp_number text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'phone') THEN
        ALTER TABLE public.tenants ADD COLUMN phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'email') THEN
        ALTER TABLE public.tenants ADD COLUMN email text;
    END IF;
END
$$;
