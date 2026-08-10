-- Comprehensive restoration of permissions for ALL Supabase internal roles
DO $$ 
BEGIN
  -- 1. Restore core schema usage for ALL internal and user roles
  -- 'authenticator' is the proxy role through which all connections arrive.
  -- 'supabase_auth_admin' is the GoTrue management role.
  -- 'supabase_read_only_user' and 'postgres' should already have it, but hardening.
  GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA auth TO authenticator, supabase_auth_admin;
  GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin;

  -- 2. Restore type usage for the role enum
  GRANT USAGE ON TYPE public.app_role TO authenticator, supabase_auth_admin, anon, authenticated, service_role;

  -- 3. Restore and harden table permissions for internal roles
  -- GoTrue triggers and session management need access to these tables
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticator, supabase_auth_admin, service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticator, supabase_auth_admin, service_role;
  
  -- Also common metadata tables GoTrue might touch if it performs tenant lookups
  GRANT SELECT ON public.tenants TO authenticator, supabase_auth_admin, service_role;
  GRANT SELECT ON public.customers TO authenticator, supabase_auth_admin, service_role;

  -- 4. Restore and harden sequence usage
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin;

  -- 5. Harden function execution
  -- ALL security helpers must be executable by the authenticator to allow RLS to function
  GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticator, supabase_auth_admin, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticator, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticator, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticator, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticator, authenticated, service_role;

  -- 6. Set search_path on critical security functions to prevent GoTrue/PostgREST session path issues
  ALTER FUNCTION public.is_platform_admin(uuid) SET search_path = public;
  ALTER FUNCTION public.is_tenant_member(uuid, uuid) SET search_path = public;
  ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
  
  -- 7. Ensure admin role assignment is solid
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'teamnevorai@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;