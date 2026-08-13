# Phase 6B: AI Knowledge Base & Governance Implementation

We are extending the Phase 6A nutrition system to include a structured knowledge base, RAG (Retrieval-Augmented Generation), and coach oversight.

## User Review Required

- **Initial Knowledge Seed**: I will seed basic C9/DX4 rules. Do you have a specific PDF or document for the "Standard C9" vs "DX4" rules to ensure 100% accuracy?
- **Coach Review Threshold**: Should *every* AI plan require coach approval before being published to the participant, or only those flagged for safety/complexities?

## Proposed Changes

### 1. Database & Security
- **Knowledge Base Table**: Stores approved Fat2Fit program rules, food lists, and recipes.
- **AI Governance Logs**: Tracks every Gemini call for auditing and cost management.
- **RLS Hardening**: Ensures coaches only see their participants' plans and admins manage the KB.

### 2. AI Knowledge Retrieval (RAG)
- **Relevant Chunking**: Implement a server-side filter to select only the KB items matching the participant's track (C9/DX4) and diet (Veg/Non-Veg).
- **Grounding Prompts**: Update Gemini prompts to treat retrieved KB items as the *only* source of truth for program rules.

### 3. Coach & Admin Experience
- **Admin KB Manager**: Interface to add, review, and approve knowledge items.
- **Coach Plan Review**: Dashboard for coaches to review AI-generated plans, edit them, and publish them to participants.
- **Plan Versioning**: Tracks changes between AI generation and coach edits.

### 4. Technical Implementation
- `src/lib/knowledge/`: New module for KB management.
- `src/lib/ai/knowledge.server.ts`: RAG logic for context injection.
- `src/routes/admin/knowledge.tsx`: Admin interface.
- `src/routes/dashboard/plans.tsx`: Coach review dashboard.

## Technical Details
- **Knowledge Types**: PROGRAM, NUTRITION, C9, DX4, C9_KIT, RECIPE, FOOD, PROTEIN, etc.
- **Status Workflow**: DRAFT -> UNDER_REVIEW -> APPROVED -> ARCHIVED.
- **AI Safety**: Flag plans as `PENDING_REVIEW` if Gemini output deviates from strict KB constraints or if participant data is outlier.
