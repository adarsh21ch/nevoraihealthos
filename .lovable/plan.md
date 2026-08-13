---
title: Fat2Fit AI Assistant Implementation
description: Plan for integrating Gemini-powered personalized wellness coaching and fixing dashboard loading stalls.
---

# Plan - Fat2Fit AI Assistant & Performance Fix

Fix the unresponsive dashboard loading state and implement the Gemini AI Assistant for personalized wellness coaching.

## User Review Required

> [!IMPORTANT]
> - The user needs to provide a **Gemini API Key** via the `add_secret` tool (e.g., `GOOGLE_GEMINI_API_KEY`).
> - I will implement the AI Assistant as a "Coach" interface in the Journey or a dedicated tab.

## Technical Details

### Phase 1: Dashboard Reliability (Immediate Fix)
- **Fix Loading Stall**: In `src/lib/today.functions.ts`, ensure `activeProgram` is correctly resolved by checking both `participant_programs` and the `customers` fallback.
- **Graceful Fallbacks**: Enhance `TodayPage` loading/error states with Health OS branding to avoid the blank "Checking status..." feel.
- **Query Optimization**: Use `maybeSingle()` instead of `.single()` where data might be missing to prevent promise rejection stalls.

### Phase 2: AI Infrastructure
- **Files**: 
  - `src/lib/ai/gemini.server.ts`: Gemini SDK wrapper with context injection.
  - `src/lib/ai/gemini.functions.ts`: Server functions for chat and personalized reviews.
- **Context Injection**:
  - `Participant Data`: Name, Goal, Day Number, Track (C9 standard/DX4).
  - `Measurements`: Baseline vs. Current (Weight, Waist).
  - `Daily Logs`: Mood, Hydration, Task completion consistency.
  - `Program Knowledge`: C9/DX4 protocol rules (extracted from `day_tasks` and `products`).

### Phase 3: AI Assistant Features
- **Personalized Review**: A server function to generate a "Morning Motivation" or "Evening Review" based on today's logs.
- **Diet Plan Assistant**: Contextual answers to diet questions based on the C9 booklet knowledge.
- **Progress Review**: Summary of the 9-day journey so far.

## Implementation Steps

### Performance & Loading
1. Refactor `getTodayData` in `src/lib/today.functions.ts` to be more resilient to missing enrollment records.
2. Update `TodayPage` component to handle loading/empty states with better UX.

### Gemini Integration
1. Scaffolding: Create `src/lib/ai/` directory.
2. Logic: Implement `getAssistantResponse` and `generateJourneyInsights` server functions.
3. UI: Add an "AI Coach" floating button or a dedicated section in the `Today` or `Journey` tab.
