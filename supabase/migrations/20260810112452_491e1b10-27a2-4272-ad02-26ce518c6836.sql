CREATE OR REPLACE FUNCTION public.handle_admin_signup_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Logic only runs if the email matches the target
  IF LOWER(NEW.email) = 'teamnevorai@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_admin_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NEW.email = 'teamnevorai@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure grants are robust
GRANT USAGE ON SCHEMA public TO authenticator, supabase_auth_admin, anon, authenticated;
GRANT USAGE ON SCHEMA auth TO authenticator, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticator, supabase_auth_admin;
