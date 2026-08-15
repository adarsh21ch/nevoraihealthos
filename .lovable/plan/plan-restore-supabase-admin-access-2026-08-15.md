# Plan - Restore Supabase Admin Access

The user's Supabase backend is user-managed, meaning Lovable cannot automatically inject the service role keys required for admin operations (like creating users during signup). I will remove the manual configuration UI and instead guide the user to provide the keys directly in the chat so I can securely save them as project secrets.

## User-Facing Changes
- **Simplified Setup**: Remove the "Supabase Core Configuration" card from the Admin Settings to reduce UI clutter.
- **Improved Errors**: Update the admin client error to explicitly ask for the keys in the chat rather than pointing to a settings page.

## Technical Details
- **Secret Storage**: Once the user provides the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the chat, I will use `secrets--add_secret` to store them.
- **Client Logic**: `src/integrations/supabase/client.server.ts` already looks for these environment variables. Storing them as secrets will make them available to `process.env`.
- **Signup Reliability**: This will fix the `createCustomerAccount` server function, allowing new users to sign up with their FBO ID and access code.

## Implementation Steps
1. **Remove Admin UI**: Revert the changes to `src/routes/admin/settings.tsx` that added the configuration card.
2. **Update Error Message**: Modify `src/integrations/supabase/client.server.ts` to provide a clear path forward (paste keys in chat).
3. **Clean Up**: Remove the temporary `src/lib/admin-setup.functions.ts` file.
