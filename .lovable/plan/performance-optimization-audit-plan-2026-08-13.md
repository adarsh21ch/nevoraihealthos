# Performance & Optimization Audit Plan

The goal is to eliminate lag, improve responsiveness, and optimize database/network egress for the Fat2Fit Health OS application.

## User-facing changes
- **Faster Transitions**: Navigation between dashboard sections will feel near-instant.
- **Improved Responsiveness**: Reduced "loading states" and smoother interactions.
- **Reliable Login**: Hardened authentication flow to prevent stalls during high latency.

## Technical details
- **Frontend Optimization**: 
  - Increase `staleTime` in TanStack Query to cache data longer (reduce redundant fetches).
  - Implement smarter preloading for authenticated routes.
  - Optimize the `_authenticated` route guard to avoid redundant Supabase auth checks.
- **Backend Optimization (Server Functions)**:
  - Consolidate multiple database calls into single optimized queries using Supabase `.select()` with relations.
  - Implement server-side caching for stable content (recipes, products, tips).
  - Use `Promise.all()` for parallel database operations where sequential execution is not required.
- **Database Egress**:
  - Enforce explicit column selection (no `.select('*')`).
  - Add indexes for frequently queried columns like `user_id`, `customer_id`, and `log_date`.
- **Identity Resolution**:
  - Optimize `get_my_auth_context` to use a single query instead of multiple checks.
