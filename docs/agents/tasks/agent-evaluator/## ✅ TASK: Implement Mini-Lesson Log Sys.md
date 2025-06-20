## ✅ TASK: Implement Mini-Lesson Log System

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **streamlined mini-lesson logging tool** that allows teachers to quickly capture informal, responsive teaching moments:

- Re-teaching a concept during centers
- Coaching a student through a problem or SEL conflict
- Providing targeted practice based on observed need

Entries can be tagged to outcomes and students, and used for:

- Curriculum heatmap reinforcement analysis
- Narrative reports and family summaries
- Planning future lessons

---

### 🔹 GOAL

Allow teachers to:

- Quickly log targeted instructional interactions
- Tag outcomes, students, and mode (1:1, group)
- Reuse previous entries as templates
- Use logs to document depth of instructional support

---

### ✅ SUCCESS CRITERIA

- Teacher can:

  - Log an event in <30 seconds
  - Tag outcome(s), student(s), and type of intervention
  - Reuse prior mini-lessons or edit templates

- Logs appear in:

  - Curriculum Heatmap (as “reinforced” layer)
  - Narrative Report (evidence section)
  - Goal Summaries (SEL or academic)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Mini-Lesson Log Model

```prisma
model MiniLessonLog {
  id         Int      @id @default(autoincrement())
  teacherId  Int
  studentIds Int[]
  date       DateTime @default(now())
  mode       String   // "1-on-1", "small group", "whole class"
  outcomeIds Int[]
  notes      String
  copiedFromId Int?   // reuse template
}
```

#### 🟢 2. Mini-Lesson Logging API

```ts
POST /api/minilesson/log
{
  "teacherId": 18,
  "studentIds": [4, 5],
  "outcomeIds": [7],
  "mode": "small group",
  "notes": "Reviewed counting strategies with manipulatives"
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Quick Log Interface

Component: `MiniLessonQuickLog.tsx`

- Form fields:

  - Date (auto-today)
  - Student(s) (autocomplete or quick select)
  - Mode: \[1:1] \[Group] \[Whole class]
  - Outcome(s)
  - Notes

- \[💾 Log] \[📋 Save as Template]

Optional:

- \[📄 Use Past Entry] (select from prior logs)
- \[📊 View Linked Outcomes] (curriculum navigator preview)

---

#### 🔵 4. Mini-Lesson Review Page

Component: `MiniLessonHistoryView.tsx`

- Filters:

  - Student, Outcome, Term, Mode

- Table of entries:

  - 📅 Date
  - 🧑‍🤝‍🧑 Student(s)
  - 🎯 Outcome(s)
  - 📝 Notes

---

### 🔗 INTEGRATION NOTES

- Links to:

  - `CurriculumHeatmap` (reinforcement layer)
  - `NarrativeReportGenerator`
  - `StudentGoalSummarizer`

- Draws students/outcomes from:

  - Class Roster
  - Curriculum Engine

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**POST:**

```json
{
  "teacherId": 3,
  "studentIds": [12],
  "outcomeIds": [6],
  "mode": "1-on-1",
  "notes": "Prompted numeracy vocabulary during station time"
}
```

Mini-lesson saved → appears in:

- Eddie’s Week 5 heatmap (Outcome 6: Reinforced)
- SEL Goal progress: “Use new vocabulary in context”

---

### 🚩 RISKS

- Overuse as a “miscellaneous dump” if tagging isn’t clear
- Teachers may forget to tag outcomes or students
- Needs ultra-fast UX to be viable during busy instructional time
