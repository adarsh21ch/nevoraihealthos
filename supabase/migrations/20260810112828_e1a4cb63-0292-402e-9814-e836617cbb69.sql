-- Re-applying core fixes without the failing function alter
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, authenticator;
ALTER ROLE authenticator SET search_path = public, auth;
ALTER ROLE authenticated SET search_path = public, auth;
ALTER ROLE anon SET search_path = public, auth;
GRANT SELECT ON auth.users TO authenticated, authenticator;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _uid AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _uid
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.platform_admins (user_id)
        VALUES (target_user_id)
        ON CONFLICT (user_id) DO NOTHING;
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
