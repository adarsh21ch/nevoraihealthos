# Plan: Personalized Diet & Missing Profile Fix

Optimizing the **Diet tab** to allow direct profile completion via a modal/drawer without navigating away, fixing UI visibility issues, and ensuring Indian-centric nutrition logic.

## User Review Required

> [!IMPORTANT]
> The current "Complete Profile" flow redirects users to the Profile page. I will change this to a **Direct Edit Modal** that appears inside the Diet tab.

- **Direct Entry**: Clicking a "missing info" chip or the main button will open the edit interface immediately.
- **UI Fix**: The "white cell with greenish line" background issue will be resolved by standardizing the card container and text visibility.
- **Nutrition Logic**: Updating the AI Coach prompt to emphasize Indian home-cooked meals (Dal, Sabzi, Roti) and local market availability.

## Technical Details

### Frontend Changes
- **`PersonalizedPlan.tsx`**: 
  - Integrate `ProfileEditDrawer` for direct profile updates.
  - Refactor the missing information grid to be interactive buttons.
  - Fix color contrast and text visibility in the "Almost Ready" panel.
- **`DietTab.tsx`**: Add "My Personalized Plan" tab-specific layout fixes if needed.

### Backend Changes
- **`nutrition.server.ts`**: 
  - Enhance the prompt with specific instructions for Indian urban and home-cooked diet patterns.
  - Add explicit "Veg/Non-Veg/Egg" logic to ensure clear substitution options.
- **`profile.functions.ts`**: Ensure the validation logic correctly maps the missing fields to labels.

### Visual Polish
- Standardize the "Incomplete" card design to match the premium emerald editorial aesthetic.
- Ensure proper Z-index and backdrop for the modal/drawer on both mobile and desktop.
