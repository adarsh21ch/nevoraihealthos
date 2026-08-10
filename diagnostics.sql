-- Task 1: Trigger definitions
SELECT tgname,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT tgisinternal;

-- Task 1: Function body
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user_admin_assignment';

-- Task 2: RLS helper grants
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authed_exec,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_platform_admin','is_tenant_member','current_customer_ids','can_access_customer');

-- Task 2: user_roles grant
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public' AND table_name='user_roles'
  AND grantee='supabase_auth_admin';

-- Task 2: Migrations
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 25;
