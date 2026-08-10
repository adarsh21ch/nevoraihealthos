GRANT USAGE ON SCHEMA auth TO authenticator;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticator;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;
