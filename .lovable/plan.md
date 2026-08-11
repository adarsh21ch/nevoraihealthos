# Phase 1: Domain Routing Implementation

This plan implements hostname-based tenant resolution, allowing custom domains (e.g., `fat2fit.nevorai.com`) to resolve directly to their respective tenant portals.

## 1. Database Schema
- Apply migration to add `custom_domain` column and unique index to `public.tenants`.
- Ensure appropriate RLS grants for `anon`, `authenticated`, and `service_role`.

## 2. Tenant Resolution Engine
- Create `src/lib/tenant.ts` with logic to resolve tenants from hostnames, query parameters, or paths.
- Handle reserved platform hosts (e.g., `healthos`, `admin`, `www`) and Lovable preview URLs.

## 3. Root Integration
- Update `src/routes/__root.tsx` to include `TenantProvider` and the resolution logic in the root loader.
- Create `DomainNotConfigured` component for unrecognized hostnames.

## 4. Routing Flexibility
- Modify `src/routes/_authenticated/p.$tenantSlug.tsx` and its children to support being rendered both under `/p/$tenantSlug` and at the root `/` when a domain is resolved.
- Implement `TenantGate` to handle conditional rendering based on the resolved tenant.

## 5. Admin UI
- Update Tenant Detail page to include a `custom_domain` field and display the live URL.

## Technical Details
- Use `resolveTenantHint` in the root loader to fetch tenant data during SSR.
- Provide `tenant` context globally via `TenantProvider`.
- Use `isReservedPlatformHost` to prevent accidental tenant resolution on main platform pages.
