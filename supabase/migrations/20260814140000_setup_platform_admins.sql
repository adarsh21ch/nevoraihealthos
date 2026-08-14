-- 1. Create the platform_admins if not exist (ensuring table structure from previous migrations)
CREATE TABLE IF NOT EXISTS public.platform_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create or Update the admin users in auth schema
-- Note: In a real Supabase environment, you can't easily script 'auth.users' inserts via SQL 
-- without triggers or special functions because of hashing. 
-- However, we can use a secure function to handle the link-up if they exist.

DO $$
DECLARE
    _user1_id UUID;
    _user2_id UUID;
    _hashed_password TEXT := crypt('Fat@8888', gen_salt('bf'));
BEGIN
    -- This assumes the users might already exist. If not, we'll try to insert them into auth.users.
    -- WARNING: Manual insertion into auth.users requires care with the 'instance_id' and other fields.
    -- Most Supabase projects use a default instance_id of '00000000-0000-0000-0000-000000000000'.

    -- Handle krishnaaroraflp@gmail.com
    SELECT id INTO _user1_id FROM auth.users WHERE email = 'krishnaaroraflp@gmail.com';
    IF _user1_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
            'krishnaaroraflp@gmail.com', _hashed_password, 
            now(), now(), now(), 
            '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 
            '', '', '', ''
        ) RETURNING id INTO _user1_id;
        
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), _user1_id, format('{"sub":"%s","email":"%s"}', _user1_id, 'krishnaaroraflp@gmail.com')::jsonb, 'email', now(), now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = _hashed_password, email_confirmed_at = now() WHERE id = _user1_id;
    END IF;

    -- Handle teamnevorai@gmail.com
    SELECT id INTO _user2_id FROM auth.users WHERE email = 'teamnevorai@gmail.com';
    IF _user2_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
            'teamnevorai@gmail.com', _hashed_password, 
            now(), now(), now(), 
            '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 
            '', '', '', ''
        ) RETURNING id INTO _user2_id;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), _user2_id, format('{"sub":"%s","email":"%s"}', _user2_id, 'teamnevorai@gmail.com')::jsonb, 'email', now(), now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = _hashed_password, email_confirmed_at = now() WHERE id = _user2_id;
    END IF;

    -- 3. Ensure they have the correct roles in the public schema
    -- Role table link
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user1_id, 'platform_admin'), (_user2_id, 'platform_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Platform admins table link
    INSERT INTO public.platform_admins (user_id)
    VALUES (_user1_id), (_user2_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Ensure customer profile exists for internal logic consistency
    INSERT INTO public.customers (user_id, name, onboarding_complete, tenant_id)
    SELECT _user1_id, 'Krishna', TRUE, id FROM public.tenants WHERE slug = 'fat2fit'
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.customers (user_id, name, onboarding_complete, tenant_id)
    SELECT _user2_id, 'Team Nevorai', TRUE, id FROM public.tenants WHERE slug = 'fat2fit'
    ON CONFLICT (user_id) DO NOTHING;

END $$;
