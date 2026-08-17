# Fat2Fit — Phase 10: Content Integration & Program Correction

Integrate live-session transcript material, build the registration funnel, add self-assessment tools, and correct program data.

## User Review Required

> [!IMPORTANT]
> - Confirm the **Next Session Date/Time** to show on the public site.
> - Confirm the **Session Link** for the confirmation email.
> - Confirm if **Resend** is the active email provider (already set up for BMI leads).

## Proposed Changes

### 1. Database & Security
- **New Tables**:
    - `session_registrations`: `id`, `name`, `email`, `phone`, `consent_at`, `created_at`.
    - `session_settings`: `id`, `next_session_at`, `session_link`, `updated_at`.
- **Modifications**:
    - `bmi_leads`: Add `self_score_data` (JSONB) and `warning_signs_count` (int).
    - `knowledge_base`: Seed with new educational articles and FAQs.
    - `products`: Remove `Therm`, add `ARGI+` and `Herbal Infusion`.
- **Security**:
    - RLS for `session_registrations` (anon insert, admin select).
    - RLS for `session_settings` (anon select, admin update).

### 2. Funnel Step: Live Session Registration
- **Admin Screen**: `/dashboard/session` to set date/link and view registrations.
- **BMI Hand-off**: Update BMI result view to feature the "Join free live session" CTA.
- **Registration Flow**: 
    - Floating/inline form on the landing page.
    - Confirmation/reminder emails (24h, 1h) via Resend.

### 3. Public Interactive Tools
- **Fitness Self-Score**: 6-slider component (0-10) scoring Nutrition, Training, Sleep, Recovery, Tracking, Consistency. Visual radar/bar feedback.
- **Warning-Signs Checklist**: 5-point neutral checklist with medical disclaimer and "common signs" feedback.

### 4. Educational Content & Social Proof
- **Knowledge Base Seeding**: 
    - "The Indian Protein Gap"
    - "Metabolic problems at lower BMI"
    - "Calories Simply"
    - "Carbs/Fats are not villains"
    - "The Five Pillars"
- **Founder Story**: Update landing page with the "arc" (Founder bio section).
- **Transformations**: Text-only results (weight/timeframe) until photos have explicit consent.
- **Hard Rule**: Scour public routes for any mention of Forever/C9/Garcinia/Aloe and remove them.

### 5. Post-Login Fixes (C9 Program)
- **Product Correction**: Update task list and seeded products.
- **Self-Score Integration**: Baseline (Day 1) and Completion (Day 10) self-scores for progress tracking.
- **FAQ Section**: Grounds the AI Coach and public FAQ with transcript-based answers.

## Technical Details
- **Tables**: `session_registrations`, `session_settings`.
- **Server Functions**: `submitSessionRegistration`, `updateSessionSettings`, `getSessionSettings`.
- **UI Components**: `FitnessSelfScore`, `WarningSignsChecklist`, `SessionRegistrationForm`.
- **AI**: Ground the coach with the new `knowledge_base` entries.

```text
Products Update:
- Remove: Therm
- Add: ARGI+ (L-arginine)
- Add: Herbal Infusion (Tea)
- Tasks: Update all tasks referencing "Therm" to "ARGI+" or appropriate daily timing.
```
