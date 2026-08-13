# Plan: Fit2Fit Foundation & Premium Rebrand

Rebuilding the application into a production-ready wellness platform with a premium purple-accented design system, database-driven program content, and unified auth.

## Design System
- Update `src/styles.css` with Premium Purple (`#7C3AED`), Warm White, and larger rounded corners.
- Define shared layout components for public, participant, and dashboard views.

## Public Website
- **Landing Page (`src/routes/index.tsx`)**: Complete rewrite with premium C9-focused content, interactive timeline, and dashboard preview mockup.
- **New Routes**:
  - `/program`: Deep dive into C9.
  - `/how-it-works`: Step-by-step guide.
  - `/nutrition`: Recipe and hydration focus.
  - `/movement`: NEAT and activity guide.
  - `/faq`: Comprehensive wellness Q&A.
  - Legal: `/privacy`, `/terms`, `/medical-disclaimer`.

## Backend & Auth
- **Database Schema Migration**:
  - `program_tasks`: Move C9 tasks from hardcoded logic to DB.
  - `roles`: Explicit Participant/Coach/Admin mapping.
  - `coaches`: Relationship between staff and participants.
- **Unified Auth (`src/routes/login.tsx`)**: Single-page toggle for Sign In/Join Program with role-based routing.
- **RLS Hardening**: Strict policies to ensure data isolation.

## Technical Details
- **Architecture**: TanStack Start with server functions for identity resolution.
- **State Management**: TanStack Query for DB-driven program content.
- **Animations**: Framer Motion for premium "wellness" feel.
