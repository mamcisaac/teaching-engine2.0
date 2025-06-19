## ✅ TASK: Implement Student Profile Dashboard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are developing a **single-student dashboard** that brings together planning context (themes, goals), assessment (outcomes, reflections, vocabulary), intervention (SPT logs, supports), and engagement (artifacts, family communication). This holistic view supports teacher decision-making, strengthens relationships, and helps identify gaps or patterns in learning.

---

### 🔹 GOAL

Allow teachers to:

- View a full, organized record of a student’s learning and support history
- Navigate across categories: outcomes, reflections, SPT notes, vocabulary, artifacts
- Spot patterns in engagement, domain coverage, and concerns
- Export snapshots for reporting, meetings, or handoff to next-year teacher

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Open a student dashboard from any planner or matrix
  - Navigate tabs:

    - 🧾 Overview
    - 📊 Outcome Progress
    - 📚 Vocabulary Log
    - 🧠 Reflections
    - 📎 Artifacts
    - 🧬 SPT & Intervention
    - 📨 Family Communication

  - Filter by term, domain, theme
  - Export the entire dashboard (PDF, summary Markdown, or spreadsheet)

- All linked data is shown in a curated and readable format

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add derived view endpoints

Implement composite API endpoints:

- `GET /api/students/:id/dashboard/overview`
- `GET /api/students/:id/dashboard/vocabulary`
- `GET /api/students/:id/dashboard/outcomes`
- `GET /api/students/:id/dashboard/reflections`
- `GET /api/students/:id/dashboard/spt`
- `GET /api/students/:id/dashboard/artifacts`
- `GET /api/students/:id/dashboard/family-log`

Optional param: `?term=Term2`

These should aggregate underlying models and link metadata (dates, authors, themes).

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Main Dashboard Container

Component: `StudentProfileDashboard.tsx`

- Header with:

  - Student photo, name, IEP/ELL tags
  - Term selector

- Tabs:

  - Overview (summary stats + heatmap)
  - Outcome Progress (from Outcome Matrix)
  - Vocabulary Log (interactive table)
  - Reflections (list view, tag filters)
  - SPT & Supports (timeline, flags, judgments)
  - Artifacts (gallery or table)
  - Family Log (vertical timeline)

Tab state preserved across navigation.

#### 🔵 3. Overview Tab

Component: `StudentDashboardOverview.tsx`

Widgets:

- Outcome heatmap (green/yellow/gray by domain)
- Vocabulary growth chart
- Flags (SPT, IEP, behavioral)
- Recent reflection or comm excerpts
- "Last 5 linked activities"

#### 🔵 4. Export Controls

Component: `StudentExportModal.tsx`

Options:

- Select tabs to include
- Format:

  - PDF snapshot
  - CSV (for outcomes, vocab)
  - Markdown (for narrative sharing)

- Optional redaction: pseudonym, no family notes
- Download/export button

---

### 🔗 INTEGRATION NOTES

- Data should mirror what's in each of the task-specific modules (e.g., Reflections, Matrix, Vocabulary Log)
- Link each tab’s data source to its corresponding API endpoint to avoid duplication
- Use consistent domain and outcome codes across views for alignment

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Dashboard call:**

```http
GET /api/students/14/dashboard/overview?term=Term2
```

**Returns:**

```json
{
  "name": "Alex",
  "flags": ["SPT", "Behavior"],
  "lastReflection": "Struggled with transitions this week...",
  "vocabGrowth": 28,
  "coverageByDomain": {
    "oral": "In progress",
    "math": "Demonstrated",
    "writing": "Partial"
  }
}
```

Rendered View:

> **Alex – Term 2 Overview**
> 📌 Flags: SPT, Behavior
> 🟡 Outcome Progress (Oral: 62%)
> ✅ Vocabulary: 28 words this term
> 🧠 Recent Reflection: "Struggled with transitions..."
> \[📊 See Progress →]

---

### 🚩 RISKS

- Avoid duplicating logic across tabs—rely on shared services/APIs
- Protect privacy: ensure role-based filtering for sensitive fields (e.g., notes, family logs)
- Performance must scale: lazy load tabs or paginate where needed
