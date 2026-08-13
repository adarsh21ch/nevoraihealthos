# Plan: Dedicated Fat2Fit Rebranding and Unified Authentication

This plan transitions the application from a multi-tenant "Health OS" platform to a dedicated "Fat2Fit" wellness program application. It focuses on unifying the branding, simplifying the authentication flow, and ensuring the UI/UX matches the Fat2Fit identity.

## User-Facing Changes

### Branding & UI
- **Unified Branding**: Replace all remaining "Health OS" text and placeholder logos with "Fat2Fit".
- **Visual Refresh**: Update colors and UI elements to better suit the Fat2Fit wellness brand (clean, professional, health-focused).
- **Domain Alignment**: Ensure all redirects and internal links point to the `fat2fit` program context.

### Authentication & Onboarding
- **Simplified Login**: Single unified login screen for all users (Admin, Distributor, Customer).
- **Role-Based Access**:
    - **Admins/Distributors**: Use email/password to access management dashboards.
    - **Customers**: Can create accounts using a coach-provided **access code** along with their FBO ID and contact info (Email, Phone, or Facebook ID).
- **Invite Flow**: Coaches (Distributors/Admins) can generate and manage access codes to bring new students into the program.

## Technical Details

### File Modifications
- **`src/routes/__root.tsx`**: Update metadata, titles, and remove multi-tenant "TenantGate" complexity in favor of global Fat2Fit settings.
- **`src/routes/index.tsx`**: Update the landing page to be the Fat2Fit public face, with clear calls to action for joining or logging in.
- **`src/routes/login.tsx`**: Streamline the login page, removing multi-tenant domain checks and unifying the UI under the Fat2Fit brand.
- **`src/routes/p.$tenantSlug.join.tsx`**: Update the signup form to strictly require the Access Code and FBO ID as requested.
- **`src/lib/auth.functions.ts`**: Refine `createCustomerAccount` to properly handle the combination of Access Code + FBO ID and contact methods.
- **`src/lib/admin.functions.ts`**: Add logic for generating and managing access codes for Distributors.
- **`src/routes/dashboard/invite.tsx`**: Improve the invitation UI for coaches to share the Fat2Fit join link and access codes.
- **`src/styles.css`**: Verify and tune Tailwind `@theme` variables for the Fat2Fit aesthetic.

### Database Logic
- Ensure the `access_codes` table is being used correctly to gate new account creation.
- Verify `app_settings` holds the global "Fat2Fit" configuration used across the app.
