## ✅ TASK: Implement Learning Timeline Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **timeline-based student portfolio viewer** that organizes and visualizes student learning across the school year. Each entry (planner activity, goal progress, reflection, artifact) is chronologically anchored and linked to relevant domains and outcomes. The goal is to give teachers and families a rich, narrative-aligned understanding of student growth, supporting reports, SPTs, and memory preservation.

---

### 🔹 GOAL

Allow teachers to:

- View all evidence of learning for a student in a chronological, scrollable timeline
- Filter by domain, outcome, term, or theme
- Click into individual artifacts or reflections
- Export timeline for reporting or year-end documentation

---

### ✅ SUCCESS CRITERIA

- Each student has a timeline view
- Entries include:

  - 📆 Date
  - 🧩 Domain(s)
  - 🧠 Outcome(s)
  - ✏️ Reflection or Artifact preview
  - 📸 Attachments (images, files, audio)

- Teachers can:

  - Filter by domain, outcome, theme
  - Expand/collapse long entries
  - Export full or filtered view

---

### 🔧 BACKEND TASKS

#### 🟢 1. Timeline Data Aggregator

Normalize all loggable learning evidence (from planner, artifacts, reflections, goals) into:

```ts
type TimelineEntry = {
  id: string;
  date: string;
  type: 'Artifact' | 'Reflection' | 'Goal' | 'Planner';
  title: string;
  content: string;
  domains: string[];
  outcomeIds: number[];
  theme?: string;
  mediaUrls: string[];
};
```

#### 🟢 2. API Endpoint

```ts
GET /api/students/:id/timeline?term=Term2&domain=oral
```

Returns ordered array of `TimelineEntry`.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Timeline View

Component: `LearningTimeline.tsx`

- Scrollable chronological layout (similar to vertical history)
- Each entry card shows:

  - Title (e.g., “Community Roleplay”)
  - Tags: domain, theme, outcome
  - Preview text (first 1–2 lines)
  - Thumbnails of media
  - Expand → full text and media viewer

#### 🔵 4. Filter Controls

Component: `TimelineFilterBar.tsx`

- Filters:

  - Domain(s)
  - Outcome(s)
  - Theme(s)
  - Date or Term

#### 🔵 5. Export Button

Component: `TimelineExportPanel.tsx`

- Options:

  - Full export or filtered
  - Format: Markdown, PDF, printable view
  - Include thumbnails or just text

---

### 🔗 INTEGRATION NOTES

- Timeline integrates with:

  - Reflections database
  - Artifacts
  - Goal system
  - Planner activities with student links

- Consider lazy loading if timeline is long (infinite scroll)
- Future: enable **family view** with simplified language (controlled toggle)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/students/14/timeline?term=Term2&domain=oral
```

Returns:

```json
[
  {
    date: "2025-02-14",
    type: "Reflection",
    title: "Community Roleplay",
    content: "Eddie confidently explained the role of a firefighter...",
    domains: ["oral"],
    outcomeIds: [12],
    theme: "Community",
    mediaUrls: ["firefighter.jpg"]
  },
  ...
]
```

Rendered Entry:

> 🗓️ **Feb 14 – Reflection: Community Roleplay**
> 🧩 Oral | 🎯 Outcome 12 | 🧠 Theme: Community
> ✏️ “Eddie confidently explained the role of a firefighter...”
> 📸 \[firefighter.jpg]

---

### 🚩 RISKS

- Media-heavy timelines could affect performance—optimize image loading
- Must ensure entries are ordered and grouped clearly by date
- Redundancy risk: similar entries may clutter timeline—consider collapsible summaries
