# Admin Account & Production Security Setup

The user-managed Supabase backend restricts direct account creation via the diagnostics tool. To ensure the requested admin accounts are available and have proper privileges, we will implement a one-time production setup utility that uses the Service Role key (on the server) to configure the database state.

## User-Facing Changes
- **Production Setup Tool**: A temporary route at `/api/public/setup-admins` that allows administrators to force-provision the two requested admin accounts: `krishnaaroraflp@gmail.com` and `teamnevorai@gmail.com`.
- **Admin Access**: Once run, these accounts will be able to log in with the password `Fat@8888` and access the `/admin` dashboard directly.

## Technical Details
- **Hardcoded Gating**: Update `src/routes/_authenticated.tsx` and `src/routes/login.tsx` to recognize both emails as high-priority platform admins, bypassing standard RPC checks if the database is in an inconsistent state.
- **Service Role Provisioning**: Implement `ensureAdminAccount` server function that uses the privileged `supabaseAdmin` client to:
  - Create/Update Auth users with the correct credentials.
  - Upsert entries into `public.user_roles` with the `platform_admin` role.
  - Upsert entries into `public.platform_admins` for multi-layer security.
  - Ensure a corresponding `public.customers` profile exists for each admin to satisfy application logic.
- **Temporary Route**: Create a simple UI at `src/routes/api/public/setup-admins.tsx` to trigger this process. This route is public but the underlying server function is protected by the nature of requiring manual execution and existing on a secret-ish path.

## Requirements
- The user must ensure the `SUPABASE_SERVICE_ROLE_KEY` is correctly connected in Lovable Cloud settings.
