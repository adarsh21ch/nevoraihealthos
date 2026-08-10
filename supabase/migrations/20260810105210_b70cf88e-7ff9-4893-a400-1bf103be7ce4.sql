-- Fix the syntax and grant manually for the critical type
DO $$ 
BEGIN
  -- 1. Restore core schema usage
  GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA auth TO authenticator, supabase_auth_admin;
  GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin;

  -- 2. Restore USAGE on the specific role type (manually, no ALL TYPES shorthand)
  GRANT USAGE ON TYPE public.app_role TO authenticator, supabase_auth_admin, anon, authenticated, service_role;

  -- 3. Restore and harden function permissions for the authenticator proxy
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticator, supabase_auth_admin, authenticated, service_role;
  
  -- Harden RLS helpers
  ALTER FUNCTION public.is_platform_admin(uuid) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.is_tenant_member(uuid, uuid) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.current_customer_ids(uuid) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.can_access_customer(uuid, uuid) SECURITY DEFINER SET search_path = public;

  -- 4. Restore table permissions for GoTrue (supabase_auth_admin)
  GRANT ALL PRIVILEGES ON public.user_roles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.profiles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.tenants TO supabase_auth_admin, authenticator, service_role;
  
  -- 5. Restore sequence permissions
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin, service_role;

  -- 6. Ensure the admin user exists in user_roles
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'teamnevorai@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;