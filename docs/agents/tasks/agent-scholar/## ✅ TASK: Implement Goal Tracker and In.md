## ✅ TASK: Implement Goal Tracker and Intervention Planner

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a flexible, outcome-aligned **goal-setting and intervention-tracking module**. This feature allows teachers to define support goals (e.g., “Speak in full sentences”, “Recognize number patterns to 20”), link them to curriculum expectations, track their status, and document associated strategies or interventions over time.

---

### 🔹 GOAL

Allow teachers to:

- Set personalized goals for individual students
- Align each goal with curriculum outcomes and observed needs
- Log interventions, strategies, and teacher reflections
- Mark progress (e.g., “In Progress”, “Achieved”, “Needs Follow-up”)
- Export goal history as part of cumulative records or SPT exports

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create/edit/delete student goals
  - Tag goals by domain (e.g., oral, reading, behavior)
  - Link to one or more outcomes
  - Log related strategies/interventions (date-stamped)
  - View goal timeline with status changes
  - Export or print as part of student records

- System auto-reminds teachers of active goals during planning/assessment

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `StudentGoal` and `GoalLog` models

```prisma
model StudentGoal {
  id           Int      @id @default(autoincrement())
  studentId    Int
  label        String
  status       String   // "Not Started", "In Progress", "Achieved", "Needs Review"
  domain       String
  outcomeIds   Int[]
  createdAt    DateTime @default(now())
  closedAt     DateTime?
}

model GoalLog {
  id        Int      @id @default(autoincrement())
  goalId    Int
  entryType String   // "Intervention", "Observation", "Update"
  content   String
  createdAt DateTime @default(now())
  createdBy Int
}
```

Migrate:

```bash
npx prisma migrate dev --name create_student_goals
npx prisma generate
```

#### 🟢 2. API Endpoints

- `POST /api/students/:id/goals`
- `PATCH /api/goals/:goalId`
- `POST /api/goals/:goalId/logs`
- `GET /api/students/:id/goals`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Goal Dashboard

Component: `StudentGoalDashboard.tsx`

- Tabs: 🧭 Active Goals | ✅ Completed Goals | ➕ New Goal
- Each goal card shows:

  - Status tracker
  - Linked outcomes
  - Intervention log button
  - \[✏️ Edit] \[🗑️ Delete]

Color-code status:

- Gray = Not Started
- Blue = In Progress
- Green = Achieved
- Red = Needs Review

#### 🔵 4. Goal Editor / Creator

Component: `GoalEditor.tsx`

Form:

- Goal title
- Domain (dropdown)
- Outcome selector (multi)
- Status dropdown
- Notes field
- Save/Cancel

#### 🔵 5. Intervention Log Viewer

Component: `GoalLogViewer.tsx`

- Timeline or list of intervention entries
- Show entryType icon
- Markdown formatting
- “➕ Add Entry” modal:

  - Date
  - Type (dropdown)
  - Entry text

---

### 🔗 INTEGRATION NOTES

- Remind teacher of open goals when:

  - Planning activities
  - Entering reflections
  - Generating reports

- When goal is marked “Achieved,” allow optional reflection or summary

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create goal:**

```http
POST /api/students/12/goals
{
  label: "Speak in full sentences during circle",
  domain: "oral",
  outcomeIds: [14, 15],
  status: "In Progress"
}
```

**Add log entry:**

```http
POST /api/goals/32/logs
{
  entryType: "Intervention",
  content: "Used picture cards and sentence stems daily this week.",
  createdBy: 8
}
```

Rendered Goal Card:

> 🎯 **"Speak in full sentences"**
> 🗣️ Domain: Oral | Linked to CO.14, CO.15
> ✅ Status: In Progress
> 📆 Started: Sept 15 | Last update: Oct 2
> \[📝 Log Entry] \[📤 Export]

---

### 🚩 RISKS

- Must distinguish between “support goals” and general planning outcomes
- Intervention logs should be secure and non-public (not exposed to families)
- Avoid clutter: show only active goals prominently; archive old ones cleanly
