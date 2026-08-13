-- Update Admin Password and Role
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
    _password TEXT := '88888888';
BEGIN
    -- 1. Get user ID
    SELECT id INTO _user_id FROM auth.users WHERE email = _email;

    IF _user_id IS NOT NULL THEN
        -- Update password
        UPDATE auth.users 
        SET encrypted_password = crypt(_password, gen_salt('bf')),
            updated_at = now()
        WHERE id = _user_id;

        -- 2. Ensure user has 'admin' role in user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- 3. Ensure user is in app_admins
        INSERT INTO public.app_admins (user_id)
        VALUES (_user_id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        -- Create user if not exists (fallback)
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
            _email, crypt(_password, gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{"full_name":"Nevorai Admin"}',
            now(), now()
        )
        RETURNING id INTO _user_id;

        INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
        INSERT INTO public.app_admins (user_id) VALUES (_user_id);
    END IF;
END $$;
