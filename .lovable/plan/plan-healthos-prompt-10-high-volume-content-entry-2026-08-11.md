# Plan — HEALTHOS PROMPT 10: High-Volume Content Entry

Make the admin content editors fast, safe, and efficient for entering the full C9 program protocol.

## User Review Required

> [!IMPORTANT]
> I will overhaul the Day Builder first as it's the highest-friction area. I'm adding "Day Duplication" and "Inline Saving" to ensure you don't lose work and don't have to wait for page reloads.

## Technical Details

### 1. Current State Report (as requested)
- **Editors**: Programs and Products have modal-based CRUD. The Day Builder at `/admin/content/programs/$id/days` has basic inline task adding but requires many clicks. Tips and FAQs are missing functional CRUD (only placeholders).
- **Saving**: Most saves are currently server-function calls that use toasts, but the Day Builder already uses some inline logic (though it needs a "visible save state" per row).
- **Missing**: `program_products` (Kit assignment) is missing a UI entirely. "Duplicate Day" and "Task Reordering" are missing.

### 2. High-Speed Day Builder (`src/routes/admin/content/programs.$programId.days.tsx`)
- **Inline Editing**: Use a `DebouncedInput` or `onBlur` pattern for all Day and Task fields.
- **Save States**: Introduce an `isDirty`, `isSaving`, `isSaved`, `isError` status indicator next to each row.
- **Day Duplication**: Add `duplicateProgramDay` server function. UI button to "Copy Tasks from Day X".
- **Reordering**: Add Up/Down buttons to adjust `sort_order` immediately.
- **Keyboard Flow**: Ensure `tabIndex` follows a logical path (Time -> Product -> Title -> Dosage).

### 3. Completion Visibility
- Add a progress bar/indicator at the top of the Day Builder showing:
  - Total Days defined (e.g., 9/9).
  - Days with content (Title + at least 1 Task).

### 4. Kit Management (`program_products`)
- Add a new tab/section in the Program editor to manage the "Kit".
- Simple list: Product Dropdown + Quantity + Add/Remove.

### 5. Tips & FAQs Infrastructure
- Implement fast, row-based list editors in `src/routes/admin/content.index.tsx`.
- No modals. Click "Add Row", type directly into the table, save on blur.

## Proposed Changes

### Database/Backend
- `src/lib/admin-content.functions.ts`:
  - Add `duplicateProgramDay` function (copies `day_tasks` from one day to another).
  - Add `getProgramKit` and `saveProgramKit` (managing `program_products`).

### Frontend
- **Day Builder Overhaul**: Move to a "Sheet" or "Table" layout that emphasizes horizontal space for tasks.
- **Asset Upload**: Update `AdminContentManagement` to use the shared photo compression utility.
