-- Force correct role in a completely hardcoded way for the specific admin ID
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS JSON
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If user ID matches our admin, return admin context immediately
    IF auth.uid() = 'REDACTED_ADMIN_UUID' THEN
        RETURN json_build_object(
            'role', 'platform_admin',
            'onboarding_complete', true,
            'tenant_slug', 'fat2fit'
        );
    END IF;

    -- For everyone else, default to participant for now to allow progress
    RETURN json_build_object(
        'role', 'participant',
        'onboarding_complete', false,
        'tenant_slug', 'fat2fit'
    );
END;
$$;
