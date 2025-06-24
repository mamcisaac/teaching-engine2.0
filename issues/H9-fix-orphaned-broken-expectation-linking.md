## H9: Fix Orphaned or Broken Expectation Linking in Forms

**Goal:** Ensure curriculum expectations can be properly linked to unit plans and lesson plans without orphaned references.

**Success Criteria:**

- Unit plan forms allow selecting multiple curriculum expectations
- Lesson plan forms show available expectations from the parent unit
- Expectation selection UI shows strand/substrand hierarchy
- Selected expectations are properly saved and displayed
- No orphaned expectation references after deletion

**Tasks:**

1. Create `ExpectationSelector.tsx` component:
   - Multi-select with search
   - Group by strand/substrand
   - Show code and description
   - Filter by grade/subject
2. Update `UnitPlanForm.tsx`:
   - Add ExpectationSelector
   - Handle expectation array in form data
   - Show selected expectations with remove option
3. Update `LessonPlanForm.tsx`:
   - Show parent unit's expectations
   - Allow selecting subset for lesson
   - Validate at least one expectation selected
4. Fix API endpoints to handle expectation arrays:
   - `/api/etfo-unit-plans` POST/PUT
   - `/api/etfo-lesson-plans` POST/PUT
5. Add cascade deletion protection in Prisma schema
