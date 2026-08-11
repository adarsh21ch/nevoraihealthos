# Plan: Fix Fat2Fit Domain Isolation and Build Diet Flow

The user is frustrated that `fat2fit.nevorai.com` shows the platform landing page instead of the Fat2Fit website. I will fix the routing isolation and build the requested Diet Plan feature.

## User Review Required

> [!IMPORTANT]
> The Diet Plan feature will be calculated based on the C9 (Clean 9) program by Forever Living Products, as requested.

- Does the C9 calorie target (600 for women, 800 for men) match your specific coaching guidelines?
- Should the Diet Plan be visible immediately after onboarding, or as a dedicated section in the "Guide"?

## Proposed Changes

### 1. Fix Domain Isolation & Branding
- **Update `src/routes/index.tsx`**: Ensure visitors to `fat2fit.nevorai.com` see a branded landing page or are instantly redirected to the join/login flow, never the "Health OS" platform page.
- **Update `src/routes/__root.tsx`**: Ensure the tenant context is properly passed to all child routes.
- **Update `src/routes/_authenticated.tsx`**: Strengthen the RLS-equivalent check to prevent cross-tenant access and ensure Fat2Fit users stay within their domain.

### 2. Authentication & Onboarding
- **Update `src/routes/p.$tenantSlug.join.tsx`**: Optimize the join flow for mobile and ensure it supports the "Fat2Fit" branding.
- **Update `src/routes/onboarding.tsx`**: Add fields for Age, Height, Weight, and Gender (required for diet calculation).

### 3. Diet Plan Feature (Fat2Fit)
- **Create `src/lib/diet.functions.ts`**: Server function to calculate BMR and generate a personalized diet plan using C9 products.
- **Create `src/routes/_authenticated/p.$tenantSlug.diet.tsx`**: New route for customers to view their personalized diet plan.
- **Update `src/routes/_authenticated/p.$tenantSlug.tsx`**: Add "Diet" to the bottom navigation bar.

### 4. Database & Logic
- **Migration**: Ensure `customers` table has `age`, `height_cm`, `weight_kg`, and `gender` columns.
- **RLS**: Verify that customers can only read their own data and their specific tenant's content.

## Technical Details
- **Tenant Resolution**: Using the `resolveTenantHint` logic to detect `fat2fit.nevorai.com` and fetch the tenant record.
- **Calculations**: Using the Mifflin-St Jeor Equation for BMR calculation.
- **Routing**: Leveraging TanStack Router's `beforeLoad` and `context` for secure isolation.
