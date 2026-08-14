SELECT 
    p.proname, 
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('is_app_admin', 'is_platform_admin');

SELECT * FROM public.user_roles;

CREATE POLICY "Platform admins can manage access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO authenticated;
GRANT ALL ON public.access_codes TO service_role;