# Phase 2 — Real C9 Content Entry & Management

Complete the content management infrastructure and prepare for the entry of real C9 (Clean 9) program content.

## User Review Required

> [!IMPORTANT]
> I will implement the management UI first. Once done, you can use these tools to enter the real "Clean 9" content, or I can help you transcribe it if you provide the details.

## Technical Details

### 1. Content Management Completion
- **Tips CRUD**: Implement the full management UI for wellness tips in `src/routes/admin/content.index.tsx`.
- **FAQs CRUD**: Implement the full management UI for frequently asked questions.
- **Program Day Builder**: Polish the interface in `src/routes/admin/content/programs.$programId.days.tsx` to handle C9 specifics (Day 1-9 tasks).

### 2. UI/UX Enhancements
- Add multi-select or quick-copy features for tasks between days (useful for repeating tasks in C9).
- Ensure image uploads in the content editor follow the strict compression and cache rules.

### 3. Data Verification
- Verify RLS and grants for the new content tables (`tips`, `faqs`, `program_days`, `day_tasks`).
- Ensure `platform_admin` can manage all global content.

## Proposed Changes

### Content Management Hub
`src/routes/admin/content.index.tsx`:
- Replace "Coming in next pass" placeholders with functional `TipsTab` and `FAQsTab` components.
- Connect these to the existing `saveTip` and `saveFAQ` server functions in `src/lib/admin-content.functions.ts`.

### Program Day Builder
`src/routes/admin/content/programs.$programId.days.tsx`:
- Add a "Copy tasks from Day X" utility to speed up content entry for similar days.
- Improve the layout for mobile (360px) to ensure the builder is usable on the go.
- Add "Focus" and "Meal Guidance" fields to the day editor if missing or incomplete.

### Database
- Double-check `GRANT` statements for `tips` and `faqs` to ensure `platform_admin` (via authenticated role) has full access.
