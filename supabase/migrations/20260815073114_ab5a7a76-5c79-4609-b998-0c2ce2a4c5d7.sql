-- Security Definer RPC for public validation
CREATE OR REPLACE FUNCTION public.is_registration_code_valid(_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registration_codes
    WHERE code = UPPER(_code)
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_registration_code_valid(text) TO anon, authenticated, service_role;

-- Ensure we have the default code
INSERT INTO public.registration_codes (code, is_active)
VALUES ('FAT2FIT', true)
ON CONFLICT (code) DO UPDATE SET is_active = true;
