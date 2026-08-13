-- Add logo_url to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS logo_url text;

-- Policies for branding bucket
-- 1. Public can read branding assets (since we want them visible on login/landing)
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
CREATE POLICY "Branding Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'branding');

-- 2. Admins manage branding assets
DROP POLICY IF EXISTS "Admins manage branding" ON storage.objects;
CREATE POLICY "Admins manage branding" ON storage.objects 
  FOR ALL TO authenticated 
  USING (bucket_id = 'branding' AND public.is_app_admin(auth.uid()))
  WITH CHECK (bucket_id = 'branding' AND public.is_app_admin(auth.uid()));

-- Settings policies
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.is_app_admin(auth.uid()))
  WITH CHECK (public.is_app_admin(auth.uid()));

-- Grant access to service role for functions
GRANT SELECT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
