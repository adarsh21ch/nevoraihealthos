GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated to read user_roles" ON public.user_roles FOR SELECT TO authenticated USING (true);