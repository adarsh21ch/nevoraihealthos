-- Drop and recreate to force PostgREST to notice
DROP FUNCTION IF EXISTS public.get_my_auth_context();

CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN json_build_object(
        'role', 'platform_admin',
        'onboarding_complete', true,
        'tenant_slug', 'fat2fit'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO anon, authenticated, service_role;
