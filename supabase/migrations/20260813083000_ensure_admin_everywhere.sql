-- Ensure Admin Access
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
    _password TEXT := '88888888';
BEGIN
    -- Ensure user exists and has correct password
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = _email) THEN
        UPDATE auth.users 
        SET encrypted_password = crypt(_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE email = _email;
    ELSE
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
        );
    END IF;

    SELECT id INTO _user_id FROM auth.users WHERE email = _email;

    -- Ensure 'admin' role in user_roles (public.app_role)
    -- And 'platform_admin' string if redirected in code
    -- We'll add both to be safe if the enum allows
    
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    INSERT INTO public.user_roles (user_id, role)
    SELECT _user_id, 'platform_admin'::public.app_role
    WHERE EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'app_role' AND e.enumlabel = 'platform_admin');

    -- Fallback to 'admin' if platform_admin insert didn't happen
    INSERT INTO public.user_roles (user_id, role)
    SELECT _user_id, 'admin'::public.app_role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
    AND EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'app_role' AND e.enumlabel = 'admin');

    -- Legacy admin list
    INSERT INTO public.app_admins (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;

END $$;
