# Plan: Phase 9B — Production-Ready PWA + Authenticated Session Persistence

Implement a complete PWA experience for Fat2Fit, focusing on installation, service worker setup (with safe caching), and seamless authentication persistence.

## User Review Required

> [!IMPORTANT]
> - The PWA will use `standalone` mode, meaning it will appear as a separate app window on mobile and desktop.
> - Session persistence will use Supabase's built-in `localStorage` mechanism, ensuring users stay logged in across app restarts.
> - A branded "Add to Home Screen" prompt will be provided for iOS users.

## Proposed Changes

### PWA Foundation
- Create `public/manifest.json` with Fat2Fit branding, colors, and icons.
- Add PWA meta tags and manifest link to `src/routes/__root.tsx`.
- Implement `src/service-worker.ts` using `Workbox` (via `vite-plugin-pwa` if possible, or manual registration) for static asset caching.
- **Security**: Explicitly exclude authenticated API routes from service worker caching to prevent cross-user data leakage.

### Authentication & Loading
- Update `_authenticated.tsx` and `login.tsx` to handle session restoration gracefully.
- Create a `BrandedLoading` component in `src/components/ui/branded-loading.tsx` to show during session check, avoiding flashes of the login screen.
- Ensure `supabase.auth.onAuthStateChange` is used to react to session invalidation or explicit logout.

### Installation Experience
- Create `src/components/PWAInstallPrompt.tsx` to handle the `beforeinstallprompt` event.
- Show a premium in-app install CTA for supported browsers.
- Add specific "Add to Home Screen" instructions for iOS users.

### Technical Details
- **Manifest**:
  - `name`: Fat2Fit
  - `short_name`: Fat2Fit
  - `theme_color`: `#064E3B` (Deep Emerald)
  - `background_color`: `#F8FAFC` (Slate 50)
- **Caching Strategy**: `StaleWhileRevalidate` for static assets (JS, CSS, Images), `NetworkOnly` for all `/api/*` and Supabase RPC calls.
- **Session**: Leverage `supabase.auth.getSession()` at the root/auth guard level with a loading state.

## Verification Plan

### Automated Tests
- Build check: `npm run build` to ensure PWA assets are generated.
- Manifest validation: Verify `manifest.json` is served and valid.

### Manual Verification
- **Test 1**: Login, close browser, reopen -> Verify direct dashboard access.
- **Test 2**: Install as PWA -> Verify standalone window mode and session persistence.
- **Test 3**: Explicit logout -> Verify return to login and session clearance.
- **Test 4**: Deep link (e.g., `/p/fat2fit/profile`) while logged in -> Verify direct navigation.
- **Test 5**: iOS simulation -> Verify "Add to Home Screen" guidance.
- **Test 6**: Cache Audit -> Verify no private user data is present in Cache Storage.
