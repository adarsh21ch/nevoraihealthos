# Plan - Fix Account Creation and Profile Password Updates

The user is experiencing a blocker during account creation ("Supabase Admin client not available") and wants to ensure that password resets/updates in the profile are functional and secure.

## User Requirements
- Fix the "Supabase Admin client not available" error during signup.
- Ensure profile password updates work correctly, save properly, and allow subsequent logins.
- Consolidation of UI/UX for popups (iPhone-style Dialog).
- Faster UI transitions (optimistic logout).

## Technical Implementation

### 1. Fix Registration Flow (Graceful Admin Check)
The current signup flow in `createCustomerAccount` crashes if `SUPABASE_SERVICE_ROLE_KEY` is missing. We will modify the logic to use the standard client for public operations and only invoke admin logic if the key is present. If missing, we will provide a clearer error or fallback.

### 2. Secure Profile Password Update
The `ProfileEditDrawer` handles password updates via `supabase.auth.updateUser`. We will:
- Add a session refresh after update to ensure the local session is current.
- Add robust error handling to `ProfileEditDrawer`.
- Ensure `autoComplete="new-password"` is correctly applied to inputs.

### 3. UI/UX Consolidation
- Use the consolidated `Dialog` (iPhone-style) for all profile edits, including security.
- Standardize padding and focus states in inputs.

### 4. Fast Transitions
- Verify and enforce optimistic logout logic.

## Technical Details
- **File**: `src/lib/auth.functions.ts` - Update `createCustomerAccount` to handle missing admin keys better.
- **File**: `src/components/profile/ProfileEditDrawer.tsx` - Enhance password update logic and error reporting.
- **File**: `src/integrations/supabase/client.server.ts` - Ensure the admin client proxy message is descriptive.

## Security Considerations
- Password updates must be performed against the authenticated session.
- Access codes validation must remain server-side via RPC.
