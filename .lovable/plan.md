---
name: Tenant Routing and Branding Fix
description: Fix Fat2Fit slug (no hyphens), dedicated custom domain landing, and portal routing
type: feature
---

## Technical Details

1.  **Database Update**:
    - Change tenant slug from `fat-to-fit` to `fat2fit` for the "FAT TO FIT" tenant.
    - This ensures URLs look like `.../p/fat2fit/...` instead of `.../p/fat-to-fit/...`.
2.  **Branded Landing Logic**:
    - Modify `src/routes/index.tsx` to detect when it's being viewed on a custom domain or with a resolved tenant.
    - Instead of a visible redirect to `/p/slug/join`, it will render the branded entry point (or redirect instantly if preferred).
3.  **Tenant Slug Consistency**:
    - Ensure all routes and functions use the updated slug.
    - Since most logic uses `tenant_id` (UUID), this should be safe, but I will check for hardcoded slug references.

## User-facing Changes

1.  **Cleaner URLs**: The Fat2Fit portal will now use `/p/fat2fit` instead of `/p/fat-to-fit`.
2.  **Dedicated Domain Entry**: Visiting `fat2fit.nevorai.com` will now correctly show the Fat2Fit website/portal entry instead of the Health OS platform landing page.
3.  **Seamless Redirection**: Logged-in users on custom domains will be automatically directed to their personal dashboard.
