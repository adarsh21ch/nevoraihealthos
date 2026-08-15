# Plan: Master Access Code Protection & Management

The user wants to ensure that when they "change the code or access our new code from Fat2Fit", the old "FAT2FIT" master code is deactivated and no longer allows account creation or edits (safety).

Currently, `FAT2FIT` is hardcoded as a permanent bypass in `src/lib/auth.functions.ts`. We need to move this to a configurable state, likely in the database, while maintaining a safety mechanism.

## Proposed Changes

### 1. Database Schema Update
- Ensure the `access_codes` table or a new settings table can store a "Global Master Code".
- We will use the existing `access_codes` table but add logic to support a "permanent/multi-use" flag if possible, or simply manage it via a specific row.
- *Self-correction*: The user mentioned "access our new code from Fat2Fit". This implies they want the ability to rotate the master code.

### 2. Administrative Logic (`src/lib/admin.functions.ts`)
- Implement `getMyTenantAccessCode` to fetch the active master code for the tenant (Fat2Fit).
- Implement `rotateTenantAccessCode` to update the master code in the database.
- These will now interact with a real table (likely `access_codes` where `is_permanent = true` or a specific metadata field).

### 3. Auth Engine (`src/lib/auth.functions.ts`)
- Remove the hardcoded `'FAT2FIT'` string.
- Update `createCustomerAccount` to:
    1. Fetch the active master code from the database.
    2. Compare the user's input with this dynamic master code.
    3. If it matches, proceed as "Permanent".
    4. If it doesn't match, check for standard one-time codes.
- This ensures that once the admin changes the code, the old one (like "FAT2FIT") is immediately invalid.

### 4. UI Refinement (`src/routes/dashboard/access.tsx`)
- Ensure the "Access Control" page correctly reflects and updates the dynamic master code.

## Technical Details

### Database Migration
- Add `is_permanent` (boolean) and `tenant_id` (uuid) to `access_codes` table if not already present.
- Seed the initial master code as 'FAT2FIT'.

### Security
- RLS on `access_codes` must allow only admins to read/write master codes.
- `createCustomerAccount` uses `supabaseAdmin` to check codes to ensure it works during signup (pre-auth).

## Implementation Steps

1. **SQL Migration**: Add necessary columns to `access_codes`.
2. **Backend Logic**: Update `admin.functions.ts` to handle dynamic master codes.
3. **Auth Logic**: Refactor `auth.functions.ts` to remove hardcoded bypass.
4. **UI Update**: Connect `dashboard/access.tsx` to the new backend functions.
