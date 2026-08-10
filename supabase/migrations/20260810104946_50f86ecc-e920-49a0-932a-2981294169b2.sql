-- Final, comprehensive restoration of GoTrue health and admin permissions
DO $$ 
BEGIN
  -- 1. Restore core schema usage for all critical roles
  GRANT USAGE ON SCHEMA public TO supabase_auth_admin, anon, authenticated;
  GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
  GRANT USAGE ON SCHEMA extensions TO supabase_auth_admin;

  -- 2. Restore type usage for the role enum
  GRANT USAGE ON TYPE public.app_role TO supabase_auth_admin, anon, authenticated;

  -- 3. Restore and harden table permissions for GoTrue (supabase_auth_admin)
  -- GoTrue triggers handle_admin_signup_assignment and handle_new_user_admin_assignment
  -- These triggers perform INSERTs on public.user_roles and potentially read public.profiles
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO supabase_auth_admin;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO supabase_auth_admin;
  -- Granting sequence usage if any exist for these tables
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

  -- 4. Restore and harden function execution
  -- Auth triggers
  GRANT EXECUTE ON FUNCTION public.handle_admin_signup_assignment() TO supabase_auth_admin;
  GRANT EXECUTE ON FUNCTION public.handle_new_user_admin_assignment() TO supabase_auth_admin;
  
  -- Security helpers (used in RLS policies)
  GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role, supabase_auth_admin;
  GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticated, service_role;

  -- 5. Set search_path on trigger functions to be safe from GoTrue session settings
  ALTER FUNCTION public.handle_admin_signup_assignment() SET search_path = public;
  ALTER FUNCTION public.handle_new_user_admin_assignment() SET search_path = public;
  ALTER FUNCTION public.is_platform_admin(uuid) SET search_path = public;

  -- 6. Ensure the admin user exists in user_roles
  -- Using a subquery to find the ID if it exists
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'teamnevorai@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;