## ✅ TASK: Implement Outcome Coverage Status & Alerting System

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are contributing to a React + Express + Prisma-based solo-teacher planning tool used in Prince Edward Island’s Grade 1 French Immersion classrooms. The system already stores curriculum outcomes and links them to activities and milestones, but there is no **automatic summary or alerting** when outcomes are uncovered. Your task is to implement a visual and logic-layer solution for **real-time outcome coverage monitoring**, and to **suggest planning actions** to fill gaps.

---

### 🔹 GOAL

Ensure that teachers can:

1. See which outcomes are covered and which remain unaddressed.
2. Receive visual alerts when outcomes lack activity coverage.
3. Get contextual planning suggestions (e.g. “Add activity for Outcome X”).

---

### ✅ SUCCESS CRITERIA

- Every imported curriculum outcome is trackable for its “coverage status.”
- UI components clearly indicate: ✔️ covered, ❌ uncovered, 🟡 partially covered.
- The Unit, Weekly, and Curriculum Coverage views all show outcome status.
- Outcomes not linked to any activity trigger a visual warning and/or badge.
- The UI provides a link/button to “Add an activity to address this outcome.”
- This system updates reactively as activities are added or removed.

---

### 🔧 BACKEND TASKS

#### 🟢 1. Define coverage resolver logic

Create a utility function (e.g., `getOutcomeCoverageStatus(outcomeId)`) that returns:

```ts
{ outcomeId: string, coverageStatus: "covered" | "uncovered" | "partial", linkedActivityCount: number }
```

Logic:

- “Covered” = linked to ≥1 completed activity
- “Partial” = linked but not completed
- “Uncovered” = not linked at all

Place in: `server/src/utils/outcomeCoverage.ts`

#### 🟢 2. Add route: `GET /api/outcomes/coverage`

- Returns status of all outcomes for the current grade/subject.
- Can accept query params:

  - `?grade=1&subject=francais`
  - or `?milestoneId=XX` to filter to unit scope

Returns:

```json
[
  { outcomeId: "CO.1", status: "covered", linked: 3 },
  { outcomeId: "CO.2", status: "uncovered", linked: 0 },
  ...
]
```

Used to populate dashboards and alerts.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Curriculum Coverage dashboard

File: `client/src/pages/CurriculumCoverage.tsx`

- Fetch from `GET /api/outcomes/coverage`.
- Add a badge or colored dot next to each outcome:

  - 🟢 Green = Covered
  - 🟡 Yellow = Partial
  - 🔴 Red = Uncovered

- Add a filter at the top: “Show: \[All | Uncovered Only]”.

#### 🔵 4. Unit Planner enhancements

File: `client/src/pages/UnitPlannerPage.tsx`

- On each outcome in the Unit view, display:

  - Status badge (as above).
  - Count of linked activities.
  - Tooltip: “Covered by 2 activities (1 complete).”

- If uncovered, show a button: “➕ Add activity for this outcome”

  - Clicking opens `AddActivityModal` pre-filled with the selected outcome.

#### 🔵 5. Weekly Planner outcome assist

File: `client/src/pages/WeeklyPlanner.tsx`

- In the “Suggestions” side panel, display any uncovered outcomes that:

  - Match current week’s subjects.
  - Belong to a milestone active this week (based on milestone `startDate`/`endDate` logic from previous task).

- Show a “Plan for Outcome” button that lets the teacher create an activity or drag an existing one into the week.

---

### 🔗 INTEGRATION NOTES

- This task depends on milestones having calendar dates (see prior task).
- Be sure to recompute outcome coverage reactively as activities are edited, deleted, or marked complete.
- Coverage logic must gracefully handle outcomes linked to multiple milestones or subjects.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

```bash
GET /api/outcomes/coverage?subject=francais
→
[
  { outcomeId: "CO.0", status: "uncovered", linked: 0 },
  { outcomeId: "CO.1", status: "partial", linked: 1 },
  { outcomeId: "CO.2", status: "covered", linked: 3 }
]
```

**Visual Test:**

- On the Curriculum Dashboard, “CO.0” has red badge and “Add Activity” prompt.
- On the Unit page, hovering over “CO.2” shows: “Covered by 3 activities (3 complete)”.

---

### 🚩 RISKS & EDGE CASES

- Activities may be linked to outcomes but belong to other units—ensure filtering by milestone works correctly.
- If a teacher deletes the last activity for an outcome, the system must immediately reflect that it’s “uncovered.”
- Do not overload the UI with all outcomes—use filters (e.g. subject or milestone scope).
