## H8: Fix Missing Unit & Lesson Plan Routes in UI Navigation

**Goal:** Ensure that all ETFO levels (Unit Plans and Lesson Plans) have proper frontend routes and UI components to match the backend API.

**Success Criteria:**

- Unit Plans page can be accessed via `/planner/units` and shows all unit plans
- Individual unit plan detail view works at `/planner/units/:unitId`
- Lesson Plans can be accessed via `/planner/units/:unitId/lessons`
- Individual lesson plan detail view works at `/planner/lessons/:lessonId`
- Navigation between levels works smoothly
- All API endpoints are properly connected

**Tasks:**

1. Create `ETFOLessonPlanPage.tsx` component with:
   - List view of lesson plans for a unit
   - Create/edit/delete functionality
   - Link to daybook entries
   - Curriculum expectation selection
2. Update `UnitPlansPage.tsx` to include:
   - Navigation to lesson plans
   - Unit detail view with lesson count
3. Add routes in `App.tsx`:
   - `/planner/units/:unitId/lessons` → ETFOLessonPlanPage
   - `/planner/lessons/:lessonId` → ETFOLessonPlanPage (detail mode)
4. Update `MainLayout.tsx` navigation to include lesson plan links
5. Create API hooks in `api.ts`:
   - `useETFOLessonPlans(unitId)`
   - `useCreateETFOLessonPlan()`
   - `useUpdateETFOLessonPlan()`
   - `useDeleteETFOLessonPlan()`
