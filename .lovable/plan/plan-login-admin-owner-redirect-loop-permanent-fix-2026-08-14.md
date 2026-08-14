# Plan: Login ↔ Admin/Owner Redirect Loop Permanent Fix

Fix the timing race and role resolution drift that causes infinite redirection loops for admin and owner accounts.

## User Review Required

> [!IMPORTANT]
> The fix requires standardizing how we identify your accounts (`teamnevorai@gmail.com` and `krishnaaroraflp@gmail.com`). I will use one central function to handle these redirects for both the login screen and the protected dashboard guards.

## Proposed Changes

### 1. Centralize Auth Gating Logic
- Create `src/lib/auth-gate.ts` to host a unified `resolveUserDestination` function.
- This function will be the single source of truth for role-based routing (`/admin`, `/owner`, or participant routes).
- It will include the high-priority bypass for specific admin/owner emails to ensure you are never locked out even if database lookups are slow.

### 2. Fix Timing Race in `login.tsx`
- Replace `window.location.replace` with the router's `navigate()` function.
- This prevents a full page reload, allowing the Supabase client to maintain its internal state without having to re-hydrate from storage and re-validate via network before the dashboard loads.
- Update the "cold load" `useEffect` to use the new unified resolver.

### 3. Loop-Proof Protected Route Guards
- Update `_authenticated.tsx`, `admin.tsx`, and `owner.tsx` to use the unified resolver.
- Use `supabase.auth.getSession()` (synchronous storage check) for the initial gate instead of `getUser()` (async network call) to prevent the "session not ready yet" race condition during page loads.

### 4. Consolidate Participant Routing
- Standardize the logic that determines if a participant should go to `/onboarding` or `/today`.
- Ensure `tenantSiteUrl` logic is consistent across all entry points.

## Technical Details

- **File Transitions**:
  - `src/lib/auth-gate.ts`: New shared utility.
  - `src/routes/login.tsx`: Remove hard page reloads; use `navigate()`.
  - `src/routes/_authenticated.tsx`: Standardize `beforeLoad` using the new utility.
  - `src/routes/admin.tsx` & `src/routes/owner.tsx`: Simplify guards to use the central resolver.
- **Race Condition Fix**: By moving from `window.location` (external to router) to `navigate` (internal to router), we stay within the same JavaScript execution context, ensuring the Supabase session is available immediately for the next route's `beforeLoad` hook.

## Verification Plan

### Automated Verification
- Run Playwright scripts to simulate "cold" logins (empty storage) and "warm" refreshes for both admin and owner accounts.
- Monitor network requests to ensure no repeated 307 redirects between `/login` and dashboards.

### Manual Verification
1. Log in as `teamnevorai@gmail.com` -> Confirm instant arrival at `/admin`.
2. Hard refresh `/admin` -> Confirm no flash of login screen.
3. Repeat for `krishnaaroraflp@gmail.com` -> Confirm instant arrival at `/owner`.
4. Sign up as a new participant -> Confirm arrival at `/onboarding`.
