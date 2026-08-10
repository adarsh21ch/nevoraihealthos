-- Ensure the user exists and reset password to 88888888
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Try to find the user
  SELECT id INTO target_user_id FROM auth.users WHERE LOWER(email) = 'teamnevorai@gmail.com';
  
  -- 2. If user doesn't exist, create them manually via auth schema
  IF target_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'teamnevorai@gmail.com',
      crypt('88888888', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Platform Admin"}',
      now(),
      now()
    )
    RETURNING id INTO target_user_id;
  ELSE
    -- 3. If user exists, force password update
    UPDATE auth.users 
    SET encrypted_password = crypt('88888888', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = target_user_id;
  END IF;

  -- 4. Ensure the Admin role is assigned in user_roles
  -- Using a separate block to handle potentially missing table gracefully
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert into user_roles: %', SQLERRM;
  END;

END $$;
