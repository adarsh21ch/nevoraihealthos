# Phase 10: Content Integration & Program Correction

Implement the prospect conversion funnel (session registration), interactive wellness tools (Self-Score, Warning Signs), and correct program product data.

## User Review Required
> [!IMPORTANT]
> The public site is now strictly brand-neutral. References to Forever Living and C9 are removed from the landing page.

- **Resend API Key**: Required for BMI report and session registration emails.
- **Session Dates**: Admin must set upcoming session dates in the new dashboard.

## Proposed Changes

### 1. Funnel & Interactive Tools
- **Session Registration**: New `session_registrations` table and funnel component.
- **Fitness Self-Score**: 6-pillar assessment (Nutrition, Training, Sleep, etc.) out of 60.
- **Warning-Signs Checklist**: Neutral 5-item physical indicator screening.
- **BMI Tool Integration**: BMI assessment now flows into Self-Score -> Warning Signs -> Session Registration.

### 2. Branding & Content
- **Brand Neutrality**: Complete removal of "Forever" and "C9" from public-facing code/text.
- **Educational Articles**: Seeding knowledge base with Indian Protein Gap, Metabolic Health, and Calories articles.
- **Founder Story**: Added premium narrative section (career pressure to health optimization).

### 3. Program Correction (Post-Login)
- **Product Catalog**: 
  - Remove: **Therm**
  - Add: **ARGI+** (Nitric oxide/Blood flow)
  - Add: **Herbal Infusion** (Tulsi/Cardamom tea)
- **Task Logic**: Update Day 1-9 tasks to reflect corrected product set.

### 4. Technical Infrastructure
- **Knowledge Base**: Seed `knowledge_base` with Part A4 educational content to ground the AI Coach.
- **Lead Expansion**: Update `bmi_leads` to store Self-Score and Warning Signs data.

## Verification Plan

### Automated Checks
- `grep` check for brand mentions in public routes.
- RLS policy verification for anonymous inserts.
- Zod schema validation for new funnel data.

### Manual Verification
- Test BMI tool end-to-end flow.
- Verify product list in database.
- Check admin visibility of registrations and leads.
