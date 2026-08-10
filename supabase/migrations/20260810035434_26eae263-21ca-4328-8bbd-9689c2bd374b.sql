-- Per-tenant signup gate — simplified, no longer holds fbo_id (that's per-customer now)
CREATE TABLE public.tenant_signup_credentials (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants ON DELETE CASCADE,
  access_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grant Access
GRANT SELECT ON public.tenant_signup_credentials TO service_role;
GRANT ALL ON public.tenant_signup_credentials TO service_role;

-- RLS enabled, ZERO policies.
ALTER TABLE public.tenant_signup_credentials ENABLE ROW LEVEL SECURITY;

-- customers table changes (customers table already exists from Phase 1):
ALTER TABLE public.customers
  ADD COLUMN fbo_id text NOT NULL,
  ADD COLUMN email text,
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.customers ADD CONSTRAINT customers_fbo_id_key UNIQUE (fbo_id);
ALTER TABLE public.customers ADD CONSTRAINT customers_email_key UNIQUE (email);
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_tenant_id_phone_key;
ALTER TABLE public.customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
