# Nutrition Engine Root-Cause Fix

The user is encountering persistent "not found" or "generation" errors when trying to create a personalized plan. The root cause is likely a combination of API versioning issues, model naming mismatches in the Gemini fallback chain, and a lack of robustness in the server-to-client data flow when the AI fails.

## User Review Required

> [!IMPORTANT]
> This fix targets the "Create My Plan" failure. It ensures that even if the high-fidelity AI fails, the system provides a scientifically sound fallback plan based on the program booklet (C9/DX4) so the user is never stuck.

- Do you have any specific "Plan B" (fallback) meal suggestions for Indian users (e.g., standard Dal/Rice portion) if the AI is completely unavailable?

## Technical Details

### 1. Robust AI Client (`src/lib/ai/gemini.server.ts` & `src/lib/ai/nutrition.server.ts`)
- **Fix Model Naming**: Standardize on `gemini-1.5-flash` across all calls. Some fallbacks were using `gemini-pro` which might not be enabled or named correctly in the specific API version.
- **Deep Version Check**: The `NOT_FOUND` error in the screenshot indicates the specific `model + version` combination is invalid. I will update the logic to try `v1/models/gemini-1.5-flash` and `v1beta/models/gemini-1.5-flash` explicitly.
- **Improved Error Parsing**: Capture and log the full response body on failure to identify if it's a "Safety Filter" block (common with health/diet prompts) versus a "Model Not Found" error.

### 2. Scientific Fallback Engine (`src/lib/nutrition/fallback.server.ts`)
- **Deterministic Plan Generation**: If AI fails after all retries, the system will now generate a "Template Plan" derived directly from the C9 booklet data.
- **Dynamic Personalization**: Even the fallback plan will use the user's BMR (Mifflin-St Jeor) and Protein targets (1.2-1.5g/kg) to adjust portion sizes, ensuring the "Personalized" promise is kept.

### 3. State Management (`src/components/nutrition/PersonalizedPlan.tsx`)
- **Refetch Logic**: Ensure that `generateMutation` properly invalidates `profile-readiness` and `my-nutrition-plan` to avoid UI ghosting where a "Plan is Ready" button persists after a failed attempt.
- **Detailed Error UI**: Instead of a generic toast, show a specific "AI is busy, generating scientific template instead" message if the fallback is triggered.

### 4. Database Integrity
- **Log Audit**: Add a more detailed error field to `ai_generation_logs` to store the raw Gemini error JSON for future debugging.
