# Plan: Fix Registration Code Validation

The registration code validation in `createCustomerAccount` is failing with "Invalid registration code. Please contact your coach." because the server function is attempting to query the `registration_codes` table using a non-authenticated Supabase client, while the RLS policies for that table have become restrictive or the "Public read" policy was dropped to enhance security.

## Proposed Changes

### 1. Database Layer (Migration)
- Ensure a reliable `is_registration_code_valid` RPC function exists that is marked as `SECURITY DEFINER`.
- This function will check the `registration_codes` table without being blocked by RLS, allowing the public signup flow to verify codes securely.
- Ensure the default code `FAT2FIT` is active.
- Fix any RLS policy issues on `registration_codes` that might prevent even internal lookups if not using `SECURITY DEFINER`.

### 2. Logic Layer (src/lib/auth.functions.ts)
- Update `createCustomerAccount` to use the `is_registration_code_valid` RPC instead of a direct table query.
- This ensures the validation happens in a secure, server-side context that bypasses client-side RLS limitations.
- Fallback to `supabaseAdmin` for the registration code check if the RPC is not suitable, though the RPC is the cleaner solution.

### 3. Verification
- Verify that a signup with the correct code succeeds.
- Verify that a signup with an incorrect code fails with the expected error.

## Technical Details

### SQL Migration
```sql
-- Security Definer RPC for public validation
CREATE OR REPLACE FUNCTION public.is_registration_code_valid(_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registration_codes
    WHERE code = UPPER(_code)
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_registration_code_valid(text) TO anon, authenticated;

-- Ensure we have the default code
INSERT INTO public.registration_codes (code, is_active)
VALUES ('FAT2FIT', true)
ON CONFLICT (code) DO UPDATE SET is_active = true;
```

### TypeScript Changes
In `src/lib/auth.functions.ts`:
```typescript
// Replace direct query with RPC
const { data: isValid, error: regError } = await supabase
  .rpc("is_registration_code_valid", { _code: data.access_code });

if (regError || !isValid) {
  throw new Error("Invalid registration code. Please contact your coach.");
}
```
