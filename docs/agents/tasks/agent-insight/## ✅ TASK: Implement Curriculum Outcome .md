## ✅ TASK: Implement Curriculum Outcome Relevance Heatmap

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **heatmap visualization module** that surfaces usage frequency and coverage of curriculum outcomes. This supports planning, reflective practice, and curriculum auditing by identifying:

- Outcomes rarely tagged or assessed
- Outcomes overused or misaligned
- Unbalanced focus across domains or terms

Heatmaps are filtered by term, teacher, school, domain, and can be toggled between different modes of "relevance": planned, taught, assessed, observed.

---

### 🔹 GOAL

Allow educators to:

- View color-coded curriculum maps showing outcome usage
- Filter by class, term, outcome domain, or usage type
- Hover/click on outcomes to reveal:

  - Evidence count
  - Example tags
  - Linked activities or assessments

- Export visual or tabular summary for planning or sharing

---

### ✅ SUCCESS CRITERIA

- Teachers and admins can:

  - View a grid or matrix of all outcomes for a subject
  - See at-a-glance which are frequently or rarely used
  - Toggle between:

    - “Planned” (planner activity tags)
    - “Documented” (reflections + artifacts)
    - “Assessed” (from assessment tool)

  - Hover or click on a cell to see evidence summary
  - Export filtered view to CSV, PDF, or shareable link

---

### 🔧 BACKEND TASKS

#### 🟢 1. Heatmap Data Aggregator

Create a `GET /api/outcome-heatmap` endpoint with filters:

```ts
GET /api/outcome-heatmap?term=2&teacherId=8&type=assessed
```

Returns:

```json
[
  { "outcomeId": 12, "usageCount": 8 },
  { "outcomeId": 13, "usageCount": 0 },
  { "outcomeId": 14, "usageCount": 2 }
]
```

Supported `type` values:

- `planned` → from lesson planner tags
- `documented` → from reflections/artifacts
- `assessed` → from assessments
- `combined` → union of all

Should support aggregation by:

- Term
- Grade level
- Teacher ID
- Outcome domain

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Outcome Heatmap Grid

Component: `OutcomeHeatmap.tsx`

- X-axis: Outcome IDs (or short labels)
- Y-axis: Outcome domains (oral, writing, math, etc.)
- Cells:

  - Colored by usage count (e.g., gray = 0, red = low, green = high)
  - Tooltip: shows # uses, example dates
  - Click: opens evidence preview drawer

Filters:

- Dropdown: Teacher, Term, Usage Type
- Toggle: Heatmap | Table

---

#### 🔵 3. Evidence Preview Drawer

Component: `OutcomeEvidenceDrawer.tsx`

- For clicked outcome:

  - List of activities, reflections, assessments
  - Links to view/edit entries
  - Example quote snippet

---

#### 🔵 4. Export Tool

Component: `OutcomeHeatmapExport.tsx`

- Export current view:

  - As PDF visual
  - As CSV (rows: outcome ID, usage count, links)

---

### 🔗 INTEGRATION NOTES

- Uses curriculum outcome metadata (from existing database)
- Pulls usage stats from:

  - `LessonPlanOutcomeTag`
  - `ReflectionOutcomeTag`
  - `AssessmentOutcomeLink`

- May eventually include peer average comparisons (future feature)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/outcome-heatmap?term=2&teacherId=8&type=documented
```

Returns:

```json
[
  { "outcomeId": 1, "usageCount": 4 },
  { "outcomeId": 2, "usageCount": 0 },
  { "outcomeId": 3, "usageCount": 1 }
]
```

Rendered View:

| Outcome | Domain | Usage | 🔍  |
| ------- | ------ | ----- | --- |
| CO.1    | Oral   | 🟩 4  | 🔎  |
| CO.2    | Oral   | ⬜ 0  | 🔎  |
| CO.3    | Oral   | 🟨 1  | 🔎  |

---

### 🚩 RISKS

- Misleading if low counts reflect lack of tagging, not lack of instruction
- Visualization must stay performant even with large grids (e.g., 60 outcomes)
- Must protect sensitive info when exporting or sharing views
