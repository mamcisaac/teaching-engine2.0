## H13: Add Weekly Planner State Model (Optional Enhancement)

**Goal:** Create a state management model for the weekly planner to enable persistent view preferences and better UX.

**Success Criteria:**

- Weekly view preferences persist between sessions
- Drag-and-drop state maintained during edits
- Undo/redo functionality for planning changes
- Offline support for viewing plans
- Smooth transitions between weeks

**Tasks:**

1. Create `WeeklyPlannerState` Prisma model:
   - userId reference
   - viewPreferences JSON
   - currentWeek
   - draftChanges JSON
2. Create `/client/src/stores/weeklyPlannerStore.ts`:
   - Zustand store for client state
   - Persist to localStorage
   - Sync with backend
3. Add API endpoints:
   - GET/PUT `/api/planner/state`
   - GET `/api/planner/week/:weekStart/state`
4. Update `PlanningDashboard.tsx`:
   - Use planner state store
   - Add view preference controls
   - Implement undo/redo
5. Add offline support:
   - Cache weekly data in IndexedDB
   - Show offline indicator
   - Queue changes for sync
