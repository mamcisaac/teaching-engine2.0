## ✅ TASK: Implement Curriculum Alignment Audit Tool

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a tool that **analyzes curriculum coverage** for a given term, class, or student group. It identifies which outcomes have been addressed, which remain uncovered, and whether any domains are disproportionately over- or underrepresented. It helps ensure instructional balance and outcome fulfillment across the year.

---

### 🔹 GOAL

Automatically generate a visual and tabular **curriculum audit report**, showing which curriculum outcomes have:

- Been **covered** in at least one activity or assessment
- Been **assessed**
- **Not yet been addressed**
- Been **redundantly addressed** without assessment

Reports should support filtering by:

- Subject or domain (e.g., Oral Language, Math)
- Timeframe (e.g., Term 2)
- Coverage level (covered / uncovered / assessed / repeated)

---

### ✅ SUCCESS CRITERIA

- Teachers or admins can run an audit for:

  - Class-wide outcome coverage
  - Per-term or per-month intervals

- For each outcome, the audit shows:

  - ✔️ Covered in activity?
  - 🧠 Assessed?
  - 🟡 Addressed more than 3x?
  - ❌ Never addressed?

- Outcomes grouped by strand/domain
- Optional export as CSV, Markdown, or printable PDF

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add dynamic endpoint

Route: `GET /api/audit/curriculum-coverage?classId=xx&term=yy`

- Use `Activity.linkedOutcomes`, `AssessmentResult.outcomeIds`, and `Planner.date`
- Return outcome-level breakdown:

```json
[
  {
    "outcomeId": 21,
    "coveredCount": 4,
    "assessed": true,
    "lastUsed": "2026-10-14"
  },
  {
    "outcomeId": 28,
    "coveredCount": 0,
    "assessed": false,
    "lastUsed": null
  }
]
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Curriculum Audit Dashboard

Component: `CurriculumAuditDashboard.tsx`

Features:

- Filter by:

  - Term (dropdown)
  - Domain (e.g., Reading, Writing, Oral Language)
  - Flags: “Show only uncovered”, “Show only unassessed”

- Display table:

  - Outcome ID
  - Outcome label (plain language)
  - Domain
  - ✔️ Covered?
  - 🧠 Assessed?
  - 🟡 Overused (>3x)
  - Last seen date

- Color-coded rows:

  - Red = not addressed
  - Yellow = overused without assessment
  - Green = covered and assessed

#### 🔵 3. Export Options

Button: `📤 Export as...`

- CSV (raw coverage)
- Markdown (teacher-friendly summary)
- PDF (printable)

Optional enhancement:

- “📆 View in Timeline” → links to filtered timeline view

---

### 🔗 INTEGRATION NOTES

- Use same outcome metadata system as planner and assessment modules.
- Render plain-language summaries alongside outcome codes.
- Allow term-to-term comparison (e.g., Term 1 vs Term 2 gaps).

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Run Coverage Audit:**

```http
GET /api/audit/curriculum-coverage?classId=8&term=term1
```

**Sample Output:**

```json
[
  { "outcomeId": 4, "coveredCount": 3, "assessed": true, "lastUsed": "2026-10-14" },
  { "outcomeId": 7, "coveredCount": 0, "assessed": false, "lastUsed": null }
]
```

Rendered Table:

| Outcome      | Covered | Assessed | Overused | Last Used |
| ------------ | ------- | -------- | -------- | --------- |
| CO.4 Oral    | ✔️      | ✔️       | 🟡       | Oct 14    |
| CO.7 Written | ❌      | ❌       | ❌       | –         |

---

### 🚩 RISKS

- Avoid punitive tone—this tool is for planning support, not evaluation.
- Must support bilingual interface (Fr/En) and plain language labels.
- Summary metrics must be accurate and cached for performance.
