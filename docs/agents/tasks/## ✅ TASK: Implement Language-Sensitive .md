## ✅ TASK: Implement Language-Sensitive Assessment Builder

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are enhancing the platform to support **assessment planning and tracking** in French Immersion classrooms. This includes designing **oral, reading, writing**, and **multimodal** assessments that are aligned with curriculum outcomes and sensitive to the language development stage of Grade 1 students. Assessments should be reusable, outcome-linked, and allow group-level scoring.

---

### 🔹 GOAL

Allow teachers to create language-sensitive assessments that evaluate French oral and written proficiency and track student progress on specific curriculum outcomes. Teachers must be able to define assessment types, criteria, and scores, log observations, and view outcome-aligned mastery summaries.

---

### ✅ SUCCESS CRITERIA

- Teachers can create and reuse assessment templates.
- Each assessment includes:

  - Title
  - Type (oral, reading, writing, mixed)
  - Linked outcomes
  - Custom or preloaded criteria
  - Administration date

- Teachers can log group results (score + notes).
- Outcomes display coverage statistics based on assessments.
- Assessments appear on Daily/Weekly plans.
- Teachers can view progress per outcome, including most recent assessment and average score.

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create Prisma models

In `prisma/schema.prisma`:

```prisma
model AssessmentTemplate {
  id          Int        @id @default(autoincrement())
  title       String
  type        String     // "oral" | "reading" | "writing" | "mixed"
  description String?
  outcomeIds  Int[]      @default([])
  userId      Int
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model AssessmentResult {
  id         Int        @id @default(autoincrement())
  templateId Int
  template   AssessmentTemplate @relation(fields: [templateId], references: [id])
  date       DateTime
  groupScore Int?       // 0–100
  notes      String?
}
```

Then:

```bash
npx prisma migrate dev --name add_assessment_tracking
npx prisma generate
```

#### 🟢 2. Add API routes

Create REST endpoints:

- `POST /api/assessments/templates`
- `GET /api/assessments/templates`
- `POST /api/assessments/results`
- `GET /api/assessments/results?week=YYYY-MM-DD`
- `GET /api/assessments/by-outcome/:id`

Include Zod validation:

- `groupScore` must be 0–100 if present.
- `date` must be ≤ today.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Assessment Template Builder

Component: `AssessmentBuilder.tsx`

- Fields:

  - Title
  - Assessment type selector (radio/group button)
  - Linked Outcomes (multi-select)
  - Description
  - Rubric Criteria (editable or choose from template)

    - For oral: pronunciation, fluency, listening
    - For writing: vocabulary, spelling, sentence structure

- Save as reusable template.

- Tag for easy search in planner.

#### 🔵 4. Add "Add Assessment" UI to Planner

In `WeeklyPlanner.tsx` and `DailyPlanner.tsx`:

- Button: “➕ Add Assessment”
- Choose from existing templates or create inline.
- Sets assessment date to selected day or week.

Render summary below scheduled activities:

```jsx
📝 Oral Interview – Vocabulary | Due: Jan 25
```

#### 🔵 5. Log Assessment Results

- After scheduled date, open a logging modal:

  - Group Score (0–100%)
  - Notes / observations

- Save to `AssessmentResult` table.
- Store date and associated template.

Render in planner:

```jsx
🧠 Oral Vocabulary Assessment → ✅ 82% | “Most students were confident.”
```

#### 🔵 6. Link Assessments to Outcome Mastery

Update **Curriculum Coverage Dashboard**:

- For each outcome, show:

  - **# of assessments** linked
    _e.g._: “3 assessments”
  - **Average performance score**
    _e.g._: “Avg: 78%”
  - **Date of last assessment**
    _e.g._: “Last: Jan 20”

**Display format:**

```text
Outcome CO.2 — 3 assessments — Avg: 78% — Last: Jan 20
```

Optional visual: add color-coded bars (green/yellow/red) based on average score thresholds.

Add filter: “Show outcomes with no assessments logged.”

---

### 🔗 INTEGRATION NOTES

- Assessments and results are separate from milestone or activity completion.
- Curriculum outcome completion status should not automatically update—use assessment data for insight only.
- Future: support AI-generated rubrics based on outcome type.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create Assessment Template:**

```http
POST /api/assessments/templates
{
  title: "Oral Interview – Family Vocabulary",
  type: "oral",
  outcomeIds: [12, 14],
  description: "Students identify and describe family members using full sentences."
}
```

**Log Result:**

```http
POST /api/assessments/results
{
  templateId: 3,
  date: "2026-01-25",
  groupScore: 84,
  notes: "Most students responded well to open-ended prompts."
}
```

---

### 🚩 RISKS

- Avoid overengineering UI; must be simple enough to use on busy days.
- Do not mark outcomes as “covered” just because an assessment exists.
- Rubrics must be editable to allow cultural and linguistic nuance.
