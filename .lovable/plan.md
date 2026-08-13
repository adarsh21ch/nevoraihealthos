# Plan: Phase 9C — True Native PWA + iOS/Android Safe Area + Branding Fix

This plan corrects the PWA implementation to ensure a true standalone native-like experience, respects device safe areas (notches/home indicators), refines the mobile navigation UI, and hardens the branding and session persistence logic.

## 1. PWA & iOS Native Integration
- **Manifest Correction**: Fix the `manifest.json` API route to use `display: standalone` and ensure unique `id` for session persistence.
- **iOS Metadata**: Update `src/routes/__root.tsx` with `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, and dynamic `apple-touch-icon`.
- **Viewport Hardening**: Ensure `viewport-fit=cover` is present in the meta tag.

## 2. Safe Area UI/UX
- **CSS Utility**: Add global padding utilities in `src/styles.css` using `env(safe-area-inset-*)`.
- **Mobile Header**: Update the mobile header in `src/routes/_authenticated/p.$tenantSlug.tsx` to include `padding-top: env(safe-area-inset-top)` so the logo does not sit under the status bar.
- **Bottom Navigation**: Update `ParticipantBottomNav` in `src/components/ParticipantNavigation.tsx` to respect `env(safe-area-inset-bottom)` and refine touch targets.
- **Sidebar Selection Fix**: Correct the logic in `AdminDashboard` and `ParticipantSidebar` where multiple tabs might appear highlighted due to path matching.

## 3. Premium Branding & Session Restoration
- **Dynamic Icons**: Ensure `api/manifest.json` serves the current `logo_url` for all icon sizes.
- **Session Flash Prevention**: Hardened `_authenticated.tsx` to maintain the `BrandedLoading` state until the Supabase session is fully restored and the tenant context is ready.
- **Lovable Brand Removal**: Audit and remove any remaining Lovable-branded favicons or assets.

## Technical Details
- Use `useLocation` with exact matching or more specific path prefixes to fix navigation highlight bugs.
- Implement `padding-top: calc(1rem + env(safe-area-inset-top))` for the mobile header.
- Implement `padding-bottom: calc(1rem + env(safe-area-inset-bottom))` for the bottom navigation.
- Update `manifest` icons array to include `purpose: "any maskable"` for the main branding logo.
