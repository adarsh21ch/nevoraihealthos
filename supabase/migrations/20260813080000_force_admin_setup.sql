-- Force Admin Setup
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
BEGIN
    -- 1. Ensure user exists
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at
    )
    SELECT 
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
        _email, now(),
        '{"provider":"email","providers":["email"]}', '{"full_name":"Nevorai Admin"}',
        now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = _email);

    SELECT id INTO _user_id FROM auth.users WHERE email = _email;

    -- Update password explicitly
    UPDATE auth.users 
        updated_at = now(),
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = _user_id;

    -- 2. Clean and Insert roles
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');

    DELETE FROM public.app_admins WHERE user_id = _user_id;
    INSERT INTO public.app_admins (user_id) VALUES (_user_id);
END $$;
