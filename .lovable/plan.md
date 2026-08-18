# PWA & Mobile UX Optimization Plan

The goal is to fix the "website-like" feel in the PWA (Add to Home Screen) mode by removing desktop elements (like the sidebar) and ensuring a native-like full-screen experience without horizontal scrolling.

## User Review Required

> [!IMPORTANT]
> - Should the sidebar be completely disabled on mobile, or should it be accessible via a hamburger menu?
> - The current plan assumes we hide the sidebar on mobile and use the Bottom Navigation for a native app feel.

## Proposed Changes

### 1. PWA Identity & Fullscreen
- Update `src/routes/__root.tsx` to include additional PWA metadata:
  - `mobile-web-app-capable`
  - `status-bar-style`
  - `theme-color`
- Ensure `viewport-fit=cover` is applied to handle the "notch" area properly.

### 2. Layout & Navigation
- **Participant Portal (`src/routes/_authenticated/p.$tenantSlug.tsx`)**:
  - Enforce `hidden lg:flex` on the sidebar.
  - Remove redundant mobile headers that might take up vertical space in PWA mode.
  - Use `pb-safe` for the bottom navigation to avoid overlap with the home indicator.
- **Coach Dashboard (`src/routes/dashboard.tsx`)**:
  - Implement a mobile-first responsive layout.
  - Replace the persistent desktop sidebar with a mobile-friendly sheet/drawer or bottom nav when on smaller screens.
  - Fix the `flex flex-col` structure that causes horizontal overflow.

### 3. Styling & Egress
- **Global CSS (`src/styles.css`)**:
  - Strict `overflow-x: hidden` on `body` and `html`.
  - Add `safe-area` utilities for padding and height.
- **Components**:
  - Audit `BMITool.tsx` and `TodayPage` for elements wider than the viewport (e.g., negative margins, fixed widths).

## Technical Details
- Use `@media (max-width: 1024px)` to toggle between Desktop/Mobile layouts.
- Detect PWA mode using `window.matchMedia('(display-mode: standalone)').matches` to hide the URL bar hints and further optimize vertical space.
- Apply `touch-action: manipulation` to prevent accidental zooming.

## Verification Plan
- Use Playwright with mobile emulation (iPhone 14) to verify:
  - No horizontal scrollbar.
  - No sidebar visible on mobile.
  - Bottom nav is fixed and safe-area aware.
  - "Add to Home Screen" feels like a native app.
