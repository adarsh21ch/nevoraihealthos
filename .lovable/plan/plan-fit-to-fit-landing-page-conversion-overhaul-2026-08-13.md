# Plan: Fit to Fit Landing Page Conversion Overhaul

Upgrade the public homepage into a long-form, premium, high-conversion wellness program website.

## Design Direction
- **Visuals**: Large editorial typography, generous whitespace, rounded (2xl/3xl) components.
- **Storytelling**: Structured journey from problem identification to C9 solution, program pillars, nutrition, hydration, and accountability.
- **Interactions**: Subtle Framer Motion animations (fade-in, slide-up), sticky navigation, and clear CTAs.

## Core Sections to Implement

### 1. Enhanced Hero
- Headline: "Your 9-day reset. One simple plan. Every day tracked."
- Visual: Application preview mockup showing active program state (Day 4, 56% complete).
- CTAs: Primary "START YOUR C9 JOURNEY", secondary "EXPLORE THE PROGRAM".

### 2. The Problem & "Why Health Matters"
- Cards for "Too Much Information", "No Clear Plan", etc.
- Educational section on sustainable habits (nutrition, activity, sleep).

### 3. Program Engine Deep Dive
- **What is C9?**: Dedicated section with Day 1-9 journey visualization.
- **8 Pillars**: Goal setting, intake, hydration, awareness, recipes, movement, sharing, victory.

### 4. Interactive Application Features
- **Nutrition/Recipes**: Grid of program-friendly recipe previews.
- **Hydration**: Visual tracker mockup (X/8 glasses).
- **Movement**: Lifestyle imagery for walking, stretching, mobility.
- **Progress Tracking**: Recharts-based dashboard visualization for weight and adherence.

### 5. Social Proof & FAQ
- Testimonial carousel structure.
- Comprehensive accordion-style FAQ answering C9 specific questions.

### 6. Final Conversion & Footer
- High-impact gradient CTA section.
- Multi-column footer with program links and disclaimers.

## Technical Details
- **Components**: Move re-usable sections to `src/components/landing/`.
- **Images**: Use Unsplash-based wellness imagery.
- **SEO**: Update head metadata (Open Graph, Meta Descriptions).
- **Responsive**: Mobile-first grid layouts and adjusted typography.
