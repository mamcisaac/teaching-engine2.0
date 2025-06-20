## ✅ TASK 7 — B3. School-Level Curriculum Heatmap

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **school-wide curriculum heatmap dashboard** that enables administrators or grade-level coordinators to visualize outcome coverage across all teachers within a school or grade band.

The heatmap provides an aggregated view of curriculum progress to help identify systemic gaps, redundancies, or pacing discrepancies.

---

### 🔹 GOAL

Enable authorized users to:

- View coverage status of all curriculum outcomes across a school
- Filter by grade, term, subject domain, or outcome cluster
- Compare how many teachers have addressed each outcome
- Identify gaps (e.g., rarely taught or never assessed outcomes)

---

### ✅ SUCCESS CRITERIA

- Admins can:

  - Select a grade and subject
  - View a heatmap of all outcomes (rows) vs. teachers (columns)
  - Hover to see number of times an outcome has been addressed
  - Filter by term or custom time range

- Heatmap includes:

  - Color coding: red = untouched, yellow = partial, green = robustly covered
  - Totals and averages per outcome and per teacher

---

### 🔧 BACKEND TASKS

#### 🟢 1. Heatmap Aggregation API

```ts
POST /api/school/curriculum-heatmap
{
  "schoolId": 2,
  "grade": 1,
  "subject": "literacy",
  "term": 2
}
```

Returns:

```json
{
  "outcomes": [
    {
      "outcomeId": 11,
      "description": "Retell a familiar story with key events",
      "coverage": [
        { "teacherId": 3, "count": 4 },
        { "teacherId": 5, "count": 1 },
        { "teacherId": 6, "count": 0 }
      ]
    },
    ...
  ],
  "teacherIds": [3, 5, 6]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. School Heatmap Dashboard

Component: `SchoolCurriculumHeatmap.tsx`

- Inputs:

  - \[🏫 School] (autodetected if user is principal)
  - \[🧑🏽‍🏫 Grade] selector
  - \[📘 Subject]
  - \[📆 Term or Date Range]

- Output:

  - Matrix-style heatmap: Outcomes (rows) × Teachers (columns)
  - Hover tooltip: “Covered 4 times by Ms. Daniels”
  - Legend: 0 = gray, 1 = yellow, ≥2 = green

---

### 🔗 INTEGRATION NOTES

- Aggregates from:

  - `MiniLessonLog.outcomeId`
  - `AssessmentRecord.outcomeId`
  - `PortfolioEntry.outcomeId`

- Will require admin access control on `UserRole` or `SchoolMembership`

---

### 📁 DATABASE TASKS

Add link between teachers and schools (if not yet implemented):

```prisma
model SchoolMembership {
  id        Int @id @default(autoincrement())
  userId    Int
  schoolId  Int
  role      String // "teacher", "admin", "coordinator"
  joinedAt  DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Scenario:

- Grade 1 literacy, Term 1
- Teachers A, B, and C
- Outcome: “Describe a character's actions and feelings”

Returned:

- A: 4 entries
- B: 2 entries
- C: 0 entries
  Heatmap renders red (C), yellow (B), green (A)

---

### 🚩 RISKS

- Requires sensitive handling: ensure this is not perceived as teacher performance tracking
- Data may be incomplete for non-logged or offline work—should allow disclaimers
- Must account for long-term pacing differences (some outcomes may be planned for later)
