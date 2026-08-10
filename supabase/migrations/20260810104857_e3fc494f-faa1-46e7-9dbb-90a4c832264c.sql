-- Final cleanup and hardening of auth permissions
DO $$ 
BEGIN
  -- 1. Ensure schema usage
  GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
  GRANT USAGE ON SCHEMA public TO anon;
  GRANT USAGE ON SCHEMA public TO authenticated;

  -- 2. Ensure type usage
  GRANT USAGE ON TYPE public.app_role TO supabase_auth_admin;
  GRANT USAGE ON TYPE public.app_role TO anon;
  GRANT USAGE ON TYPE public.app_role TO authenticated;

  -- 3. Grant table permissions for auth triggers
  -- Both triggers (signup and new user) modify user_roles and profiles
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO supabase_auth_admin;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO supabase_auth_admin;

  -- 4. Grant execute on auth trigger functions
  GRANT EXECUTE ON FUNCTION public.handle_admin_signup_assignment() TO supabase_auth_admin;
  GRANT EXECUTE ON FUNCTION public.handle_new_user_admin_assignment() TO supabase_auth_admin;

  -- 5. Restore and harden RLS helper grants for app operation
  GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.current_customer_ids(uuid) TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.can_access_customer(uuid, uuid) TO authenticated, service_role;
  
  -- 6. Ensure service_role has all necessary permissions for staff functions
  GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;