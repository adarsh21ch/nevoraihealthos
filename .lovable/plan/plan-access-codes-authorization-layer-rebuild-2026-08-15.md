# Plan — Access Codes & Authorization Layer Rebuild

Definitive fix for the "permission denied for table users" error by moving all `auth.users` lookups into a `SECURITY DEFINER` function and standardizing role-based access across the stack.

## Technical Details

### Phase 1: Database Migration
- Define `public.has_elevated_access(uuid)` as `SECURITY DEFINER` to safely check roles and the platform admin email (via `auth.users`).
- Seed `platform_admins` with the user ID for `teamnevorai@gmail.com` to avoid email lookups in hot paths.
- Rewrite RLS policies for `registration_codes` and `customers` to use this new function.
- Drop the public read policy on `registration_codes` to secure the registration gate.

### Phase 2: TypeScript Consolidation
- Update `src/lib/admin.functions.ts` and `src/lib/dashboard.functions.ts` to use `supabase.rpc('has_elevated_access')` exclusively.
- Remove all hardcoded email checks and inline `user_roles` queries from these files.
- Cleanup: Remove the dead `tenantId` parameter from `rotateTenantAccessCode` and its callers.

### Phase 3: Verification
- Verify that `teamnevorai@gmail.com` can update access codes.
- Audit `pg_policies` to ensure no active policies touch `auth.users` directly.
- Confirm anonymous access to registration codes is blocked.
- Test the signup flow with both valid and invalid codes.

## Security
- `SECURITY DEFINER` functions must strictly set `search_path = public` to prevent search path hijacking.
- Removing public `SELECT` on `registration_codes` closes a major enrollment bypass.
