-- Update the password for teamnevorai@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE LOWER(email) = 'teamnevorai@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    UPDATE auth.users 
    SET encrypted_password = crypt('88888888', gen_salt('bf'))
    WHERE id = target_user_id;
  END IF;
END $$;
