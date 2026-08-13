# Plan: Personalized AI Nutrition Engine (Phase 6A)

Implement a personalized AI nutrition system for Fat2Fit that provides tailored meal plans based on participant profile, lifestyle, and dietary preferences using structured Gemini AI outputs and approved Indian food data.

## User Review Required

> [!IMPORTANT]
> The protein and calorie target formulas will be implemented as configurable placeholders until the official Fat2Fit methodology is provided.

- **Formula Source:** Please confirm if a specific BMR/Protein formula (e.g., 1.5g/kg for active) should be used, or if the system should strictly wait for "Platform Settings" configuration.
- **Meal Slots:** The default slots will be Morning, Breakfast, Lunch, Snack, Dinner. Are there additional slots required for Shift Workers?

## Proposed Changes

### 1. Database Schema (Supabase)
- Create `nutrition_plans` table:
    - `id`, `participant_id`, `tenant_id`, `version`, `status` (DRAFT, PUBLISHED, etc.).
    - `plan_data` (JSONB): `summary`, `daily_targets`, `meals`, `coach_notes`.
    - `generated_at`, `model_info`.
- Create `meal_logs` table:
    - `id`, `participant_id`, `plan_id`, `meal_id`, `date`, `status` (COMPLETED, SUBSTITUTED, SKIPPED).
    - `substitution_data` (JSONB).
- Grant access to `authenticated` and `service_role`.
- Enable RLS: Users can only see their own plans/logs.

### 2. Personalization Engine (Server Functions)
- **`src/lib/nutrition/nutrition.functions.ts`**:
    - `generatePersonalizedPlan`: Fetches customer data, measurements, and program info. Sends to Gemini with a strict schema-enforcement prompt.
    - `getLatestPlan`: Retrieves the active `PUBLISHED` plan.
    - `logMealStatus`: Updates meal adherence.
    - `getFoodAlternatives`: Calls Gemini to suggest substitutes within program constraints.
- **`src/lib/ai/nutrition.server.ts`**:
    - Server-side Gemini logic for nutrition.
    - Specialized prompt for Indian food patterns and lifestyle adaptation (Student, Office Worker, etc.).
    - Strict JSON output validation.

### 3. Participant UI Improvements
- **`src/routes/_authenticated/p.$tenantSlug.diet.tsx`**:
    - Add "My Personalized Plan" tab.
    - Display daily targets (Protein/Calories) with progress bars.
    - Interactive meal timeline with "Mark as Complete" and "Find Alternative" buttons.
- **`src/components/nutrition/PersonalizedPlan.tsx`**:
    - New component for the premium editorial meal plan display.
- **`src/components/nutrition/AiCoachInput.tsx`**:
    - Floating action button/input for "Ask your Coach" about nutrition.

### 4. Admin Configuration
- **`src/routes/admin/settings.tsx`**:
    - Add "Nutrition Methodology" section to define target multipliers (e.g., Protein g/kg).

## Technical Details
- **AI Constraints:** Gemini will be prohibited from prescribing medical advice or inventing nutritional values outside the approved Fat2Fit set.
- **Egress Optimization:** Cache generated plans. Do not re-generate on every visit.
- **Indian Food Bias:** Prompt engineering to prioritize Dal, Paneer, Curd, and Millets for regional relevance.
- **TanStack Start:** Use `createServerFn` for all Gemini calls to protect API keys.

## Verification Plan
- **Manual QA:** Test plan generation for "Vegetarian Student" vs "Non-Vegetarian Office Worker".
- **Validation:** Verify that "Find Alternative" respects the "Vegetarian" preference.
- **Security:** Verify RLS by attempting to read a plan from another user ID via console.
