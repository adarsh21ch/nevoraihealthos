-- The "Total Fix": Schema-qualify all triggers to bypass ANY search_path issues
-- If the functions themselves are schema-qualified, the search_path of the role DOES NOT MATTER.
DO $$ 
BEGIN
  -- 1. Identify and schema-qualify all trigger functions on auth.users
  -- We redefine the triggers to use explicit 'public.' prefix
  DROP TRIGGER IF EXISTS tr_admin_signup_assignment ON auth.users;
  DROP TRIGGER IF EXISTS tr_on_auth_user_created_admin ON auth.users;

  CREATE TRIGGER tr_admin_signup_assignment 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_signup_assignment();

  CREATE TRIGGER tr_on_auth_user_created_admin 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin_assignment();

  -- 2. Ensure the functions themselves are hardened
  ALTER FUNCTION public.handle_admin_signup_assignment() SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.handle_new_user_admin_assignment() SECURITY DEFINER SET search_path = public;
  ALTER FUNCTION public.is_platform_admin(uuid) SECURITY DEFINER SET search_path = public;

  -- 3. Grant everything needed to the auth service
  GRANT USAGE ON SCHEMA public TO supabase_auth_admin, authenticator;
  GRANT USAGE ON TYPE public.app_role TO supabase_auth_admin, authenticator;
  GRANT ALL ON public.user_roles TO supabase_auth_admin, authenticator;
  GRANT SELECT ON public.profiles TO supabase_auth_admin, authenticator;

END $$;