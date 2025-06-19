## ✅ TASK: Implement Curriculum Heatmap Synthesizer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **curriculum heatmap engine** that visualizes how intensively different outcomes have been engaged over time. It uses planner data, assessment links, mini-lessons, and student artifacts to quantify:

- Breadth: how many outcomes have been addressed
- Depth: how many times each outcome has been touched
- Distribution: how well-balanced coverage is across domains (e.g. oral, SEL, numeracy)

Heatmaps can be:

- Teacher-wide (whole class)
- Student-specific
- Domain- or term-filtered

---

### 🔹 GOAL

Allow teachers to:

- See visual distribution of outcome coverage
- Detect overfocus or neglect across domains or weeks
- Support documentation and audit of instructional balance
- Reflect on equity of instructional targeting across students

---

### ✅ SUCCESS CRITERIA

- Heatmap is:

  - Intuitive (darker = more coverage)
  - Grid-based (rows = outcomes, columns = weeks)
  - Zoomable (filter by domain, student, subject)

- Teacher can:

  - Toggle view modes (planned vs taught vs assessed)
  - Export grid with summary stats

---

### 🔧 BACKEND TASKS

#### 🟢 1. Heatmap Coverage API

```ts
GET /api/curriculum/heatmap?teacherId=12&subject=literacy&view=assessed
```

Returns:

```json
{
  "outcomes": [
    { "id": 1, "code": "CO.1", "label": "Engage in oral storytelling" },
    ...
  ],
  "weeks": [1, 2, 3, 4, 5],
  "grid": {
    "1": { "1": 1, "2": 0, "3": 2, "4": 0, "5": 1 },
    "2": { "1": 0, "2": 0, "3": 0, "4": 2, "5": 2 }
  }
}
```

Counts represent:

- `planned` = planner
- `taught` = reflection/artifact
- `assessed` = assessment log
- `reinforced` = mini-lessons

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Heatmap Grid Visual

Component: `CurriculumHeatmap.tsx`

- Rows: CO.1–CO.n
- Columns: W1–W10
- Cell fill:

  - Gradient scale (e.g., white → green or blue)
  - Hover tooltip:

    > “W3 – 2 documentation events linked”

Controls:

- View Mode: \[Planned | Taught | Assessed | Reinforced]
- Filter:

  - Subject / Domain / Term
  - \[☑️ All Students] / \[Select Student]

---

#### 🔵 3. Summary Panel

Component: `HeatmapSummaryStats.tsx`

- “Top 5 Most Covered Outcomes”
- “Least Touched Outcomes”
- “Average Weekly Outcome Hits”
- “Domain Imbalance Warning” if >60% entries are in one domain

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `WeeklyPlanner`
  - `ArtifactUpload` + `ReflectionResponse`
  - `AssessmentOutcomeLink`
  - `MiniLessonLog`

- Supports export to:

  - Reporting Generator
  - Curriculum Timeline Analyzer
  - End-of-Term Planning Review

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```http
GET /api/curriculum/heatmap?teacherId=8&subject=math&view=taught
```

Returns:

```json
{
  "outcomes": [{ "id": 3, "code": "CO.3", "label": "Describe quantity" }],
  "weeks": [1, 2, 3],
  "grid": {
    "3": { "1": 2, "2": 1, "3": 0 }
  }
}
```

Visual:

| CO.3 – "Describe quantity" |
| -------------------------- |
| W1: dark green (2 hits)    |
| W2: light green (1 hit)    |
| W3: white (0 hits)         |

---

### 🚩 RISKS

- Requires consistent outcome tagging across planner/artifact/assessment flows
- Risk of misinterpreting coverage as quality (surface vs depth)
- Color scale UX must be accessible and not misleading
