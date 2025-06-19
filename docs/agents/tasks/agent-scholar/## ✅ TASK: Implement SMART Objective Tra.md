## ✅ TASK: Implement SMART Objective Tracking for Curriculum Outcomes

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a professional-grade planning system for Grade 1 French Immersion teachers in PEI. You’ve already linked outcomes to units and activities. Your next job is to allow teachers to define **SMART objectives** (Specific, Measurable, Achievable, Relevant, Time-bound) for each outcome within the context of a milestone or class. This will later enable more robust tracking of student progress, AI feedback, and growth metrics.

---

### 🔹 GOAL

Allow teachers to define SMART goals for each outcome—e.g., "By Week 5, 80% of students will use the word 'parapluie' orally in context"—and optionally log student-level performance or assessment outcomes against them.

---

### ✅ SUCCESS CRITERIA

- Teachers can define one or more SMART goals for any outcome.
- Each SMART goal includes: description, target date, success criteria (% or count), and context (e.g. milestone or class).
- SMART goals are viewable and editable via Outcome, Unit, and Daily/Weekly planner views.
- Teachers can log observed results (e.g. 12/15 students reached goal).
- Dashboards display SMART goal progress and suggest which outcomes lack defined goals.

---

### 🔧 BACKEND TASKS

#### 🟢 1. Extend schema with `SmartGoal` model

In `prisma/schema.prisma`, define:

```prisma
model SmartGoal {
  id          Int        @id @default(autoincrement())
  outcomeId   Int
  outcome     Outcome    @relation(fields: [outcomeId], references: [id])
  milestoneId Int?       // Optional: goal attached to a unit
  milestone   Milestone? @relation(fields: [milestoneId], references: [id])
  description String
  targetDate  DateTime
  targetValue Int        // e.g., 80 (%)
  observedValue Int?     // Logged later (e.g., 75)
  userId      Int
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

Then run:

```bash
npx prisma migrate dev --name add_smart_goal_model
npx prisma generate
```

#### 🟢 2. Add routes

- `POST /api/smart-goals`
- `PUT /api/smart-goals/:id`
- `GET /api/smart-goals?outcomeId=...&milestoneId=...`
- `DELETE /api/smart-goals/:id`

These routes should accept:

```ts
{
  outcomeId: number,
  milestoneId?: number,
  description: string,
  targetDate: string,
  targetValue: number
}
```

Update validation with zod to enforce:

- targetValue ∈ \[0, 100]
- targetDate ≥ today

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Add SMART Goal modal

Create component `SmartGoalEditor.tsx`:

Inputs:

- Linked Outcome (dropdown if not preset)
- Milestone (optional)
- Description (textarea)
- Target Date (calendar picker)
- Target % (slider or numeric input)
- Observed % (optional)

Use in:

- `UnitPlannerPage` → beneath each outcome
- `OutcomeDetailPage` → standalone view

#### 🔵 4. Display SMART Goals

In:

- `CurriculumCoverage.tsx` → show goals per outcome
- `WeeklyPlanner.tsx` → if a day includes a goal's target date, highlight

Example rendering:

```jsx
📈 “By Jan 15: 80% of students will complete oral task (CO.0)”
✅ Progress: 75% achieved
```

#### 🔵 5. Logging observations

Let teachers edit `observedValue` post-assessment.

This can be a simple field in the same `SmartGoalEditor`, unlocked after the target date.

---

### 🔗 INTEGRATION NOTES

- Outcome → Milestone links already exist; this new model binds a _goal_ to that pairing.
- In future, this system will support AI-generated progress reports and adaptive planning prompts.
- If multiple SMART goals exist per outcome, display them chronologically.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**API Test:**

```http
POST /api/smart-goals
{
  outcomeId: 12,
  milestoneId: 5,
  description: "80% of students will pronounce 10 new words by Jan 20",
  targetDate: "2026-01-20",
  targetValue: 80
}
```

**UI Test:**

- On CO.1, teacher sees:

> 📈 “By Jan 20: 80% vocabulary retention”
> ✅ Progress: 64% (based on observation)

---

### 🚩 RISKS

- Teachers may forget to set goals. Highlight outcomes with **no SMART goal**.
- Do not auto-mark outcomes “covered” just because a SMART goal exists.
- Avoid hard-coding % thresholds into logic; let teacher define it.
