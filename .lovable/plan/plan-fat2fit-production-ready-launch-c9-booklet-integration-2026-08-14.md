# Plan: Fat2Fit Production-Ready Launch & C9 Booklet Integration

Integrate the official C9 Booklet 2026 into the Fat2Fit platform. This involves enhancing the landing page with real product visuals, providing a downloadable PDF, and establishing admin capabilities for ongoing content management.

## User Improvements

### Landing Page Overhaul
- **Product Showcase Section**: Add a high-fidelity section dedicated to the C9 kit components (Aloe Vera Gel, Fiber, Argi+, etc.) using visuals extracted from the booklet.
- **Visual Storytelling**: Integrate lifestyle and aesthetic background images from the booklet to create a more premium, product-focused feel.
- **Resource Center**: Add a "Library" or "Resources" section on the public website and participant dashboard where users can view and download the official 2026 C9 Booklet PDF.
- **Enhanced FAQ & Knowledge**: Populate the landing page with specific data from the booklet (e.g., dosage instructions, product benefits, and "Free Foods" list).

### Dashboard & Profile
- **Reference Material**: Pin the C9 Booklet in the "Kit" or "Profile" tab for easy access by enrolled participants.

## Technical Details

### Content Management (Admin)
- **Asset Management**: Implement an admin UI for uploading and managing "Global Assets" (PDFs, background images, product photos).
- **Branding Sync**: Ensure the uploaded logo/branding propagates to the PWA manifest and favicon (continuing previous unification work).
- **Public Website Refinement**: Update `src/routes/index.tsx` to include the new product and download sections.
- **Asset Architecture**: Use `lovable-assets` for all binary content (images/PDFs) to maintain a lean repository.

### Component Updates
- **`ProductGrid`**: A new component for showcasing C9 products with details from the booklet.
- **`DownloadButton`**: A reusable component for the official PDF resource.
- **`LandingComponents` Extension**: Add new layout patterns for "Product + Description" split views as requested.
