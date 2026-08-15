# Plan - Fix Dashboard "Unauthorized" Errors

Replace legacy `is_app_admin` checks with role-based validation in `src/lib/admin.functions.ts` and `src/lib/dashboard.functions.ts` to allow platform admins and coaches to access dashboard features.

## Proposed Changes

### 1. Update Admin Server Functions
- Edit `src/lib/admin.functions.ts`.
- Replace all instances of `supabase.rpc("is_app_admin", { _uid: userId })` with a check for either `'admin'`, `'tenant_owner'`, or `'platform_admin'` roles using the `has_role` RPC.
- Retain the hardcoded email bypass for `teamnevorai@gmail.com` as a safety measure.

### 2. Update Dashboard Server Functions
- Edit `src/lib/dashboard.functions.ts`.
- Replace legacy `is_app_admin` checks with the new unified role check.

## Technical Details
- The existing `is_app_admin` function only checks a legacy `app_admins` table.
- The new check will use:
  ```ts
  const { data: roleCheck } = await supabase.rpc("has_role", { 
    _user_id: userId, 
    _role: 'admin' 
  });
  const { data: ownerCheck } = await supabase.rpc("has_role", { 
    _user_id: userId, 
    _role: 'tenant_owner' 
  });
  const isAdmin = !!roleCheck || !!ownerCheck || isHardcodedAdmin;
  ```

## Verification Plan
- **Automated**: Use Playwright to simulate a login as the admin account and attempt to fetch the access code on the dashboard.
- **Manual**: Verify that the "Unauthorized" toast no longer appears when the Access Control page loads.
- **Verification Proof**: Provide the raw output of the `rotateTenantAccessCode` call for the admin account.
