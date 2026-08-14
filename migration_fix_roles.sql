-- 1. Update user roles for Krishna
DELETE FROM public.user_roles 
WHERE user_id = '193adc00-d5d6-4066-80a5-108f846395ba' 
  AND role IN ('admin', 'platform_admin');

INSERT INTO public.user_roles (user_id, role)
VALUES ('193adc00-d5d6-4066-80a5-108f846395ba', 'tenant_owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update RLS for access_codes
DROP POLICY IF EXISTS "admins manage access codes" ON public.access_codes;

CREATE POLICY "Platform admins can manage all access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenant owners can select their own codes"
ON public.access_codes
FOR SELECT
TO authenticated
USING (coach_id = auth.uid());

CREATE POLICY "Tenant owners can insert their own codes"
ON public.access_codes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'tenant_owner'));

CREATE POLICY "Tenant owners can delete their own codes"
ON public.access_codes
FOR DELETE
TO authenticated
USING (coach_id = auth.uid());
