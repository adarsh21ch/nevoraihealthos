# Plan - Fix Supabase Admin Client Availability Error

The user is experiencing a `RUNTIME_ERROR` when calling `createCustomerAccount`:
`Error: SUPABASE ADMIN CLIENT NOT AVAILABLE: SUPABASE_SERVICE_ROLE_KEY IS MISSING. PLEASE CONNECT SUPABASE IN LOVABLE CLOUD.`

This happens because `createCustomerAccount` (a server function) requires `supabaseAdmin` to create the auth user and assign roles, but the environment variable `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEYS`) is missing.

## Analysis
1.  **Cause**: The server function `createCustomerAccount` in `src/lib/auth.functions.ts` imports `supabaseAdmin` from `src/integrations/supabase/client.server.ts`. 
2.  **Trigger**: When `supabaseAdmin.auth.admin.createUser` is called, the Proxy in `client.server.ts` triggers initialization. If the secret key is missing from `process.env`, it throws the error.
3.  **Environment**: In Lovable, secret keys are injected when Supabase is connected. If the user hasn't connected it or if the key name doesn't match the expected `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEYS`, it fails.

## Proposed Changes
1.  **Improve Error Messaging**: Update `src/integrations/supabase/client.server.ts` to be more specific about *which* keys are missing.
2.  **Fallback to Service Role RPCs (Optional/Long-term)**: If service role keys are strictly forbidden/unavailable, we might need a different approach, but usually, in Lovable, the solution is connecting Supabase correctly.
3.  **Verify Environment**: I will check the environment variables available to the server runtime.
4.  **Graceful Degradation**: Ensure that even if the admin client fails, the error is caught and reported clearly to the user.

## Technical Details
- The error log shows the failure happens at `src/lib/auth.functions.ts:30:70`, which is the call to `supabaseAdmin.auth.admin.createUser`.
- I will check if `SUPABASE_SERVICE_ROLE_KEY` is actually present in the environment.

### Steps
1.  Check environment variables using a temporary server function or `printenv` via `code--exec` (though `printenv` might not show keys injected into the worker runtime).
2.  Update `client.server.ts` to log precisely what it sees in `process.env` (redacted for security).
3.  Provide clear instructions to the user on how to resolve it in the Lovable Cloud UI if keys are missing.
