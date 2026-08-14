# Production Readiness: Redirection Loop Fix & Unified Login

The application is experiencing a redirection loop between `/login` and `/admin` (or `/owner`) due to stale auth state and aggressive middleware checks. This plan simplifies the routing logic and ensures a stable entry point for all users.

## User Review Required

> [!IMPORTANT]
> The `/login` route will now be the single entry point for all users. Role-based redirection will happen *after* a successful session is established, without intermediate `beforeLoad` redirects that can loop if state is partially hydrated.

## Proposed Changes

### 1. Simplify Login Route
- Remove `beforeLoad` redirects from `src/routes/login.tsx`.
- Let the component manage the initial session check.
- Use `window.location.replace` for role-based redirects to ensure the browser history is clean and state is fully reset.

### 2. Stabilize Authenticated Middleware
- Update `src/routes/_authenticated.tsx` to handle role verification more gracefully.
- Prevent loops by checking the current path against the user's role before triggering a redirect back to `/login`.

### 3. Dedicated Admin/Owner Route Fixes
- Ensure `src/routes/admin.tsx` and `src/routes/owner.tsx` use consistent verification logic that matches the platform's role-based access control.

## Technical Details

### `src/routes/login.tsx`
- **Delete** the `beforeLoad` block. It fires before the app is ready and often sees a "null" user while the session is still loading, triggering loops.
- **Update** `LoginPage` to check for an existing session in a `useEffect`. If found, trigger the redirection logic immediately.

### `src/routes/_authenticated.tsx`
- Refine the `beforeLoad` logic:
  - If no session, redirect to `/login`.
  - If session exists but role is unauthorized for the sub-path (e.g., non-admin on `/admin`), redirect to the user's default dashboard (`/p/fat2fit/today`) instead of `/login`. This prevents the login -> middleware -> login loop.

### `src/router.tsx` & `src/routes/__root.tsx`
- Verify that the `tenant` context is correctly populated even on platform domains to avoid `TenantGate` stalls.

## Verification Plan

### Automated Tests (Playwright)
- `check_login_loop.py`: Attempt to access `/admin` without a session -> verify redirect to `/login`.
- `check_admin_entry.py`: Log in as `teamnevorai@gmail.com` -> verify direct navigation to `/admin`.
- `check_participant_entry.py`: Log in as a participant -> verify navigation to `/p/fat2fit/today`.

### Manual Verification
- Fresh load of `fat2fit.nevorai.com/login`.
- Login as platform admin.
- Click "Sign Out" and log in as a participant.
- Verify no "white screen" or "looping URL" behavior.
