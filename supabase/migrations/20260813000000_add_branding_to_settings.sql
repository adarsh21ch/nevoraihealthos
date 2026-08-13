-- Add logo_url to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS logo_url text;

-- Create branding bucket if it doesn't exist (handled via storage API usually, but SQL for reference)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true) ON CONFLICT DO NOTHING;

-- Ensure RLS allows admins to update settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.is_app_admin(auth.uid()))
  WITH CHECK (public.is_app_admin(auth.uid()));

-- Ensure everyone can read settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);
