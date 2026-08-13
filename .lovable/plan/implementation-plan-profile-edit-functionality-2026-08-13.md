# Implementation Plan - Profile Edit Functionality

Fix the critical bug where "Edit" buttons on the participant profile page are non-functional. Implement a complete end-to-end flow using drawers/modals, server functions, and database persistence while ensuring synchronization with the AI nutrition engine.

## User Review Required

> [!IMPORTANT]
> - The edit flow uses a bottom drawer on mobile and a centered modal on desktop for a premium feel.
> - Saving changes will immediately update your "Profile Completeness" score.
> - If you change key data like weight or diet preferences, the "Diet" tab will reflect that your profile has been updated and may require a new AI plan generation.

## Proposed Changes

### 1. Server-Side (Persistence & Logic)
- **src/lib/profile/profile.functions.ts**:
    - Enhance `updateMyProfile` to ensure it handles all fields from onboarding (including `meal_timing` and `disliked_foods`).
    - Verify `validateProfileReadiness` correctly accounts for all mandatory fields to update the completeness percentage accurately.

### 2. Frontend (UI & Interaction)
- **src/routes/_authenticated/p.$tenantSlug.profile.tsx**:
    - Implement a `ProfileEditDrawer` component that dynamically renders forms based on the section being edited (Personal, Body, Goals, etc.).
    - Use `react-hook-form` or controlled state with the existing `updateMyProfile` server function.
    - Prefill forms with current data from the `my-profile` query.
    - Add loading states (Saving...), success toasts, and error handling.
    - Use `queryClient.invalidateQueries(['my-profile', 'profile-readiness'])` to ensure the UI updates instantly after saving.

### 3. Data Integrity & Sync
- Ensure the `customers` table remains the single source of truth.
- Verify that updating profile fields correctly satisfies the requirements for the `generateMyPersonalizedPlan` function in `src/lib/nutrition/nutrition.functions.ts`.

## Technical Details
- **Component**: `Drawer` and `DrawerContent` from `@/components/ui/drawer`.
- **State Management**: `useMutation` from TanStack Query for the save operation.
- **Validation**: Zod schema in the server function and client-side basic validation (e.g., no negative weights).
- **Tenant Isolation**: Uses the authenticated `userId` and `tenantSlug` to ensure users can only edit their own data.
