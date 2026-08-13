# Fat2Fit AI Nutrition Engine Audit & Personalized Health Profile

This plan covers Phase 7, which focuses on auditing the existing AI nutrition system and implementing a comprehensive, multi-step health profile for participants to ensure high-quality AI personalization.

## Technical Details

### 1. AI Nutrition System Audit
- **Gemini Integration**: Audit `src/lib/ai/nutrition.server.ts` and `src/lib/ai/gemini.server.ts`.
- **Knowledge Grounding**: Verify RAG flow in `src/lib/ai/knowledge.server.ts`.
- **Logic Verification**: Ensure strict C9/DX4 track isolation and allergy safety.
- **Methodology**: Confirm protein and calorie calculations are traceable and not arbitrary.

### 2. Multi-Step Onboarding Overhaul
- **New Onboarding Flow**: Replace the current basic onboarding with a 12-step guided experience in `src/routes/onboarding.tsx`.
- **Database Schema**: Extend `customers` table to store comprehensive health and lifestyle data (measurements, dietary preferences, lifestyle, etc.).
- **Profile Readiness**: Implement a validation gate to prevent AI plan generation without sufficient data.
- **Profile Management**: Allow participants to update their profile while maintaining measurement history.

### 3. Implementation Steps

#### Database & Server Functions
- Add necessary columns to `customers` table via migration.
- Create `src/lib/profile/profile.functions.ts` for profile management and validation.
- Update `src/lib/nutrition/nutrition.functions.ts` to include a profile readiness check before calling Gemini.

#### UI Components
- Rebuild `src/routes/onboarding.tsx` as a multi-step experience using Framer Motion for premium transitions.
- Update `PersonalizedPlan` component to show a "Complete Profile" prompt if not ready.

#### AI Grounding
- Update prompts in `src/lib/ai/nutrition.server.ts` to consume the new rich profile data.
- Ensure strict adherence to allergies and program track.
