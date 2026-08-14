# Plan: Fix Homepage Loading and Implement Participant Day Reset

The user is experiencing a "white screen" when trying to open the homepage and dashboard, and needs a way to reset their program day.

## User Review Required

> [!IMPORTANT]
> The program day is calculated automatically based on the `start_date` in the database. Resetting the day to "Day 1" will change this date to today's date in IST.

- Would you like the "Reset Day" option to be available to all participants in their profile, or should it be an admin-only tool?
- Should resetting the day also clear the previous logs (water, tasks) for the new "Day 1"?

## Proposed Changes

### 1. Fix Homepage Loading (White Screen)
The white screen is likely caused by a hydration mismatch or a loop in the `TenantGate` or `resolveTenantHint` logic. Since the app is now dedicated to "Fat2Fit", I will simplify the tenant resolution to ensure it always resolves the default tenant.

- Update `src/lib/tenant.ts` to strictly return 'fat2fit' as the default tenant.
- Verify `src/routes/__root.tsx` and `src/components/site/TenantGate.tsx` to ensure they handle the default tenant state without stalling.

### 2. Implement Participant Day Reset
Since the day number is derived from `start_date`, I will add a server function to update the participant's `start_date` to today's date.

#### Backend
- Add `resetParticipantDay` server function in `src/lib/profile/profile.functions.ts`.
- This function will:
  1. Identify the active `participant_programs` record for the user.
  2. Update the `start_date` to today's IST date (`getISTDateString()`).
  3. Optionally clear `daily_logs` and `task_completions` for the current date to avoid confusion.

#### Frontend
- Add a "Reset Journey to Day 1" button in `src/routes/_authenticated/p.$tenantSlug.profile.tsx` under a new "Danger Zone" or "Advanced Settings" section.
- Add a confirmation dialog to prevent accidental resets.

### 3. Verify Login Flow
- Ensure `src/routes/login.tsx` correctly redirects to the dashboard after authentication without getting stuck on the initialization screen.

## Technical Details

- **Day Calculation**: `getProgramDayNumber` uses `Date.UTC` to compare `getISTDateString()` and `start_date`. Setting `start_date` to today's `getISTDateString()` will result in `day_number = 1`.
- **Tenant Context**: Simplification of `resolveTenantHint` to remove complex hostname checks that might be failing in specific environments.
- **Loading States**: Ensure `BrandedLoading` doesn't get stuck if `useTenant()` or `resolveUserDestination` takes longer than expected.

## Verification Plan

### Automated Tests
- Run `check_login.py` to verify the login and redirect flow.
- Create a new test script to verify the day reset logic by checking the `start_date` before and after the call.

### Manual Verification
- Verify the homepage loads at `/`.
- Verify the dashboard loads at `/p/fat2fit/today`.
- Verify the "Reset Day" button appears in the profile and correctly resets the timeline.
