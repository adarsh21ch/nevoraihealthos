CREATE OR REPLACE FUNCTION public.get_my_auth_context()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    _user_id uuid := auth.uid();
    _role text;
    _tenant_slug text;
    _tenant_id uuid;
    _customer_id uuid;
    _onboarding_complete boolean := false;
BEGIN
    IF EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) THEN
        _role := 'platform_admin';
    ELSIF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id) THEN
        _role := 'tenant_owner';
        SELECT t.slug, t.id INTO _tenant_slug, _tenant_id
        FROM public.profiles p
        JOIN public.tenants t ON p.tenant_id = t.id
        WHERE p.user_id = _user_id
        LIMIT 1;
        _onboarding_complete := true;
    ELSIF EXISTS (SELECT 1 FROM public.customers WHERE user_id = _user_id) THEN
        _role := 'customer';
        SELECT t.slug, t.id, c.id, (c.health_consent_at IS NOT NULL)
          INTO _tenant_slug, _tenant_id, _customer_id, _onboarding_complete
        FROM public.customers c
        JOIN public.tenants t ON c.tenant_id = t.id
        WHERE c.user_id = _user_id
        LIMIT 1;
    END IF;

    RETURN json_build_object(
        'role', _role,
        'tenant_slug', _tenant_slug,
        'tenant_id', _tenant_id,
        'customer_id', _customer_id,
        'onboarding_complete', _onboarding_complete
    );
END;
$function$;