-- THE PERMANENT ROOT CAUSE FIX: Schema qualification and explicit USAGE
-- We fix the fundamental mismatch between GoTrue's role configuration and the app's schema.
DO $$ 
BEGIN
  -- 1. Restore core schema usage for ALL internal proxy roles
  GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA auth TO authenticator, supabase_auth_admin;
  GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin;

  -- 2. Restore USAGE on the specific role type (app_role)
  GRANT USAGE ON TYPE public.app_role TO authenticator, supabase_auth_admin, anon, authenticated, service_role;

  -- 3. SCHEMA-QUALIFY all trigger definitions on auth.users
  -- This is the #1 root cause: GoTrue (supabase_auth_admin) has search_path='auth'.
  -- If a trigger points to 'handle_new_user_admin_assignment()', it fails because it's in 'public'.
  DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users;
  DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users;

  CREATE TRIGGER tr_admin_signup_assignment 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_signup_assignment();

  CREATE TRIGGER tr_on_auth_user_created_admin 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin_assignment();

  -- 4. Set explicit search_path ON THE FUNCTIONS themselves
  -- This overrides the role-level search_path and ensures internal queries always find public objects.
  ALTER FUNCTION public.handle_admin_signup_assignment() SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.handle_new_user_admin_assignment() SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.is_platform_admin(uuid) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.is_tenant_member(uuid, uuid) SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER SET search_path = public;

  -- 5. Restore table and sequence permissions for auth operations
  GRANT ALL PRIVILEGES ON public.user_roles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.profiles TO supabase_auth_admin, authenticator, service_role;
  GRANT ALL PRIVILEGES ON public.tenants TO supabase_auth_admin, authenticator, service_role;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin, service_role;

  -- 6. Ensure the admin user is confirmed and linked
  -- Note: Not touching generated columns, just ensuring role exists.
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'teamnevorai@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;