ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS share_consent BOOLEAN DEFAULT FALSE;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
GRANT SELECT ON public.referrals TO anon;