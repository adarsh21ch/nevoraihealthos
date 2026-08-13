-- Just fix the columns first to stop the build errors
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.access_codes ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS coach_id uuid REFERENCES public.user_roles(id);
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS expires_at timestamptz;
