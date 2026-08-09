# Implementation Plan - Phase 1: Schema & RLS

Building the core multi-tenant foundation for Health OS.

## User Review Required

> [!IMPORTANT]
> - This migration sets up **Multi-Tenant RLS**. Tenant A (Distributor A) will never be able to see Tenant B's data.
> - We are using a `public.is_platform_admin` helper to identify platform owners.
> - **Program Content** is global and read-only for tenants.

- [ ] I have reviewed the RLS policies in the technical section below.
- [ ] I understand that I need to manually add the first Platform Admin to the `platform_admins` table via the Supabase Dashboard after this runs (or I can provide the UUID now).

## Proposed Changes

### Database Schema (Migration)

#### 1. Tenant Core & Security Helpers
- `tenants`: Stores distributor branding, colors, and WhatsApp info.
- `platform_admins`: Registry for platform-wide administrators.
- `profiles`: Links `auth.users` to `tenants` (Distributor staff).
- Helper functions: `is_platform_admin`, `is_tenant_member`, `current_customer_ids`, `can_access_customer`.

#### 2. Global Program Content (Shared)
- `programs`: Program definitions (e.g., C9, Fit1).
- `products`: Supplement/product details and videos.
- `program_products`: Junction table for kit contents.
- `program_days`: Daily guidance, themes, and meal plans.
- `day_tasks`: Specific product doses and timings.
- `tips` & `faqs`: General guidance.

#### 3. Tenant-Scoped Customer Data
- `customers`: End-user records (scoped to `tenant_id`).
- `enrollments`: Which program a customer is currently doing.
- `daily_logs`: Water, mood, and notes.
- `task_completions`: Checklist progress.
- `measurements`: Weight and body stats.
- `progress_photos`: Body photo tracking.
- `referrals`: Lead tracking.
- `whatsapp_otp_codes`: OTP storage for the custom WhatsApp auth flow.

### Security & RLS
- **Global Content**: Publicly readable (`anon`, `authenticated`), editable only by platform admins.
- **Customer Data**: Strictly gated. Access allowed only if:
    1. The `auth.uid()` belongs to the customer themselves.
    2. The `auth.uid()` belongs to a member of the tenant (distributor) that owns the customer.
    3. The `auth.uid()` is a platform admin.

## Technical Details

### SQL Migration Strategy
- Enable RLS on all tables.
- Grant `SELECT` to `anon` and `authenticated` for global tables.
- Grant `ALL` to `service_role` for all tables.
- Grant `SELECT, INSERT, UPDATE` to `authenticated` for tenant-scoped tables, protected by RLS.

### Verification Plan
1. Apply migration.
2. Check `supabase--linter` for any missing policies.
3. Verify that `profiles` and `customers` use `tenant_id` for scoping.
