## ✅ TASK: Implement Student Goal Tracker with Milestone Evidence

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **goal-setting and tracking module** that allows teachers (and optionally students) to define personal learning or behavior goals, log milestone progress, and attach linked evidence. These goals are visible from the student dashboard and inform narrative summaries, interventions, and report writing.

---

### 🔹 GOAL

Allow teachers to:

- Create 1–3 active goals per student
- Define custom or prefilled goals (e.g., “I will use kind words with my classmates”)
- Log progress updates, with optional:

  - Date
  - Description
  - Evidence (artifact/reflection/observation)

- View history of progress on each goal
- Mark goal as met, paused, or ongoing

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Set and edit goals with start date
  - Log milestone progress (dates, commentary, evidence links)
  - View progress timeline per goal
  - View all current goals across class (dashboard)
  - Use goal data in narrative reports and summary generation

---

### 🔧 BACKEND TASKS

#### 🟢 1. Goal Model

```prisma
model StudentGoal {
  id          Int       @id @default(autoincrement())
  studentId   Int
  teacherId   Int
  goalText    String
  createdAt   DateTime  @default(now())
  status      String    // "active", "met", "paused"
  milestones  Milestone[]
}

model Milestone {
  id          Int       @id @default(autoincrement())
  goalId      Int
  date        DateTime
  comment     String
  evidenceId  Int?      // optional FK to Artifact or Observation
}
```

#### 🟢 2. API Endpoints

- `POST /api/student-goals` – create goal
- `PUT /api/student-goals/:id` – update goal
- `POST /api/student-goals/:id/milestone` – add progress note
- `GET /api/student-goals/:studentId` – list all goals for one student

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Goal Tracker UI

Component: `GoalTracker.tsx`

For each student:

- Display:

  - Goal text
  - Status chip
  - Timeline of milestones

- Buttons:

  - \[➕ Add Milestone]
  - \[✏️ Edit Goal] \[✅ Mark as Met] \[⏸️ Pause]

Milestone UI:

- Date (default: today)
- Comment box
- Attach existing reflection/artifact (dropdown with preview)

---

#### 🔵 4. Class Goals Dashboard

Component: `GoalSummaryGrid.tsx`

- Grid or table view of all students
- Shows:

  - Goal text (truncated)
  - Progress count (# milestones)
  - Status

- Filters:

  - Status
  - Domain (if curriculum-linked)

---

### 🔗 INTEGRATION NOTES

- Can be linked to:

  - Reflections
  - Artifacts
  - Observations

- Feeds into:

  - AI-Assisted Summaries
  - SPT Narrative Generator

- Optional: autocomplete from goal bank (e.g., SEL goal templates)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**POST /api/student-goals**

```json
{
  "studentId": 14,
  "goalText": "I will try to use kind words with my classmates.",
  "teacherId": 5
}
```

**POST /api/student-goals/17/milestone**

```json
{
  "date": "2025-02-01",
  "comment": "Eddie resolved a conflict with peers without raising his voice.",
  "evidenceId": 202 // (artifact or observation ID)
}
```

Rendered Goal:

> 🎯 **"I will try to use kind words with my classmates."**
> 👁️ Status: Active
> 📅 Feb 1: Eddie resolved a conflict with peers without raising his voice.
> \[📎 Evidence Attached]

---

### 🚩 RISKS

- Too many goals = overload—suggest limit per student
- Ambiguous goals without milestones = no usable insight
- Should balance social/emotional and academic goals
