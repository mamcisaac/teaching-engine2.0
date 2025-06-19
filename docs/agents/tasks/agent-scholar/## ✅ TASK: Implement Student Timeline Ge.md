## ✅ TASK: Implement Student Timeline Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a timeline interface that lets teachers **visualize a student’s journey** through learning outcomes, assessments, activities, and themes. Initially this may operate at the **class level**, but must be designed for eventual individualization (e.g. one timeline per student).

---

### 🔹 GOAL

Allow teachers to track learning experiences over time across key pedagogical layers: themes, curriculum outcomes, assessments, and major activities. The goal is to foster insight into pacing, coherence, and outcome coverage, particularly for multilingual and differentiated instruction.

---

### ✅ SUCCESS CRITERIA

- Teachers can view:

  - A class-level chronological timeline
  - Learning outcomes covered per week
  - Major assessments administered
  - Key classroom themes

- Visualized as a linear or horizontal scroll timeline
- Each item links to source activity, theme, or assessment
- Summary stats (e.g. % outcomes covered) appear at top
- Teachers can filter by subject, theme, or outcome

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `TimelineEvent` view (virtual model or dynamic endpoint)

No new table is required; instead, query across:

- `Activity.date`
- `Activity.linkedOutcomes`
- `AssessmentResult.date`
- `ParentMessage.timeframe`
- `Theme.startDate` → `Theme.endDate`

Each is transformed into a normalized timeline event:

```ts
type TimelineEvent = {
  id: string;
  date: Date;
  type: 'activity' | 'assessment' | 'theme' | 'newsletter';
  label: string;
  linkedOutcomeIds: number[];
};
```

Add endpoint:

- `GET /api/timeline/events?studentId?&from?&to?`

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Timeline View Component

Component: `StudentTimeline.tsx` or `ClassTimeline.tsx`

- Horizontal scroll layout or week-by-week block view
- Render:

  - 📌 Activities → colored by subject
  - 🎯 Outcomes → small badges
  - 🧠 Assessments → dot + score
  - 🎨 Themes → colored blocks spanning multiple days
  - 📰 Newsletters → mini icons with hover text

Use tooltips or modals on hover/click:

> _“Oral Vocabulary Assessment — Jan 21 — Outcome: CO.2 — Score: 84%”_

#### 🔵 3. Summary Header

Atop the timeline, render summary:

- “17/42 Outcomes Covered (40%)”
- “Next Milestone: Oral Storytelling”
- Filters:

  - Outcome
  - Subject
  - Theme

#### 🔵 4. Navigation Links

Add link to timeline from:

- Class Dashboard
- Student Profile (when individualization added)

Button: `📈 View Learning Timeline`

---

### 🔗 INTEGRATION NOTES

- Reuse existing planner data—no new user input required for MVP.
- Dates for outcomes are derived from activities and assessments only.
- Later: allow student-level filtering for targeted support or progress review.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Timeline Event View:**

```json
[
  {
    "id": "act-341",
    "type": "activity",
    "label": "Write a postcard from Mars",
    "date": "2026-02-14",
    "linkedOutcomeIds": [12]
  },
  {
    "id": "assess-092",
    "type": "assessment",
    "label": "Oral Presentation – Family",
    "date": "2026-02-16",
    "linkedOutcomeIds": [14]
  }
]
```

Timeline renders:

```
| Week of Feb 12
    → 🎨 Theme: Space Exploration
    → 🧠 Oral Assessment: Family (CO.14) — Score 82%
    → ✏️ Postcard from Mars (CO.12)
```

---

### 🚩 RISKS

- Performance may lag with many concurrent visualizations—use pagination/lazy loading.
- Teachers must not be misled: timeline shows _evidence of instruction_, not mastery.
- Avoid confusion between timeline visualization and report card progress.
