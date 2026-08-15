# Public Site Rebuild & BMI Tool Implementation

Rebuild the public landing page to remove all brand references (Forever Living, C9) and establish a lead-generation BMI tool as the primary conversion element.

## Content Removal (Public Site)
- **Zero Exposure:** Remove all occurrences of "Forever", "C9", "Clean 9", and specific product names from public routes.
- **Content Cut:** Delete detailed program grids, phase breakdowns, and unverified health claims (e.g., "3X energy").
- **Legal Compliance:** Move the `AffiliationDisclaimer` to authenticated-only routes.

## BMI Tool Implementation
- **Asian-Pacific Standards:** Use WHO BMI cutoffs (Normal: 18.5 – 22.9, Overweight: 23.0 – 24.9, Obese: >= 25.0).
- **Interactive UI:** Immediate on-page result showing BMI, category, and healthy range.
- **AI Personalization:** Gemini-powered wellness summary (server-side, no product mentions, medical disclaimer included).
- **Paediatric Safety:** If age < 18, show advice to see a paediatrician instead of adult BMI category/AI report.

## Technical Details
- **Database:** `public.bmi_leads` table for lead storage with strict RLS (anon insert only, admin select).
- **Email:** Resend integration for asynchronous report delivery.
- **Admin Panel:** New "Leads" section in the dashboard to view and manage BMI submissions.
- **Responsive Design:** Mobile-first layout with no horizontal scroll at 375px.

## Security & Privacy
- **Consent:** Mandatory, unticked checkbox for DPDP Act compliance.
- **Data Protection:** Elevated roles only for health data access via `has_role` security definer.
- **Secrets:** Email API keys stored as project secrets.
