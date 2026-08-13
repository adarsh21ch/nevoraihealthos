# Participant App Information Architecture & Profile Overhaul

Reorganize the participant application to focus on a clear information architecture, premium profile experience, and contextual gates for incomplete profiles.

## User-Facing Changes
- **New Navigation**: Standardized 5-tab bottom bar: Today, Journey, Diet, Kit, Profile.
- **Profile Hub**: A dedicated health and program profile replacing the generic "Guide" tab.
- **Smart Completion**: Progress indicators and contextual "Complete Profile" prompts that lead directly to missing information.
- **Knowledge Reorganization**: Guide content integrated logically into Profile, Kit, and Diet sections.
- **Contextual Plan Creation**: Clear states in the Diet tab for incomplete profiles, ready-to-build, and generating status.

## Technical Details

### 1. Navigation & Routes
- Update `src/routes/_authenticated/p.$tenantSlug.tsx` to reflect the new 5-tab structure.
- Create `src/routes/_authenticated/p.$tenantSlug.profile.tsx` as the main profile hub.
- Move/Redirect `src/routes/_authenticated/p.$tenantSlug.guide.tsx` logic into the new sections.

### 2. Profile System
- Implement `ProfileHub` component to show avatar, program info, and completeness percentage.
- Create focused edit modals in `src/routes/_authenticated/p.$tenantSlug.profile.tsx` that update the `customers` table via `updateMyProfile` server function.
- Add "Measurement History" entry in Profile to show baseline vs current weight/waist.

### 3. Logic & Gates
- Enhance `validateProfileReadiness` in `src/lib/profile/profile.functions.ts` to return specific missing fields and their corresponding onboarding steps.
- Update `PersonalizedPlan` component empty states to handle the "Incomplete Profile" and "Ready to Build" flows with proper CTAs.
- Implement a reusable `ProfileGate` component for any feature requiring specific data.

### 4. Content Migration
- **Profile**: Moves Program Overview, Goal Setting.
- **Kit**: Moves How to use supplements, Preparation instructions.
- **Diet**: Moves Hydration strategy, Understanding tracks, Recipes (already in Diet).

## Architecture Mapping
- **UI Consistency**: Maintain "Fat2Fit" Deep Emerald and Health Green palette with Instrument Serif typography.
- **Data Source**: Use existing `customers`, `measurements`, `participant_programs` tables.
- **Mobile-First**: Large touch targets and card-based layout for the profile.
