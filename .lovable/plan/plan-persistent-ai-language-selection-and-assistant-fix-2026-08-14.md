# Plan: Persistent AI Language Selection and Assistant Fix

The goal is to fix the AI Assistant response display issue, resolve the language switching bugs, and implement a persistent, global language selector for the AI Coach and Chat.

## User Review Required

> [!IMPORTANT]
> The language selector will be placed in the top-right corner of the authenticated participant screens. This setting will persist across all AI features (Coach Insights, Nutrition Assistant, Personalized Plans).

- **Global Language Selection**: A new dropdown in the navigation header to select English, Hindi, or other languages.
- **Persistent Preference**: Your choice is saved to your profile and remembered in every new session or conversation.
- **Assistant Fix**: Resolving the issue where responses only show after a manual refresh.

## Proposed Changes

### Database & Backend
#### [Supabase]
- Migration: Added `preferred_language` to `customers` table and `language` to `nutrition_plans`. (Completed)

#### [AI Engine]
- `src/lib/ai/gemini.server.ts`: Update `generateCoachMessage` and `chatWithAi` to respect the `preferred_language` context in the prompt.
- `src/lib/ai/nutrition.server.ts`: (If applicable) Update to respect language preference when generating the full 9-day plan.

### Components & UI
#### [Navigation]
- `src/components/ParticipantNavigation.tsx`: Add a language selector dropdown in the `ParticipantSidebar` (desktop) and `header` (mobile).

#### [Nutrition Assistant]
- `src/components/nutrition/PersonalizedPlan.tsx`: 
    - Completely rebuild the Nutrition Assistant UI to handle real-time messaging properly.
    - Use `useMutation` and local state to show the AI response immediately without a refresh.
    - Ensure the input is fully interactive and doesn't get "stuck".

### Routes & Logic
#### [Profile/Settings]
- `src/lib/profile/profile.functions.ts`: Add a server function to update the user's preferred language.

## Verification Plan

### Automated Tests
- Test language persistence by updating the preference and verifying subsequent AI prompts include the correct language instruction.
- Test the chat flow: send a message, verify the response is displayed immediately in the UI without a manual refresh.

### Manual Verification
- Log in as a participant.
- Change language to Hindi in the top-right dropdown.
- Verify "Coach Insight" on the Today page eventually updates (or next refresh) to use Hindi.
- Open the Diet tab, ask the Nutrition Assistant a question in Hindi, verify the response comes back in Hindi and appears immediately.
- Refresh the page and verify the language selector still shows Hindi.
