# Admin Dashboard Production Readiness Plan

This plan outlines the steps to make the Health OS Admin Dashboard production-ready by wiring up real data, fixing navigation, and implementing the Access Code management system.

## User Review Required

> [!IMPORTANT]
> The admin account `teamnevorai@gmail.com` will have full control over global content and access codes.

- **Access Codes**: Users will need a valid, unused access code to join a program. Admins can generate these in the new "Access Codes" tab.
- **Navigation**: The sidebar will be fully functional, linking to Users, Programs (Content), and the new Access Codes management.

## Proposed Changes

### Database & Security
- Implement the `access_codes` table and RLS policies.
- Ensure `app_role` enum includes `platform_admin`, `tenant_owner`, and `coach`.
- Add `is_platform_admin` and `is_app_admin` RPC functions for secure server-side checks.

### Server Functions
- **Access Codes**: Create `getAccessCodes`, `generateAccessCodes`, and `deleteAccessCode` functions.
- **Dashboard Stats**: Update `getDashboardStats` to return real counts for users and active programs.
- **Admin Content**: Use `getAdminPrograms`, `getAdminProducts`, etc., to drive the content manager.

### Frontend & UI
- **Admin Layout (`src/routes/admin.tsx`)**:
    - Wire sidebar buttons to `Link` components.
    - Fetch and display real dashboard stats.
    - Add "Access Codes" to the navigation.
- **Access Codes View (`src/routes/admin/access-codes.tsx`)**:
    - New route to list, generate, and delete access codes.
- **Content Management**: Link the "Programs" sidebar item to the existing `AdminContentManagement` view.
- **Settings**: Add a basic placeholder route for future platform settings.

## Technical Details

### Database Schema
```sql
CREATE TABLE public.access_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    tenant_id uuid REFERENCES public.tenants(id),
    created_at timestamptz DEFAULT now(),
    used_at timestamptz,
    customer_id uuid REFERENCES public.customers(id)
);
```

### Route Wiring
- `/admin` -> Overview
- `/admin/tenants` -> Users (Customers)
- `/admin/content` -> Content/Programs
- `/admin/access-codes` -> Access Codes management
- `/admin/settings` -> System Settings
