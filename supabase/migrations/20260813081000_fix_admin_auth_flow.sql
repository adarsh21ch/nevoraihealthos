-- Fix Admin Auth Flow
DO $$
DECLARE
    _user_id UUID;
    _email TEXT := 'teamnevorai@gmail.com';
    _password TEXT := '88888888';
BEGIN
    -- 1. Get user ID
    SELECT id INTO _user_id FROM auth.users WHERE email = _email;

    IF _user_id IS NOT NULL THEN
        -- Force correct password hash
        UPDATE auth.users 
        SET encrypted_password = crypt(_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = _user_id;

        -- Ensure user has 'admin' role in ALL places the app checks
        
        -- A. user_roles table
        INSERT INTO public.user_roles (user_id, role)
        VALUES (_user_id, 'admin')
        ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

        -- B. app_admins table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_admins') THEN
            INSERT INTO public.app_admins (user_id)
            VALUES (_user_id)
            ON CONFLICT (user_id) DO NOTHING;
        END IF;

        -- C. Check for 'platform_admin' role string (used in login.tsx)
        -- Since app_role enum might not have 'platform_admin', we check the login.tsx code.
        -- login.tsx: if (role === "platform_admin") throw redirect({ to: "/admin" });
        -- So we might need to add 'platform_admin' to the enum if it's missing,
        -- or update the user_roles to use a text field if it was converted.
    END IF;
END $$;
