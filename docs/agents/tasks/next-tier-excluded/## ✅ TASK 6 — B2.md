## ✅ TASK 6 — B2. Outcome Coverage Comparison Tool

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **outcome coverage comparison tool** that enables two or more teachers (or classes) to compare which curriculum outcomes have been addressed, when, and how often.

This supports collaborative planning, gap identification, curriculum alignment, and administrative oversight across grade levels or team-teaching scenarios.

---

### 🔹 GOAL

Enable educators or administrators to:

- Select two or more teacher accounts or class groups
- View which curriculum outcomes each has addressed to date
- See overlap, gaps, and frequency of evidence
- Filter by subject/domain and term

---

### ✅ SUCCESS CRITERIA

- Users can:

  - Select multiple teachers or class groups
  - Compare outcome coverage across selected groups
  - View percentage of outcomes covered by each
  - Highlight:

    - Outcomes covered by both
    - Outcomes covered by only one
    - Outcomes not covered yet

- Filter options:

  - Term (1–3)
  - Subject/domain
  - Grade (if relevant)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Coverage Comparison API

```ts
POST /api/comparison/outcomes
{
  "teacherIds": [3, 6],
  "term": 2,
  "domain": "math"
}
```

Returns:

```json
{
  "domain": "math",
  "term": 2,
  "outcomes": [
    {
      "outcomeId": 12,
      "description": "Count backwards from 20",
      "teacherCoverage": {
        "3": { "covered": true, "evidenceCount": 3 },
        "6": { "covered": false, "evidenceCount": 0 }
      }
    },
    ...
  ]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Outcome Comparison View

Component: `OutcomeComparisonDashboard.tsx`

- Inputs:

  - \[👩‍🏫 Teacher Select] x2+
  - \[🧪 Term Selector]
  - \[📚 Subject Filter]

- Output:

  - Table or matrix with outcomes as rows, teachers as columns
  - Icons for:

    - ✅ Covered
    - ❌ Not Covered
    - 🟡 Partial (e.g., 1/3 activities tagged)

  - Color-coded summary bar:

    - % covered by all / some / none

---

### 🔗 INTEGRATION NOTES

- Uses same coverage tracking as Curriculum Dashboard
- Queries:

  - `MiniLessonLog`, `PortfolioItem`, `AssessmentRecord` entries linked to outcomes

- Optionally use `WeeklyPlan` data if lesson logs are missing

---

### 📁 DATABASE CONSIDERATIONS

No schema changes required—queries over existing outcome-linked artifacts are sufficient.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Scenario:

- Teacher A and B both teach Grade 1 math
- Teacher A has covered outcomes 1–10
- Teacher B has covered 5–15

Comparison shows:

- Outcomes 1–4: Only A
- Outcomes 5–10: Both
- Outcomes 11–15: Only B

---

### 🚩 RISKS

- Teachers may define "coverage" differently—clarify metric (e.g., ≥1 log, ≥1 assessment)
- Visualization must avoid implying evaluation or ranking
- Must support graceful handling of sparse data
