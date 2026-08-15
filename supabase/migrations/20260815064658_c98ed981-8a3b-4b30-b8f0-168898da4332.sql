-- Re-define is_app_admin to match exact signature including default
CREATE OR REPLACE FUNCTION public.is_app_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _uid
  ) OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = _uid AND email = 'teamnevorai@gmail.com'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_app_admin(uuid) TO authenticated, service_role;

-- Fix customer visibility: Update policies to allow distributors to see their customers
DROP POLICY IF EXISTS "admins insert customers" ON public.customers;
DROP POLICY IF EXISTS "customers read own" ON public.customers;
DROP POLICY IF EXISTS "customers update own" ON public.customers;

-- Grant broad SELECT to authenticated users, filtered by distributor linkage
CREATE POLICY "Admins manage all customers"
ON public.customers FOR ALL
TO authenticated
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));

CREATE POLICY "Distributors see their customers"
ON public.customers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.distributors d
    WHERE d.user_id = auth.uid()
    AND d.id = customers.distributor_id
  )
);

CREATE POLICY "Customers see own profile"
ON public.customers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Customers update own profile"
ON public.customers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure the coach account is linked to the distributor
UPDATE public.distributors 
SET user_id = '193adc00-d5d6-4066-80a5-108f846395ba' 
WHERE name = 'Nevorai' AND user_id IS NULL;

-- Ensure registration_codes are readable by everyone
GRANT SELECT ON public.registration_codes TO anon, authenticated;
GRANT ALL ON public.registration_codes TO service_role;
