## ✅ TASK: Implement Daily Oral Language Routine Tracker

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a PEI-aligned teaching assistant that helps Grade 1 French Immersion teachers reinforce **oral French proficiency** through structured daily routines. This feature allows teachers to define, schedule, and log **daily oral tasks**—such as morning greetings, oral practice drills, French songs, etc.—with easy-to-reuse templates and quick check-ins during the day.

---

### 🔹 GOAL

Help teachers establish and track **repeatable daily oral language routines** in French. These routines should be quick to set up, reusable across days/weeks, and tied to curriculum outcomes (especially CO.0–CO.6). Teachers should be able to log whether the routine was completed and (optionally) mark student engagement levels.

---

### ✅ SUCCESS CRITERIA

- Teachers can create reusable oral language routines (e.g. “Morning greeting,” “Oral question of the day”).
- Routines can be scheduled on a daily plan and shown in the Daily Planner.
- Teachers can log whether the routine was completed and rate student participation (optional).
- Curriculum outcomes (e.g. CO.1) can be linked to each routine.
- Dashboard or daily plan shows streaks or completion stats (e.g. “4/5 days completed this week”).

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `OralRoutineTemplate` model

In `prisma/schema.prisma`:

```prisma
model OralRoutineTemplate {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  userId      Int
  outcomes    Outcome[]  @relation("OralRoutineOutcomes")
  createdAt   DateTime   @default(now())
}
```

Also add:

```prisma
model DailyOralRoutine {
  id            Int        @id @default(autoincrement())
  date          DateTime
  templateId    Int
  template      OralRoutineTemplate @relation(fields: [templateId], references: [id])
  completed     Boolean   @default(false)
  notes         String?
  participation Int?      // 0–100 scale
}
```

Run:

```bash
npx prisma migrate dev --name add_oral_routine_tracking
npx prisma generate
```

#### 🟢 2. API Routes

- `GET /api/oral-routines/templates`
- `POST /api/oral-routines/templates`
- `GET /api/oral-routines/daily?date=2026-01-15`
- `POST /api/oral-routines/daily`
- `PUT /api/oral-routines/daily/:id`

Allow scheduling routines by copying templates onto specific days.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Create Oral Routine Template Manager

Component: `OralRoutineTemplateManager.tsx`
Used in Settings or Planning pages.

Fields:

- Title (e.g. “Bonjour Routine”)
- Description (e.g. “Students greet peers and respond to question of the day.”)
- Linked Outcomes (e.g. CO.1)
- “Save as Template” button

Saved templates appear in a reusable list.

#### 🔵 4. Add routine scheduling to Daily Plan

File: `DailyPlanner.tsx`

- Show “Add Oral Routine” button.
- Opens modal to select from existing templates or define a quick ad-hoc routine.
- Display scheduled routine inline (e.g. in morning block), with:

  - Completion checkbox
  - Participation slider (0–100%)
  - Quick notes (“very engaged today”)

#### 🔵 5. Log and visualize progress

- Daily Plan: show ✓ if completed
- Weekly View: show a summary widget:

> Oral Routines: ✅ 4/5 days completed | Avg participation: 82%

- Curriculum Coverage Dashboard: increase “evidence” weight for linked outcomes if routines are performed consistently.

---

### 🔗 INTEGRATION NOTES

- Each oral routine may target different outcomes (e.g. CO.0 = awareness, CO.1 = sound blending).
- Daily routines should be displayed like mini-activities but without time-block drag logic.
- Can co-exist with normal Daily Plan content.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Template Creation:**

```http
POST /api/oral-routines/templates
{
  title: "Bonjour + Calendar Talk",
  description: "Call and response in French for days of the week.",
  outcomes: ["CO.0", "CO.1"]
}
```

**Daily Log:**

```http
POST /api/oral-routines/daily
{
  date: "2026-01-15",
  templateId: 2,
  completed: true,
  participation: 85
}
```

**UI:**
In Daily Plan, teacher sees:

> 📢 “Bonjour + Calendar Talk” → ✅ Complete | 👥 85%

---

### 🚩 RISKS

- Avoid making this feature too complex—must be usable in < 10 seconds each day.
- Ensure routines do not trigger scheduling conflicts with real-time lessons.
- Cap number of daily routines to \~5 to avoid cluttering Daily Plan.
