## ✅ TASK: Implement Term Planning Assistant with Outcome Backfill Suggestions

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **curriculum-aware planning assistant** that analyzes each teacher’s current and past planning data to identify:

- Uncovered or underrepresented outcomes
- Unbalanced pacing or clustering
- Missing reinforcement of foundational targets

It provides **smart suggestions** to help teachers close coverage gaps and maintain instructional coherence across terms.

---

### 🔹 GOAL

Support teachers in building outcome-complete, pedagogically sound term plans that:

- Cover all required curriculum outcomes
- Avoid overloading specific weeks or domains
- Reinforce critical outcomes over time
- Surface neglected outcomes for optional review or re-instruction

---

### ✅ SUCCESS CRITERIA

- Teacher sees:

  - Heatmap of current term outcome coverage
  - List of outcomes not yet addressed
  - Suggestions for when and how to integrate those outcomes

- System:

  - Considers past terms’ data
  - Adjusts for domain weight (e.g., literacy vs. art)
  - Suggests outcome groupings (e.g., oral + SEL)

- Teacher can:

  - Accept, defer, or reject suggestions
  - Auto-insert suggested outcomes into upcoming weeks

---

### 🔧 BACKEND TASKS

#### 🟢 1. Outcome Coverage Analyzer API

```ts
GET /api/planning/coverage?teacherId=5&term=2
```

Returns:

```json
{
  "term": 2,
  "totalOutcomes": 58,
  "covered": 41,
  "uncovered": [12, 16, 24],
  "reinforcementCandidates": [6, 8, 14]
}
```

#### 🟢 2. Suggestion Engine API

```ts
POST /api/planning/suggestions
{
  "teacherId": 5,
  "week": 7
}
```

Returns:

```json
{
  "suggestions": [
    {
      "outcomeId": 12,
      "reason": "Uncovered in Term 2",
      "domain": "Math",
      "pairWith": ["CO.14"]
    },
    {
      "outcomeId": 6,
      "reason": "Needs reinforcement; last addressed Week 2",
      "domain": "Oral Language"
    }
  ]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Term Heatmap + Alert Panel

Component: `TermCoverageDashboard.tsx`

- Weekly grid:

  - Color-coded outcome coverage
  - Reinforcement vs first-time indicators

- Sidebar:

  - \[⚠️ Uncovered Outcomes]
  - \[📈 Reinforcement Opportunities]

- Button: \[🔁 Auto-Suggest Plan Updates]

---

#### 🔵 4. Suggestion Integrator

Component: `PlanningSuggestionsPanel.tsx`

- Accept or reject outcome suggestions
- \[➕ Add to Week 7 Plan]
- Show paired activities (if any)
- Rationale display: “Last addressed Week 2”

---

### 🔗 INTEGRATION NOTES

- Consumes:

  - WeeklyPlanner logs
  - CurriculumOutcome metadata

- Appears in:

  - TermPlanner view
  - Weekly planning interface
  - CurriculumHeatmap (via annotation layer)

- May draw from:

  - MiniLessonLogs (for reinforcement)
  - Assessment outcomes (to avoid re-teaching what’s already mastered)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```http
GET /api/planning/coverage?teacherId=2&term=3
```

Returns:

```json
{
  "covered": [1, 2, 3, 5, 8, 9],
  "uncovered": [4, 6, 7],
  "reinforcementCandidates": [1, 5]
}
```

→ System suggests:

- “Add CO.6 (Compare sets) to Week 8—uncovered so far”
- “Reinforce CO.1 (Number patterns)—last addressed Week 1”

---

### 🚩 RISKS

- System may over-prescribe if teachers have alternative plans (must be overrideable)
- Clustering logic (grouping outcomes) must remain domain-informed
- Needs nuance to avoid false alerts (e.g., SEL outcome shown only indirectly)
