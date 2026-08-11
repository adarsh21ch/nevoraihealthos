CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    _user_id uuid := auth.uid();
    _role public.app_role;
    _tenant_slug text;
    _onboarding_complete boolean := false;
BEGIN
    SELECT role INTO _role 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    LIMIT 1;

    IF _role IS NULL THEN
        RETURN json_build_object('role', null);
    END IF;

    IF _role = 'tenant_owner' THEN
        SELECT t.slug INTO _tenant_slug
        FROM public.profiles p
        JOIN public.tenants t ON p.tenant_id = t.id
        WHERE p.user_id = _user_id
        LIMIT 1;
        _onboarding_complete := true;
    ELSIF _role = 'customer' THEN
        SELECT t.slug, (c.health_consent_at IS NOT NULL) INTO _tenant_slug, _onboarding_complete
        FROM public.customers c
        JOIN public.tenants t ON c.tenant_id = t.id
        WHERE c.user_id = _user_id
        LIMIT 1;
    END IF;

    RETURN json_build_object(
        'role', _role,
        'tenant_slug', _tenant_slug,
        'onboarding_complete', _onboarding_complete
    );
END;
$$;

DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'platform_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
