-- Create Admin Account
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
BEGIN
    -- 1. Create the user in auth.users if they don't exist
    -- We use the service_role key to bypass policies and use admin functions if needed,
    -- but here we are in a migration (privileged).
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    SELECT
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        _email,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Nevorai Admin"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = _email
    )
    RETURNING id INTO _user_id;

    -- If user already existed, get their ID
    IF _user_id IS NULL THEN
        SELECT id INTO _user_id FROM auth.users WHERE email = _email;
    END IF;

    -- 2. Ensure user has 'admin' role in user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- 3. Ensure user is in app_admins (legacy support for is_app_admin check)
    INSERT INTO public.app_admins (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END $$;
