## ✅ TASK: Implement Outcome Dependency Graph and Scope Planner

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **visual curriculum graph and planning support module** that shows prerequisite relationships among outcomes—especially in developmental domains (e.g., oral language, number sense, inquiry skills).

The system assists teachers in:

- Seeing logical clusters and pathways
- Avoiding mis-sequenced instruction
- Planning long-term progression across terms
- Ensuring early-term coverage of foundational outcomes

---

### 🔹 GOAL

Enable teachers to:

- Explore dependency-based groupings among curriculum outcomes
- Plan scope and sequence with outcome readiness in mind
- Adjust pacing to allow foundational outcomes to be reinforced before higher-level goals

---

### ✅ SUCCESS CRITERIA

- Graph:

  - Clearly shows directional dependencies (e.g., Outcome A → Outcome B)
  - Highlights unmet prerequisites for planned instruction
  - Supports filtering by domain, term, or outcome type

- Planner integrations:

  - Suggests which outcomes must precede others
  - Warns when planning out-of-sequence instruction

- Scope Builder:

  - Drag-and-drop tool to allocate outcomes across terms

---

### 🔧 BACKEND TASKS

#### 🟢 1. Outcome Dependency Model

```prisma
model OutcomeDependency {
  id           Int @id @default(autoincrement())
  sourceId     Int  // prerequisite outcome
  targetId     Int  // dependent outcome
  strength     Int  // optional, 1 = weak, 3 = strong
  type         String // "developmental", "cognitive", "linguistic"
}
```

#### 🟢 2. Dependency Graph API

```ts
GET /api/outcomes/dependencies?domain=oral&grade=1
```

Returns:

```json
{
  "nodes": [
    { "id": 1, "label": "CO.1: Express ideas orally" },
    { "id": 2, "label": "CO.4: Participate in group discussion" }
  ],
  "edges": [{ "from": 1, "to": 4, "type": "developmental", "strength": 2 }]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Outcome Dependency Graph View

Component: `OutcomeGraphViewer.tsx`

- Directed graph:

  - Nodes = outcomes
  - Edges = dependencies
  - Hover: shows full outcome description

- Filters:

  - \[📚 Domain] \[📅 Term] \[🧱 Dependency Type]

- Highlights:

  - Unplanned prerequisites (in red)
  - Already completed outcomes (green)

---

#### 🔵 4. Scope Planner Interface

Component: `ScopeSequenceBuilder.tsx`

- Grid:

  - Rows = curriculum outcomes
  - Columns = Term 1, Term 2, Term 3

- Drag outcome chips into terms
- Warnings:

  - “CO.4 placed before prerequisite CO.1”
  - “CO.7 missing—required before CO.12”

---

### 🔗 INTEGRATION NOTES

- Data originates from:

  - Human-coded dependency matrix (curriculum dev)
  - Optionally enhanced with teacher input or AI-assist

- Used by:

  - WeeklyPlanner (for alerts)
  - TermPlanner (for scope suggestions)
  - CurriculumHeatmap (to identify missed foundational targets)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Query:**

```http
GET /api/outcomes/dependencies?domain=math&grade=1
```

Returns:

```json
{
  "nodes": [
    { "id": 1, "label": "CO.1: Count to 20" },
    { "id": 2, "label": "CO.5: Compare quantities" }
  ],
  "edges": [{ "from": 1, "to": 5 }]
}
```

In Scope Planner:

- Teacher places CO.5 in Term 1 but not CO.1 → system warns:

  > “CO.5 depends on CO.1, which is not scheduled yet.”

---

### 🚩 RISKS

- Graph may become visually cluttered—requires UX polish
- Dependency data must be accurate and not overly rigid
- Teachers may find alerts intrusive if not tunable or dismissible
