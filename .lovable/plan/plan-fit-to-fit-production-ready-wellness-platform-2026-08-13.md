# Plan: Fit to Fit Production-Ready Wellness Platform

Transform the current setup into a complete, production-ready wellness platform with a unified design, dynamic program engine, and robust tracking systems.

## Design & Foundation
- **Unified Branding**: Replace all "Fat2Fit" and green `#16a34a` references with **Fit to Fit** and Premium Purple `#7C3AED`.
- **Theme Variables**: Update `src/routes/_authenticated/p.$tenantSlug.tsx` and `src/styles.css` to use the correct semantic tokens for the premium purple palette.
- **Iconography**: Standardize on the "F" iconography with purple accent.

## Core Program Engine
- **Program Resolution**: Update `src/lib/today.functions.ts` and `src/lib/journey.functions.ts` to correctly calculate the current program day and status based on `participant_programs` and `didDX4` logic.
- **Daily Checklist**: Overhaul `src/routes/_authenticated/p.$tenantSlug.today.tsx` to reflect the C9 daily schedule (Morning, Noon, etc.) with animated task completion.
- **Hydration & Logs**: Extend `daily_logs` usage to support interactive water tracking (8 glasses), sleep hours, and mood/energy journaling.

## Participant Features
- **Journey Map**: Enhance `src/routes/_authenticated/p.$tenantSlug.journey.tsx` to show program progress, locked future days, and past completions.
- **Progress & Analytics**: Build a premium dashboard in `src/routes/_authenticated/p.$tenantSlug.progress.tsx` using Recharts to visualize weight, measurements, and adherence trends.
- **Program Completion**: Implement the Day 10 review flow with before/after comparisons and F15 transition reminders.
- **Safety & Disclaimers**: Ensure disclaimers are visible throughout the tracking and onboarding experience.

## Coach & Admin Dashboards
- **Coach View**: Build `/coach` dashboard to monitor participant adherence, flag "Needs Attention" users (no activity > 24h), and facilitate messaging.
- **Admin CMS**: Enable management of programs, tasks, and recipes to avoid hardcoded content.

## Technical Details
- **RLS & Security**: Verify and tighten Supabase RLS policies for `daily_logs`, `measurements`, and `participant_programs`.
- **Egress Optimization**: Strictly use explicit column selection and `.limit()` in all new queries.
- **Production QA**: Perform end-to-end testing from signup/onboarding through to program completion.

## User Review Required
- **Accents**: Confirm if the "Green" theme should be completely removed or if it remains as an option for coaches. (Standardizing on Purple by default).
- **Measurement Units**: Standardizing on kg/cm as per Indian market context.
