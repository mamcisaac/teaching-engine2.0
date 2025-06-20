## ✅ TASK: Implement Domain Strength Radar

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are designing a **radial visualization dashboard** that synthesizes data from outcome completion, reflections, vocabulary growth, and artifacts. It presents each student's progress across domains as a radar chart (spider plot), enabling teachers to quickly see which areas are most and least developed, and track this across terms.

---

### 🔹 GOAL

Allow teachers to:

- Visualize student development across key domains
- Quickly identify strengths and gaps for planning/support
- Track changes across terms
- Drill down into supporting evidence (outcomes, reflections, artifacts)

---

### ✅ SUCCESS CRITERIA

- Each student has a radar chart showing:

  - Relative development in 5–8 major domains
  - Optional comparison between terms (e.g., Term 1 vs Term 2)

- Teachers can:

  - Hover to see evidence (e.g., # of outcomes, reflections)
  - Click domain to open deeper view (student dashboard tab)
  - Toggle display:

    - % of outcomes completed
    - # of reflection entries
    - Vocabulary entries

- Charts render fast and responsively

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create Derived API Endpoint

```ts
GET /api/students/:id/radar?term=Term2&compareTo=Term1
```

Returns per domain:

```json
{
  oral: {
    outcomesCompleted: 7,
    outcomesTotal: 10,
    reflectionCount: 4,
    vocabWords: 15
  },
  math: {
    ...
  },
  ...
}
```

Aggregate a weighted score per domain (e.g., 60% from outcomes, 30% from reflections, 10% from vocab/artifacts).

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Radar Chart Component

Component: `DomainRadarChart.tsx`

- Inputs:

  - Data: domain scores (0–100)
  - Labels: oral, reading, writing, math, etc.

- Features:

  - Hover → tooltip with evidence summary
  - Click → navigate to `StudentDashboard.tsx` with tab preselected
  - Responsive sizing
  - Toggle:

    - \[✓] Show % outcomes
    - \[✓] Show term comparison

Use a library like `recharts`, `chart.js`, or `d3`.

#### 🔵 3. Integration into Student Profile

Tab: “🧭 Strength Radar”

- Default: current term
- Toggle: compare to previous term
- Below chart: summary table with:

  - Domain
  - Score %
  - Supporting counts (outcomes, reflections, vocab)
  - \[📎 View Evidence]

---

### 🔗 INTEGRATION NOTES

- Pull from:

  - Outcome Matrix completion status
  - Reflection Log (with tagged domains)
  - Vocabulary Log
  - Artifact Log (optional boost if linked to domain)

- Normalize to 100-scale for comparability
- Use domain labeling consistent with matrix and planner (e.g., "oral", "reading", "writing", "math", "behavior", "wellbeing")

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/students/14/radar?term=Term2
```

Returns:

```json
{
  oral: { score: 78, outcomesCompleted: 7, reflectionCount: 3 },
  math: { score: 54, outcomesCompleted: 5, reflectionCount: 0 },
  writing: { score: 91, outcomesCompleted: 10, reflectionCount: 4 },
  ...
}
```

Rendered View:

> 🧭 **Domain Strength Radar – Term 2**
> 🟢 Oral: 78 | 🟡 Math: 54 | 🟢 Writing: 91
> \[📊 View Full Dashboard] \[📥 Export Chart]

---

### 🚩 RISKS

- Weighting model must be transparent—avoid misleading composite scores
- Over-interpretation—radar is a prompt, not a verdict
- Charts must not expose other students’ data
