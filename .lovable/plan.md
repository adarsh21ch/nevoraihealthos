# Plan: Transition to Dedicated Fat2Fit Program

The user wants to pivot from a multi-tenant "Health OS" platform to a dedicated application specifically for the **Fat2Fit** program. This involves cleaning up generic branding, optimizing the user flow for a single program, and refining the core Fat2Fit features (Diet Plan, C9 integration, Metric tracking).

## User Review Required

> [!IMPORTANT]
> This will prioritize the **Fat2Fit** branding and flow over the generic "Health OS" landing pages. Future updates will focus entirely on the Fat2Fit program logic.

## Proposed Changes

### 1. Branding & Landing Page
- Update `src/routes/index.tsx` to serve as the Fat2Fit landing page instead of a multi-tenant infrastructure site.
- Replace "Health OS" text and logos with "Fat2Fit".
- Remove multi-tenant marketing sections (Infrastructure, Solutions, Pricing).

### 2. Routing & Flow Optimization
- Simplify `src/routes/__root.tsx` to assume a primary tenant flow.
- Update `src/routes/_authenticated.tsx` to streamline customer access to Fat2Fit.
- Ensure `fat2fit.nevorai.com` and the root domain both lead into the same dedicated experience.

### 3. Feature Refinement (Dedicated Fat2Fit)
- **Authentication**: Keep the FBO ID and Access Code requirement but present them as core Fat2Fit entry requirements.
- **Diet Plan**: Finalize the BMR/Calorie calculation and C9 schedule integration in `src/routes/_authenticated/p.$tenantSlug.diet.tsx`.
- **Onboarding**: Clean up the onboarding steps to focus exclusively on what's needed for Fat2Fit/C9.

### 4. Cleanup
- Hide or remove links to the Platform Admin and Distributor Dashboard for the end-user.
- Consolidate tenant-specific routes if they add unnecessary complexity for a single-brand app.

## Technical Details
- **Redirection Logic**: Update the root index to default to the `fat2fit` tenant slug if no specific domain is resolved.
- **Style Overrides**: Lock the global `--accent` color to Fat2Fit's branding (e.g., a specific green or blue).
- **Database**: Retain the `tenants` table but treat the `fat2fit` record as the "system" tenant.

## Verification Plan
- **Landing Page**: Check that `/` shows Fat2Fit content.
- **Authentication**: Verify the join flow specifically for the Fat2Fit program.
- **Diet Logic**: Ensure the calorie calculator works correctly for new signups.
- **Navigation**: Confirm the bottom navigation in the customer dashboard is clear and functional.
