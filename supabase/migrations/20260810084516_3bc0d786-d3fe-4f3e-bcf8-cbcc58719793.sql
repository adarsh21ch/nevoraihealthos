DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE LOWER(email) = 'teamnevorai@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Force password reset to 88888888
    UPDATE auth.users 
    SET encrypted_password = crypt('88888888', gen_salt('bf')),
        email_confirmed_at = now(),
        last_sign_in_at = NULL,
        updated_at = now()
    WHERE id = target_user_id;

    -- Ensure Admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Ensure platform_admins entry
    INSERT INTO public.platform_admins (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
