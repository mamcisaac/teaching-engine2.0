## ✅ TASK: Implement Goal Tracker Engine

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **goal tracking system** that allows teachers to define, monitor, and reflect on learning goals for individual students (or small groups). These goals may be tied to outcomes, domains, or support needs, and can be reviewed regularly using structured observations or reflections. Teachers must be able to evaluate progress, update goal status, and generate reports.

---

### 🔹 GOAL

Allow teachers to:

- Set and manage student-specific goals
- Tag goals with domains, outcomes, and support flags (e.g., IEP, SPT)
- Track observations and evidence toward each goal
- Mark goals as achieved, modified, or continued
- Export term-based summaries for reporting or case meetings

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create a new goal for one or more students
  - Link goals to outcomes, domains, or interventions
  - View each student's active and completed goals
  - Add evidence or observations toward a goal
  - View progress status (not started, in progress, achieved, discontinued)
  - Export all goals and evidence for term-end review

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create Models

```prisma
model StudentGoal {
  id           Int      @id @default(autoincrement())
  studentIds   Int[]
  authorId     Int
  title        String
  description  String
  domain       String
  outcomeIds   Int[]
  supportTags  String[] // e.g. ["SPT", "IEP", "Speech"]
  status       String   // "Not started", "In progress", "Achieved", "Discontinued"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model GoalObservation {
  id        Int      @id @default(autoincrement())
  goalId    Int
  authorId  Int
  date      DateTime @default(now())
  notes     String
}
```

---

#### 🟢 2. API Endpoints

- `POST /api/goals` – create goal
- `GET /api/goals?student=14` – fetch by student
- `POST /api/goals/:id/observe` – add evidence
- `PATCH /api/goals/:id` – update status or metadata
- `POST /api/goals/export` – PDF/CSV/Markdown report

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Goal Creation Form

Component: `GoalCreator.tsx`

Inputs:

- Goal title (one-liner)
- Description (markdown)
- Students (multi-select)
- Domain
- Outcome tags (auto-complete)
- Support flags (IEP, SPT, etc.)
- \[✅ Save Goal]

#### 🔵 4. Goal Tracker Panel

Component: `GoalTracker.tsx`

Table:

- 📌 Title
- 📚 Domain
- 🔖 Outcome tags
- 📊 Status (color-coded)
- ⏳ Last observation date
- \[🧠 Add Evidence] \[📝 Edit] \[📤 Export]

Filters:

- Domain
- Status
- Support tags
- Student

#### 🔵 5. Goal Detail Modal

Component: `GoalDetail.tsx`

Sections:

- Title, description
- Linked students
- Outcome links
- Observations timeline:

  > 🗓️ Feb 3 – “Tried using calming strategy before math. Needed help.”
  > 🗓️ Feb 12 – “Asked to lead math centers. Used visual prompts independently.”

Buttons:

- \[➕ Add Observation]
- \[✅ Mark as Achieved]
- \[🛑 Discontinue Goal]

---

### 🔗 INTEGRATION NOTES

- Observations can auto-link to Daily Evidence Log
- Student Profile → new tab: “Goals”
- Goal reflections may feed into Report Comment Generator or Radar views

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create Goal:**

```http
POST /api/goals
{
  title: "Use calming strategy before math",
  studentIds: [14],
  domain: "behavior",
  outcomeIds: [301],
  supportTags: ["SPT"],
  description: "Student will apply a practiced calming strategy before transitions into math work blocks."
}
```

**Add Observation:**

```http
POST /api/goals/21/observe
{
  notes: "Used 4-square breathing with a peer reminder."
}
```

Rendered View:

> ✅ “Use calming strategy before math”
> 👥 Alex | 🧠 Domain: Behavior | 📚 Outcome: BE.3
> Status: In Progress | Last Observation: Mar 4
> \[➕ Add Note] \[📤 Export]

---

### 🚩 RISKS

- Risk of duplication with other supports (SPT notes, IEP trackers)—must remain lightweight
- Teachers may avoid usage if entry isn’t quick or review isn’t useful—optimize UX
- Evidence must be structured and easy to review later (timeline view)
