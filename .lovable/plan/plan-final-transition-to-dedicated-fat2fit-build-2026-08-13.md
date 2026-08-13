# Plan: Final Transition to Dedicated Fat2Fit Build

The project is pivoting from a multi-tenant platform ("Health OS") to a dedicated wellness application for the **Fat2Fit** program. This plan focuses on rebranding the user-facing site, cleaning up the codebase, and preparing it for production.

## User-Facing Changes
### Branding & Identity
- Replace all remaining "Health OS" references with "Fat2Fit" in the UI (headers, landing page, join flow).
- Update the landing page (`src/routes/index.tsx`) to be a dedicated Fat2Fit portal rather than a multi-tenant marketing site.
- Replace the "H" logo with a "F2F" or Fat2Fit brand mark.

### Core Experience
- The site will default to the `fat2fit` program context.
- Landing page will feature the Fat2Fit program benefits (C9 kit, personalized diet, tracking).
- Join flow and onboarding will be refined for the Fat2Fit journey.

## Technical Details
### Codebase Cleanup
- **Routing**: Update `src/routes/index.tsx` to stop marketing "Infrastructure/Solutions" and instead market the Fat2Fit program.
- **Context**: Ensure the `tenant` context defaults to `fat2fit` for all operations.
- **Images/Media**: Use signed URLs and WebP compression (already mandated by egress rules).

### Implementation Steps
1. **Landing Page Overhaul**: Modify `src/routes/index.tsx` to reflect the Fat2Fit program.
2. **Branding Updates**: Edit `src/routes/__root.tsx` and `src/routes/p.$tenantSlug.join.tsx`.
3. **Internal Logic**: Ensure `src/lib/tenant.ts` and `src/lib/diet.functions.ts` reflect the single-brand focus.
4. **Verification**: Run a final check against "Fat2Fit" keywords and ensure the join-to-onboarding flow is flawless.

## Technical Details for Dev
- No new tables required (using existing `tenants`, `customers`, `diet_plans` structure).
- Enforcing `fat2fit` slug in `src/routes/index.tsx` for immediate redirection or branded content.
- Clean up the navigation menu in the landing page (Infrastructure/Pricing -> Journey/Results/About).
