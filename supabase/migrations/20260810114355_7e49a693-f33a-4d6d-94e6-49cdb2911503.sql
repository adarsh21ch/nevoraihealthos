-- Final attempt at a standard fix: Re-grant USAGE on pg_catalog 
-- which is sometimes revoked or restricted and GoTrue needs it.
GRANT USAGE ON SCHEMA pg_catalog, information_schema TO authenticator, anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO authenticator, anon, authenticated;

-- Also check if 'auth.users' has any RLS. 
-- GoTrue usually manages its own RLS on auth tables, but if we added one, it breaks.
SELECT * FROM pg_policies WHERE schemaname = 'auth' AND tablename = 'users';

-- Check for any "broken" triggers that might not show up in joins
SELECT tgname, tgenabled, tgtype, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- Re-grant everything on public to authenticator just in case
GRANT ALL ON SCHEMA public TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;
