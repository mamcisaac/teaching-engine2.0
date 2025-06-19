## ✅ TASK: Implement Weekly Planning Quality Scorecard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **diagnostic overlay** that runs in the background of the weekly planner and outputs a scored, actionable summary of each week’s plan. The goal is to help teachers maintain balance across domains, link outcomes consistently, engage themes thoughtfully, and identify under-documented areas before gaps widen.

---

### 🔹 GOAL

Allow teachers to:

- Automatically evaluate each weekly plan for completeness and balance
- See which domains or outcomes are missing or overused
- Track planning quality over time
- Receive specific, actionable improvement suggestions
- Export diagnostic summaries for admin or self-review

---

### ✅ SUCCESS CRITERIA

- Each weekly plan is scored (out of 100 or 5-star system) on:

  - 📘 Domain coverage
  - 🎯 Outcome linkage
  - 🎨 Theme consistency
  - ✏️ Vocabulary integration
  - 🧠 Assessment presence (if appropriate)

- Scorecard provides:

  - Missing/outlier flags
  - Suggestions for balance (e.g., “Consider adding writing activity”)
  - Optional “score trend” chart for teacher growth tracking

---

### 🔧 BACKEND TASKS

#### 🟢 1. WeeklyPlanDiagnostics Engine

Inputs:

- Planner week
- Activities (title, description, domain, outcome links, theme)
- Vocab links
- Assessment items (if any)

Output:

```ts
type PlanningScorecard = {
  score: number;
  stars: number;
  summary: string;
  flags: string[]; // e.g., ["No writing domain this week", "No vocab used"]
  suggestions: string[]; // e.g., ["Add vocabulary list to 'Farm Visit'"]
  domainCoverage: Record<string, number>; // activities per domain
  outcomeLinkRate: number;
  vocabUsageRate: number;
};
```

#### 🟢 2. API Endpoint

```ts
GET /api/diagnostics/weekly/:weekNumber
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Scorecard Panel

Component: `PlanningScorecardPanel.tsx`

Position: Bottom of Planner page or in collapsible sidebar.

Sections:

- 🌟 Overall Score + Star Rating
- 📘 Domain Coverage Chart (bar graph)
- 🎯 Outcome Linking Rate (% of activities with outcome)
- 📚 Vocabulary Usage Rate
- ⚠️ Warnings + Suggestions

Color cues:

- 🟢 Good (score > 80%)
- 🟡 Needs Attention (50–80%)
- 🔴 Missing Critical Elements (<50%)

#### 🔵 4. Trend Tracker (Optional)

Component: `PlanningTrendGraph.tsx`

- X-axis: Week #
- Y-axis: Score
- Shows planning consistency over term
- Tooltip: shows score breakdown per week

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - Planner model
  - Outcome link model
  - Vocabulary tracker
  - Assessment builder (optional)

- Scored weekly plan stored alongside planner metadata

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/diagnostics/weekly/6
```

Returns:

```json
{
  "score": 72,
  "stars": 3,
  "summary": "Moderate coverage, but no writing or vocab used",
  "flags": ["No writing domain", "No vocab linked"],
  "suggestions": ["Add a writing activity", "Insert vocabulary from 'Farm Animals'"],
  "domainCoverage": {
    "oral": 4,
    "math": 2,
    "writing": 0
  },
  "outcomeLinkRate": 0.66,
  "vocabUsageRate": 0.0
}
```

Rendered Panel:

> 🌟 Score: **72% (★★★☆☆)**
> 🟡 Needs Attention
>
> - 📘 Domains: Oral (4), Math (2), Writing (0)
> - 🎯 Outcome Link Rate: 66%
> - 📚 Vocabulary Use: 0%
>   ⚠️ Suggestions: Add writing activity, use vocab list from current theme

---

### 🚩 RISKS

- Risk of over-scoring or penalizing justified pedagogical deviations
- Teachers may feel “graded”—frame as diagnostic, not evaluative
- Future: allow teacher to annotate reasons for missing elements (e.g., field trip)
