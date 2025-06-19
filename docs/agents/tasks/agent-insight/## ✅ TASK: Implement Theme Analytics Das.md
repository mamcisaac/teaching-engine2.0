## ✅ TASK: Implement Theme Analytics Dashboard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a dashboard that analyzes how often and how deeply each **theme** has been used in teaching, documentation, and assessment. Themes are central organizing ideas (e.g., “Community,” “Seasons,” “Wellbeing”), and they appear across activities, artifacts, reflections, and outcome planning. The dashboard gives teachers feedback on thematic coverage, gaps, repetition, and subject integration.

---

### 🔹 GOAL

Allow teachers to:

- See how frequently each theme has been used across the year
- Identify cross-subject integration (e.g., “Community” used in literacy, social studies, and art)
- Detect themes that are underused or overused
- Optimize thematic planning for balance and reinforcement
- Export term-by-term theme coverage

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - View a list of all themes with usage stats
  - See which domains/outcomes each theme has touched
  - Filter by term, subject, or usage type (planner, artifact, reflection)
  - Export a printable theme coverage matrix
  - Visualize theme overlap across subject areas (heatmap or graph)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Extend Theme Usage Aggregation

Create backend service that aggregates theme usage across:

- Planner activities
- Artifacts
- Reflections
- Outcome linkages
- Vocabulary tags (optional)

Create normalized summary table:

```ts
{
  themeId: 5,
  themeName: "Community",
  usageCount: 14,
  domainsUsed: ["reading", "oral", "social studies"],
  linkedOutcomes: [14, 25, 32],
  termsUsed: ["Term 1", "Term 2"]
}
```

#### 🟢 2. Create API Endpoint

```ts
GET /api/themes/analytics?term=Term2
```

Returns array of theme analytics summaries (one per theme).

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Analytics Dashboard

Component: `ThemeAnalyticsDashboard.tsx`

- Theme list (sortable by usage count)

  - Name, usage bar, domain icons, outcome count

- Filter panel:

  - Term
  - Subject
  - Usage type

- Table or grid view:

  > 🧩 Community – 14 uses | 📚 Reading, 🧠 Oral, 🌍 Social
  > Outcomes: 4 | Terms: T1, T2
  > \[📎 View Activities] \[📤 Export Row]

#### 🔵 4. Heatmap View

Component: `ThemeMatrixHeatmap.tsx`

- Matrix:

  - Rows: Themes
  - Columns: Domains
  - Cells: Usage frequency (shaded)

- Tooltip: list activities / artifacts linked to that cell

Optional:

- Toggle to show by **Outcome Category** or **Grade Expectation Cluster**

#### 🔵 5. Export Button

Component: `ThemeExportPanel.tsx`

- Formats: PDF, CSV, Markdown
- Select filters:

  - Term(s)
  - Theme(s)
  - Domain(s)

- Output: Theme coverage summary table + matrix visual

---

### 🔗 INTEGRATION NOTES

- Use the same theme taxonomy used in Planner and Evidence Entry
- Future extension: auto-suggest underused themes in Planner
- Consider caching analytics to avoid recomputation on every load

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/themes/analytics?term=Term2
```

Returns:

```json
[
  {
    themeName: "Community",
    usageCount: 14,
    domainsUsed: ["reading", "oral", "social"],
    linkedOutcomes: [12, 19, 31],
    termsUsed: ["Term 1", "Term 2"]
  },
  ...
]
```

Rendered View:

> 🧩 **Theme: Community**
> Total Uses: 14
> Domains: 📖 Reading, 🎤 Oral, 🧭 Social Studies
> Outcomes Linked: 3
> Terms: T1, T2
> \[📤 Export Summary]

---

### 🚩 RISKS

- Inconsistent tagging practices could lead to misleading usage counts
- Must clarify what “usage” includes (planned vs taught vs reflected)
- Heatmap must scale gracefully with large numbers of themes/domains
