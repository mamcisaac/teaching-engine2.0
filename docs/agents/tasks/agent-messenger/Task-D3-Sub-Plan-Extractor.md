## ✅ TASK 13 — D3. Sub Plan Extractor

---

**Agent**: Agent-Messenger
**Phase**: 4 - Export Support
**Priority**: 7 (Low - Supporting feature)
**Dependencies**: A1 Activity Generator, A2 Weekly Planner (Agent-Planner)
**Estimated Time**: 2-3 days
**Implementation Note**: Export enhancement for existing planning data

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Sub Plan Extractor** tool that automatically compiles relevant plans, routines, and learning goals into a concise substitute-teacher-friendly report. It draws from existing weekly plans, goals, routines, and outcome trackers to generate a printable or email-ready daily guide.

This streamlines teacher sick days, appointments, or professional leave coverage.

---

### 🔹 GOAL

Enable teachers to:

- Generate a customized substitute plan for a given date or week
- Include current learning goals and class routines
- Specify required and optional tasks
- Add emergency backup plans or generic fallback content

---

### ✅ SUCCESS CRITERIA

- Teachers select:

  - A date or range of dates
  - Which content to include (e.g., schedule, goals, routines, instructions)
  - Whether to anonymize student names

- Output:

  - Schedule with periods and subjects
  - Bullet list of current outcomes and goals
  - Task instructions with priority flags
  - Printable fallback plan for emergencies

- One-click export to PDF, print, or email

---

### 🔧 BACKEND TASKS

#### 🟢 1. Sub Plan Generator API

```ts
POST /api/subplan/generate
{
  "teacherId": 4,
  "date": "2025-04-12",
  "include": ["goals", "routines", "plans"]
}
```

Returns:

```json
{
  "date": "2025-04-12",
  "schedule": [
    {
      "time": "9:00–9:30",
      "subject": "Literacy",
      "activity": "Shared Reading: 'Le petit poisson blanc'"
    },
    { "time": "9:30–10:15", "subject": "Math", "activity": "Number talks + story problems" }
  ],
  "goals": ["Students will identify character feelings", "Students will use doubles strategies"],
  "routines": [
    "Students line up after recess by door 3",
    "Use quiet music during independent work"
  ],
  "fallback": "If technology fails, use print pack #12 and read aloud 'Nina et le lapin magique'."
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Sub Plan Editor Interface

Component: `SubPlanComposer.tsx`

- Inputs:

  - \[📅 Date or Week Range]
  - \[📌 What to include]: routines / goals / weekly plans / fallback
  - \[📄 Export options]: PDF / print / email

- Output view:

  - Structured day layout
  - Editable instructions for each period
  - \[🔄 Regenerate Fallback] button

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `WeeklyPlan`, `MiniLessonLog`, `ClassRoutine`, `GoalTracker`

- Optional link to a school-wide substitute handbook

---

### 📁 DATABASE TASKS

Extend `SubPlanRecord` (optional for reuse or tracking):

```prisma
model SubPlanRecord {
  id        Int @id @default(autoincrement())
  teacherId Int
  date      DateTime
  content   Json
  createdAt DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Teacher selects April 12
- System outputs:

  - Literacy: “Shared reading + emotion discussion”
  - Math: “Number talks on doubles”
  - Recess note: “Watch for Jordan’s inhaler”

- PDF includes backup plan: “Print pack #12 and read aloud a chosen story”

---

### 🚩 RISKS

- Must not include sensitive student data unless explicitly permitted
- Clarity of instructions is critical for substitutes unfamiliar with class
- Teachers may need to override generated routines or add student-specific notes manually
