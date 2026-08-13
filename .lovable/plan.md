# Plan: Fit to Fit Premium Rebrand (Auth & Data)

Finalizing the premium wellness rebrand for **Fit to Fit** by updating the authentication flow, role-based logic, and database schema.

## User Review Required

> [!IMPORTANT]
> The database migration for `participant_programs` and `user_roles` will be applied to isolate participant data and enforce premium role-based access control.

- **Auth Identifier**: Users can now log in using **Email** or **FBO ID** interchangeably.
- **Role Redirection**: Redirection paths are standardized: `admin` -> `/admin`, `coach` -> `/dashboard`, `participant` -> `/p/today`.

## Proposed Changes

### Database & Security
- Implement `public.user_roles` table and `has_role` security-definer function.
- Create `public.participant_programs` to track active program assignments.
- Update `public.task_completions` to reference `participant_program_id`.
- Enable RLS on all new tables with grants for `authenticated` and `service_role`.

### Authentication Logic
- Update `src/lib/auth.functions.ts` to handle the new `participant` and `coach` roles.
- Refine `resolveLoginIdentifier` to lookup by FBO ID or Email.
- Simplify `src/routes/_authenticated.tsx` to use the new roles for gating access.

### Frontend Rebranding
- Standardize "Fit to Fit" and "F" branding across all auth routes.
- Update `/onboarding` and `/today` routes to use premium purple accent and `2xl`/`3xl` border radii.

## Technical Details

### SQL Migration
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'participant');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.participant_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON public.participant_programs TO authenticated;
GRANT ALL ON public.participant_programs TO service_role;

ALTER TABLE public.participant_programs ENABLE ROW LEVEL SECURITY;
```

### Auth Mapping
| Role | Redirection Path |
| :--- | :--- |
| `admin` | `/admin` |
| `coach` | `/dashboard` |
| `participant` | `/p/today` |
