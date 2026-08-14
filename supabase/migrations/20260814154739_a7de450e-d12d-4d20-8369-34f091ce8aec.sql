CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role::text = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- Ensure the admin emails have the 'admin' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role 
FROM auth.users 
WHERE email IN ('teamnevorai@gmail.com', 'krishnaaroraflp@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix access_codes policies
DROP POLICY IF EXISTS "admins manage access codes" ON public.access_codes;
DROP POLICY IF EXISTS "Platform admins can manage access codes" ON public.access_codes;
DROP POLICY IF EXISTS "Anyone can check a code" ON public.access_codes;

CREATE POLICY "Anyone can check a code"
ON public.access_codes
FOR SELECT
TO anon, authenticated
USING (used_at IS NULL);

CREATE POLICY "Admins manage access codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO authenticated;
GRANT SELECT ON public.access_codes TO anon;
GRANT ALL ON public.access_codes TO service_role;