## ✅ TASK: Implement Cross-Term Outcome Progression Map

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **longitudinal progression viewer** that allows teachers to track how specific curriculum outcomes are addressed across all terms. For each outcome, it shows when it was planned, taught, assessed, and reflected upon, making curriculum pacing visible and audit-friendly.

This supports reflective planning, curriculum integrity, and equity across time and classrooms.

---

### 🔹 GOAL

Allow users to:

- Select a subject (e.g., Literacy, Math)
- View all outcomes for that subject
- See which term(s) each outcome was:

  - Planned
  - Documented (reflected or logged)
  - Assessed

- Optionally view student-level mastery patterns over time

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Choose subject and grade level
  - View each outcome as a row, terms as columns (T1–T3)
  - See icons for: ✅ Planned, 📘 Documented, 🎯 Assessed
  - Toggle overlay of student progress data (e.g., % meeting target)
  - Export map as visual or CSV

---

### 🔧 BACKEND TASKS

#### 🟢 1. Progression Data API

New endpoint:

```ts
GET /api/outcome-progression-map?teacherId=5&subject=writing
```

Returns:

```json
[
  {
    "outcomeId": 1,
    "label": "CO.1",
    "termUsage": {
      "1": { "planned": true, "documented": true, "assessed": false },
      "2": { "planned": true, "documented": false, "assessed": true },
      "3": { "planned": false, "documented": false, "assessed": false }
    }
  },
  ...
]
```

Student overlay mode:

```ts
GET /api/outcome-progression-map?teacherId=5&subject=writing&studentOverlay=true
```

Adds:

```json
"mastery": {
  "1": { "percentMeeting": 68 },
  "2": { "percentMeeting": 81 }
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Progression Map UI

Component: `OutcomeProgressionMap.tsx`

- Rows: Outcome short labels + tooltip (CO.1, CO.2…)
- Columns: Term 1, Term 2, Term 3
- Cells: Mini-icons per activity type

  - ✅ Planned
  - 📘 Documented
  - 🎯 Assessed

Overlay (toggle):

- Student mastery gradient (0–100% meeting expectations)

Hover/Click:

- Show exact lesson titles, dates, or student count

---

#### 🔵 3. Filters and Export

- Filters:

  - Subject
  - Domain (oral, reading, writing…)
  - Student subgroup (optional)

- Export options:

  - Visual (PNG)
  - CSV table

---

### 🔗 INTEGRATION NOTES

- Pulls data from:

  - `WeeklyPlanner` (planned)
  - `Reflections` and `Artifacts` (documented)
  - `AssessmentOutcomeLink` (assessed)
  - Outcome metadata (descriptions, domains)
  - Aggregated student performance (optional)

- May optionally pull pacing templates if available per district

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/outcome-progression-map?teacherId=5&subject=oral
```

Returns:

```json
[
  {
    "outcomeId": 3,
    "label": "CO.3",
    "termUsage": {
      "1": { "planned": true, "documented": false, "assessed": false },
      "2": { "planned": true, "documented": true, "assessed": false },
      "3": { "planned": false, "documented": true, "assessed": true }
    }
  }
]
```

Rendered:

| Outcome | Term 1 | Term 2 | Term 3 |
| ------- | ------ | ------ | ------ |
| CO.3    | ✅     | ✅ 📘  | 📘 🎯  |

---

### 🚩 RISKS

- May appear to penalize teachers for gaps caused by student variation
- Could be misread if outcome language varies slightly across terms
- Data availability (e.g., missing assessments) could skew display
