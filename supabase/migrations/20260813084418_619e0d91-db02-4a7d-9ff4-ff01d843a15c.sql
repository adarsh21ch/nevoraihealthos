ALTER TABLE public.customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN distributor_id DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN track DROP NOT NULL;
ALTER TABLE public.customers ALTER COLUMN language DROP NOT NULL;

ALTER TABLE public.customers ALTER COLUMN onboarding_complete SET DEFAULT false;
ALTER TABLE public.customers ALTER COLUMN share_consent SET DEFAULT false;

INSERT INTO public.distributors (id, name, is_default)
VALUES ('00000000-0000-0000-0000-000000000000', 'System Default', true)
ON CONFLICT (id) DO NOTHING;
