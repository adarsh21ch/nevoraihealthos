# Plan: Phase 8B — Participant Experience UI/UX Redesign

Redesign the core participant experience focusing on **Today**, **Journey**, and **Diet** to remove empty states, improve hierarchy, and create a premium editorial wellness feel.

## 1. Today Page Overhaul
- **Hero & Header**: Update to "Good morning, [Name]" with Day X of 9 and a visual progress ring.
- **Hero Card**: Add a "Today's Focus" card with the most important action and a "Start Today's Plan" CTA.
- **Tasks Checklist**: Clean up the checklist to be more interactive and organized by slot (Morning, Noon, etc.).
- **Hydration**: Redesign the hydration tracker with an attractive visual progress component and quick logging.
- **Daily Check-in**: Add mood and energy tracking with simple emoji/icon selection.
- **Progress Snapshot**: Show starting, current, and target weight if available.
- **AI Insight**: Integrate the AI Coach Insight more seamlessly into the page flow.
- **Next Action**: Add a clear "Next" CTA at the bottom of the page.

## 2. Journey Page Overhaul
- **Header**: Redesign with a progress bar and consistent editorial typography.
- **Vertical Timeline**: Create a beautiful vertical timeline showing Completed, Current, and Locked days.
- **Locked States**: Clearly communicate prerequisites for locked days.
- **Milestone Insights**: Integrate stored AI insights at key milestones.

## 3. Diet & Nutrition Experience
- **Profile Gates**: Overhaul "PersonalizedPlan.tsx" to show clear progress towards a complete profile (percentage + missing fields) rather than just a simple "Incomplete" message.
- **Generation State**: Add a premium loading experience for plan generation.
- **My Plan**: Redesign the generated plan view with clear targets (calories, protein, hydration) and editorial meal cards.
- **Personalization Highlights**: Show why the plan is personalized (e.g., "Vegetarian", "Indian Foods").
- **Free Foods & Recipes**: Improve the presentation of these sections to match the premium editorial style.

## 4. Shared UX Systems
- **Loading States**: Implement skeleton screens and progress indicators for all async sections.
- **Empty States**: Ensure every empty state provides context, explanation, and a clear next action.
- **Visual Consistency**: Standardize cards, buttons, typography (Instrument Serif + Inter), and spacing across all participant routes.
- **Responsive Layout**: Ensure a mobile-first approach with centered content on larger screens.

## Technical Details
- Reuse existing `createServerFn` from `today.functions.ts`, `journey.functions.ts`, and `nutrition.functions.ts`.
- Update `PersonalizedPlan.tsx` to handle the new profile completion visualization.
- Modify `src/routes/_authenticated/p.$tenantSlug.tsx` (Layout) if needed for global navigation consistency.
- Maintain Supabase RLS and multi-tenancy constraints.
