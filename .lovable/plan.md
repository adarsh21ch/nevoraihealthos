# Plan: Fat2Fit C9 Protocol Integration & Premium Aesthetic

Pivoting the application to a dedicated Fat2Fit C9 nutritional reset platform with Indian-specific meal plans, strict measurement protocols, and premium aesthetic tracking.

## User Review Required

> [!IMPORTANT]
> The C9 protocol strictly locks weight recording to Day 1 and Day 10. Users will not be able to log daily weight fluctuations, as per the official booklet's advice to prevent dropout.

- **Indian Meal Set**: I've added Dal Tadka, Paneer Bhurji, and Grilled Chicken (600 cal) + Oats Idli (300 cal Day 9) as the base Indian recipes. Should we add more local options?
- **Coach Portal**: Coaches can now upload their own product images via the new "Products" tab in the dashboard.

## Proposed Changes

### 1. Branding & Rebranding
- [x] Update landing page hero and features for C9.
- [x] Rebrand "Health OS" references to "Fat2Fit".
- [x] Unify "F" logo across all portals.

### 2. C9 Protocol Implementation
- [x] Add DX4-first track selector in onboarding.
- [x] Seed `programs` and `products` with C9-specific kit quantities and instructions.
- [x] Implement "Reset" (Day 1-2) vs "Steady" (Day 3-9) visual status in the Today portal.
- [x] Add Day 9 F15 transition card and Day 10 Vital5 maintenance offer.

### 3. Diet & Nutrition (Indian Focused)
- [x] Create `public.recipes` table and seed with Indian 600-cal and 300-cal options.
- [x] Update `getDietPlan` to fetch and display these local options to customers.
- [x] Refine C9 product timing (Aloe, Therm, Fiber, Garcinia) in the diet view.

### 4. Progress & Biometrics
- [x] Lock weight/waist additions in `ProgressPage` to Day 1 and Day 10 only.
- [x] Update charts to show premium aesthetic trends for weight and waist using AreaCharts.

### 5. Admin & Coach Management
- [x] Add `Products` management to the Coach Dashboard.
- [x] Implement image upload with `cacheControl: '31536000'` to the `content` bucket.

## Technical Details
- **Schema**: New `public.recipes` table with RLS.
- **Components**: Updated `TodayPage`, `ProgressPage`, `DietPage`, and `OnboardingPage`.
- **Logic**: Track-based schedule resolution in `get_day_with_tasks` RPC (already seeded) and frontend indicators.
- **Egress**: All new storage uploads enforce 1-year cache headers.
