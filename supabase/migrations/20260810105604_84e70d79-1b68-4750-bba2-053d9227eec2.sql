-- THE HYBRID FIX: Bypass search_path and only update allowed auth columns
DO $$ 
BEGIN
  -- 1. Restore core schema usage for all internal proxy roles
  GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA auth TO authenticator, supabase_auth_admin;
  GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin;

  -- 2. Restore USAGE on the specific role type
  GRANT USAGE ON TYPE public.app_role TO authenticator, supabase_auth_admin, anon, authenticated, service_role;

  -- 3. SCHEMA-QUALIFY all function operations and harden their context via SET search_path
  -- This is the critical fix: it forces internal triggers to find objects in 'public' 
  -- even when the executing role (supabase_auth_admin) has search_path='auth'.
  ALTER FUNCTION public.handle_admin_signup_assignment() SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.handle_new_user_admin_assignment() SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.is_platform_admin(uuid) SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.is_tenant_member(uuid, uuid) SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.current_customer_ids(uuid) SECURITY DEFINER SET search_path = public, auth;
  ALTER FUNCTION public.can_access_customer(uuid, uuid) SECURITY DEFINER SET search_path = public, auth;

  -- 4. Restore and harden table permissions
  GRANT ALL PRIVILEGES ON public.user_roles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.profiles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.tenants TO supabase_auth_admin, authenticator, service_role;
  GRANT SELECT ON public.customers TO supabase_auth_admin, authenticator, service_role;
  
  -- 5. Restore sequence permissions
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin, service_role;

  -- 6. Ensure the admin user metadata is correct (avoiding generated columns)
  -- We don't touch confirmed_at if it's generated, but we can touch other metadata if needed.
  -- Most importantly, ensure the role exists.
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'teamnevorai@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;