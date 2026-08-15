# Plan: Fix Access Control Dashboard

The "Access Control" page in the dashboard is currently using a hardcoded placeholder ("FAT2FIT") and fails with a Zod validation error ("Expected string, received null") because it cannot resolve the `tenantId` from the auth context. I will fix the database schema, the server functions, and the UI to correctly manage registration access codes.

## User Review Required
- The access code will be global for the "Fat2Fit" brand (since the app has pivoted from multi-tenant to single brand).
- I will consolidate the multiple migration attempts for access codes into a single source of truth table.

## Proposed Changes

### Database & Security
- Create a `registration_codes` table if it doesn't exist (or repair the existing one).
- Ensure it has columns: `code` (text), `tenant_id` (uuid, optional), `is_active` (boolean).
- Grant permissions to `authenticated` (read/update) and `service_role`.
- Add RLS policies for admin access.

### Server Logic (`src/lib/admin.functions.ts`)
- Update `getMyTenantAccessCode` to fetch the real active code from the `registration_codes` table.
- Update `rotateTenantAccessCode` to update the code in the database.
- Fix the `tenantId` handling: since the app is now single-brand ("fat2fit"), I will default to fetching the "fat2fit" tenant ID if the RPC context is missing.

### UI Improvements (`src/routes/dashboard/access.tsx`)
- Fix the loader to robustly fetch the tenant ID.
- Fix the `updateMutation` to handle the `tenantId` correctly.
- Ensure the UI reflects the real database state instead of placeholders.
- Synchronize other pages (like the Invite page) to use this same dynamic access code.

## Technical Details
- Table: `public.registration_codes`
- Migration: Add `registration_codes` table and seed it with 'FAT2FIT'.
- Server Functions: Replace hardcoded strings with Supabase queries.
- Error Fix: The Zod error `received null` for `tenantId` will be resolved by ensuring the loader always provides a valid UUID or by making the server function handle optional tenant IDs.
