# Plan - Supabase Admin Key Integration

The user wants to manually provide Supabase keys (URL and Service Role Key) because the automatic integration in Lovable Cloud is not resolving the `SUPABASE_ADMIN_CLIENT_NOT_AVAILABLE` error. I will provide a secure debug/setup interface in the Admin panel to capture these keys and update the project's secret store.

## User-Facing Changes
- **Admin Setup Interface**: A new section in the Admin Settings (`/admin/settings`) that allows the platform administrator to manually input `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **Validation**: Real-time validation of the keys to ensure they are formatted correctly before saving.
- **Success Feedback**: Clear notification once the keys are securely stored.

## Technical Details
- **Environment Management**: I will use the `secrets--add_secret` tool to store the provided keys. This ensures they are available to the server-side runtime (`process.env`).
- **Secret Key Priority**: Update the Supabase client logic to prioritize these manually set secrets if the default Lovable-injected ones are missing or invalid.
- **Security**:
    - The setup UI will only be accessible to users with the `platform_admin` role (specifically `teamnevorai@gmail.com`).
    - Keys will be masked in the UI after entry.
    - We will use `secrets` tools which are the standard way to handle private keys in this environment.

## Implementation Steps
1. **Create Setup Server Function**: Implement a server function `saveSupabaseSecrets` in `src/lib/admin-setup.functions.ts` that takes the keys and uses `secrets--add_secret` to save them.
2. **Update Admin Settings UI**: Add a "Supabase Configuration" card to `src/routes/admin/settings.tsx` (or create the file if it doesn't exist) with the necessary inputs.
3. **Verify Client Logic**: Ensure `src/integrations/supabase/client.server.ts` correctly reads from `process.env` (which `add_secret` populates).
4. **Test Connection**: Provide a "Test Connection" button in the UI that attempts a simple admin operation (e.g., fetching auth users count) to verify the keys work.
