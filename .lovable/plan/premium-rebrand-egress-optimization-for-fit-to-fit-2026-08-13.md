# Premium Rebrand & Egress Optimization for Fit to Fit

Upgrade the Fit to Fit landing page with a premium, weight-loss-focused aesthetic, improved typography, and optimized egress performance.

## User Review Required
> [!IMPORTANT]
> - I am replacing the "Inter" font with **"Outfit"** for a more premium, modern wellness feel.
> - The color palette remains focused on the `#7C3AED` purple but with improved contrast and glassmorphism.

## Proposed Changes

### 1. Typography & Branding Upgrade
- Replace standard Inter/System fonts with **Outfit** (Sans) and **DM Serif Display** (Serif) for high-end editorial feel.
- Update `src/styles.css` theme variables.
- Fix color contrast in `PillarCard` where text visibility was low.

### 2. High-Conversion Landing Page (Weight Loss Focus)
- **Hero Section**: More impact with metabolic reset messaging.
- **Section Sequence**:
    1. The Problem (Struggling with weight/energy)
    2. The Solution (C9 9-Day Metabolic Reset)
    3. The Science (supplement engine)
    4. The Support (coaching/accountability)
    5. The Community (social proof/trust)
- **Interactive UI**: Add more premium buttons with scale/glow effects and smooth Framer Motion transitions.

### 3. Egress Optimization (Supabase Free Plan)
- Ensure all new images use `lovable-assets` pointers.
- Add `loading="lazy"` and `decoding="async"` to all images.
- Implement server-side pagination for any future data lists.

## Technical Details

### Styling Improvements
- **Glassmorphism**: More refined `.glass-panel` with consistent backdrop filters.
- **Micro-interactions**: Scale-up and subtle glow on hover for CTAs.
- **Contrast Fix**: The cards in the "Engine" section currently have white text on white background due to a theme error; I will force `text-ink` for clarity.

### Files to Modify
- `src/styles.css`: Theme variables and global styles.
- `src/routes/index.tsx`: Full content overhaul with weight-loss focus.
- `src/components/landing/LandingComponents.tsx`: Component upgrades for premium feel.
- `src/routes/__root.tsx`: Add Google Font imports (Outfit & DM Serif Display).
