## ✅ TASK: Implement Outcome Progress Audit Panel

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **auditing and diagnostic dashboard** that allows teachers to assess the coverage, frequency, and quality of learning evidence associated with curriculum outcomes—at the class and individual student levels. This enables more balanced reporting, early identification of neglected domains, and support for instructional decision-making.

---

### 🔹 GOAL

Allow teachers to:

- View a matrix of outcomes (by domain) and evidence linked to each
- Drill down into student-level outcome progress
- Identify which outcomes have insufficient documentation
- Filter by term, domain, outcome cluster, or student
- Export a diagnostic snapshot for planning or reporting support

---

### ✅ SUCCESS CRITERIA

- Class-level outcome matrix shows:

  - 📊 Coverage: % of students with evidence
  - 🧠 Depth: frequency of evidence (e.g., 3 artifacts vs 0)

- Student-level audit shows:

  - 🔍 Which outcomes are supported by observations/artifacts
  - ❗ Gaps in documentation
  - ⏳ Outcomes planned but not yet taught or documented

- Exports include summary tables for internal or parent-facing use

---

### 🔧 BACKEND TASKS

#### 🟢 1. Outcome Coverage Aggregator

For each outcome:

- Number of students with evidence linked
- Average frequency of linked entries
- Entry types (artifact, planner, reflection, observation)
- Last documented date

Structure:

```ts
type OutcomeAuditEntry = {
  outcomeId: number;
  outcomeText: string;
  domain: string;
  term: string;
  coverageRate: number; // % students with at least one link
  avgFrequency: number; // avg # of entries per student
  lastUsed: string; // ISO date
  entryTypes: string[]; // e.g., ["Artifact", "Reflection"]
};
```

#### 🟢 2. API Endpoints

- `GET /api/audit/class?term=Term2&domain=oral`
- `GET /api/audit/student/:id?term=Term2`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Class Audit Matrix

Component: `OutcomeAuditMatrix.tsx`

- Table/grid format:

  - Rows: Outcomes (grouped by domain)
  - Columns: % coverage, frequency, last use

- Highlight:

  - 🔴 Outcomes with < 50% coverage
  - 🟡 Outcomes with low documentation frequency (< 2)

- Expand row to preview linked evidence entries

Filters:

- Domain
- Term
- Outcome group (e.g., speaking, writing)

#### 🔵 4. Student-Level Audit Panel

Component: `StudentOutcomeAudit.tsx`

- For each outcome:

  - ✔️ Evidence linked (with tooltip of source)
  - 📅 Last entry date
  - 📝 Button to add evidence or reflection

- Overall heatmap for coverage across all domains

#### 🔵 5. Export Tool

Component: `AuditExportPanel.tsx`

- Class summary:

  - Table of all outcomes with color-coded coverage/frequency

- Individual student audit:

  - Outcomes met, in progress, undocumented

- Formats: PDF, CSV, Markdown

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - Planner entries (via linked outcome IDs)
  - Reflections and Artifacts
  - StudentGoals (if goal-outcome mappings exist)

- Planned but undocumented outcomes flagged separately

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/audit/class?term=Term2&domain=oral
```

Returns:

```json
[
  {
    "outcomeId": 12,
    "outcomeText": "Expresses ideas clearly in conversation",
    "domain": "oral",
    "coverageRate": 0.67,
    "avgFrequency": 1.8,
    "lastUsed": "2025-04-06",
    "entryTypes": ["Reflection", "Artifact"]
  }
]
```

Rendered Entry:

> 🎯 **Outcome: Expresses ideas clearly in conversation**
> 📊 67% students documented
> 🔁 Avg. Entries: 1.8
> 🕓 Last Used: Apr 6
> \[🔍 View Entries] \[🧠 Add Evidence]

---

### 🚩 RISKS

- Incomplete outcome tagging may falsely indicate low coverage
- Must avoid penalizing teachers for outcomes not intended for current term
- Performance considerations for large cohorts → consider lazy loading or pagination
