-- Comprehensive fix for "Database error querying schema" and login failure

-- 1. Ensure basic schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, authenticator;

-- 2. Configure roles to prioritize public and auth schemas
ALTER ROLE authenticator SET search_path = public, auth;
ALTER ROLE authenticated SET search_path = public, auth;
ALTER ROLE anon SET search_path = public, auth;

-- 3. Grant necessary permissions for Auth to function
GRANT SELECT ON auth.users TO authenticator, authenticated;
GRANT SELECT ON pg_type TO authenticator, anon, authenticated;
GRANT SELECT ON pg_enum TO authenticator, anon, authenticated;

-- 4. Audit and clean up any problematic triggers on auth.users
-- Drop triggers that might be calling public functions without proper search paths or permissions
DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Re-create the user roles and platform admin system robustly
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

-- 6. Define security functions with explicit search_path (CRITICAL)
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

GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- 7. Ensure your admin account is correctly set up
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF target_user_id IS NOT NULL THEN
        -- Insert into both potential admin storage tables
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_admins') THEN
            INSERT INTO public.platform_admins (user_id)
            VALUES (target_user_id)
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
        
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
