## ✅ TASK: Implement Interactive Outcome Matrix

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a dynamic **visual dashboard** where rows represent students and columns represent curriculum outcomes (or vice versa). Each cell in the matrix reflects evidence collected for that outcome for that student: whether it has been assessed, the current status, and links to underlying data (artifacts, reflections, ratings, etc.). This tool provides birds-eye and detailed views of class coverage and individual progression.

---

### 🔹 GOAL

Allow teachers to:

- View per-student curriculum outcome progress
- Identify which outcomes have been:

  - Introduced
  - Assessed
  - Demonstrated independently

- Drill into cell-level data (e.g., artifacts, reflections)
- Filter by term, domain, or student group
- Export visual or structured versions for planning and reporting

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - View a matrix/grid showing all students and their outcome coverage
  - Filter by domain (oral, math, etc.) and term
  - See visual indicators of:

    - No evidence collected
    - Some evidence
    - Demonstrated independently

  - Click any cell to:

    - View linked artifacts or reflections
    - Enter/adjust ratings or flags

- Export matrix as PDF or CSV

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add helper API: `StudentOutcomeStatus`

Define a derived status object:

```ts
type StudentOutcomeStatus = {
  studentId: number;
  outcomeId: number;
  rating?: string; // "Not started", "In progress", "Demonstrated"
  artifactCount: number;
  lastUpdated: string;
};
```

#### 🟢 2. API Endpoints

- `GET /api/matrix?term=2&domain=oral`
  → returns `StudentOutcomeStatus[]`
- `GET /api/matrix/artifacts?student=14&outcome=27`
- `POST /api/matrix/rating` to update teacher judgment manually

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Matrix Grid UI

Component: `OutcomeMatrix.tsx`

- Axes: Students (rows) × Outcomes (columns)

  - Fixed headers (scrollable table)
  - Each cell shows:

    - Color indicator:

      - ❌ Gray = no evidence
      - 🟡 Yellow = in progress
      - 🟢 Green = demonstrated

    - Optional tag count (🧾 2 artifacts)

- Hover shows tooltips: outcome label, last update
- Click cell → opens `OutcomeEvidenceModal`

#### 🔵 4. OutcomeEvidenceModal.tsx

Popup to show linked:

- Artifacts
- Reflections
- Ratings
- “📝 Add judgment” (manual rating)
- \[📎 Link new artifact]

#### 🔵 5. Filters and Export Tools

Filters:

- Term
- Domain
- Outcome strand
- Group (e.g., IEP students only)

Export options:

- PDF (with icons/colors)
- CSV (with rating codes or binary flags)

---

### 🔗 INTEGRATION NOTES

- Pull outcomes from curriculum engine
- Avoid grid overload: only show filtered subset or paginated layout
- Link to planner to auto-flag “not yet covered” outcomes

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Matrix request:**

```http
GET /api/matrix?term=2&domain=oral
```

**Returns:**

```json
[
  {
    studentId: 12,
    outcomeId: 27,
    rating: "Demonstrated",
    artifactCount: 3,
    lastUpdated: "2025-03-03"
  },
  ...
]
```

Rendered Cell:

> 🟢 | CO.27 | 3 artifacts | last updated Mar 3
> \[Click to view evidence or rate]

---

### 🚩 RISKS

- Matrix size can become unwieldy—consider pagination, grouping, or domain filters
- Visual indicators must be distinguishable and intuitive
- Must avoid false impressions of mastery if evidence is sparse—clarify rating basis
