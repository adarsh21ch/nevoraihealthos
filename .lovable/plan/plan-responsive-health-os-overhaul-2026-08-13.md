# Plan: Responsive Health OS Overhaul

Redesign the participant application shell into a responsive "Health OS" that feels native on mobile, tablet, and desktop. Implement an intentional responsive layout system with a desktop sidebar and optimized grids for content.

## User Review Required

> [!IMPORTANT]
> The Profile Edit drawer will be moved to a centered modal on desktop to fix the "bottom down" visibility issue and match the requested "iPhone style pop-up" (which on desktop translates better to a centered modal).

- **Navigation Change**: Are you okay with the bottom navigation completely disappearing on screens wider than 1024px in favor of the left sidebar?
- **Sidebar Content**: The sidebar will include "FAT2FIT", "Protocol Active", and the 5 main links (Today, Journey, Diet, Kit, Profile). Any other links you'd like there?

## Proposed Changes

### 1. Responsive Shell Architecture
- **Desktop Sidebar**: A permanent left sidebar (260px) for viewports ≥ 1024px.
- **Mobile Navigation**: Maintain the existing bottom bar for viewports < 768px.
- **Adaptive Main Content**: Fluid content area that centers and constrains editorial width (max-width ~1200px) on large screens.

### 2. Layout & Breakpoints
- **Mobile (< 768px)**: Bottom nav, single column.
- **Tablet (768px - 1023px)**: Adaptive layout (2-column grids where possible, bottom nav or compact sidebar depending on width).
- **Desktop (≥ 1024px)**: Fixed left sidebar, no bottom nav, responsive grid systems.

### 3. Page Optimizations
- **Today**: Rebuild as a 2-column dashboard (Progress/Hydration top row, Protocol/Tasks/Insights below).
- **Journey**: Horizontal breathing room for the timeline, fixing the "Story Begins Soon" empty state logic.
- **Diet**: 2-column grid for My Plan and free foods/recipes.
- **Profile**: 2-column responsive grid for health metrics (Personal/Body, Goals/Lifestyle, etc.).

### 4. UI/UX Refinements
- **Centered Modals**: Convert drawers to centered opaque modals on desktop.
- **Typography**: Scale font sizes responsively using CSS variables.
- **Safe Areas**: Hardened safe-area-inset support for mobile devices.

## Technical Details

- **Responsive Utilities**: Extensive use of Tailwind's `hidden lg:block`, `grid-cols-1 md:grid-cols-2`, and `max-w-screen-xl`.
- **CSS Grid/Flexbox**: Replace absolute mobile positioning with responsive layout containers.
- **Component Refactoring**: Extract `ParticipantSidebar` and `ParticipantBottomNav` components from the main layout shell.
- **Fix "Journey" Loading**: Investigate the `no_content` state in `journey.functions.ts` to ensure users see their timeline immediately after onboarding.
