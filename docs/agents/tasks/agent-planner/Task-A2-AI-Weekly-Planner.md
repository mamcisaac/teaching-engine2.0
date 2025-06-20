## ✅ TASK 2 — A2. AI-Powered Weekly Plan Generator

---

**Agent**: Agent-Planner
**Phase**: 2 - Core AI Planning
**Priority**: 3 (High - Core functionality)
**Dependencies**: E1 Curriculum Embeddings, A1 Activity Generator
**Estimated Time**: 4-5 days
**Implementation Note**: Requires A1 for activity suggestions

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **AI-assisted weekly plan generation system**. Based on the teacher’s student roster, past plans, curriculum progress, outcome gaps, and optional focus areas, the system suggests a weekly draft plan including:

- Outcomes to target
- Suggested activities
- Reflections or prompts to use
- Optional family summary draft

The goal is to accelerate teacher planning **without automating judgment**—suggestions must always be editable, never auto-assigned.

---

### 🔹 GOAL

Enable teachers to:

- Click “Generate Draft Plan for Week X”
- Receive a structured weekly plan draft
- Review, edit, and save to their planner
- Auto-fill sections such as outcomes, sample activities, daily focus prompts

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Generate plan drafts by week/term
  - See rationale for each suggested outcome/activity
  - Accept, reject, or replace components
  - Edit all text before saving

- Drafts include:

  - 3–5 outcome targets (curriculum-aligned)
  - 1–2 activity suggestions per outcome
  - 2–3 cross-curricular or SEL prompts
  - Draft family summary message

---

### 🔧 BACKEND TASKS

#### 🟢 1. Weekly Plan Suggestion Engine API

```ts
POST /api/weeklyplan/suggest
{
  "teacherId": 6,
  "term": 2,
  "week": 7
}
```

Returns:

```json
{
  "week": 7,
  "term": 2,
  "outcomes": [
    { "id": 22, "description": "Retell personal experiences with temporal structure" },
    { "id": 17, "description": "Use non-standard units to compare objects" }
  ],
  "activities": [
    {
      "outcomeId": 22,
      "title": "Weekend Timeline",
      "description": "Draw and narrate events from your weekend in order using words like 'first', 'then', and 'finally'."
    }
  ],
  "prompts": ["What did you learn that surprised you?", "How did you solve a problem this week?"],
  "familySummaryDraft": "This week, we explored personal storytelling and informal measurement. Ask your child how they measured classroom items using shoes!"
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Weekly Plan Draft Panel

Component: `WeeklyPlanDraft.tsx`

- Preview tabs:

  - \[🎯 Outcomes] \[🏗️ Activities] \[🗣️ Prompts] \[📩 Family Summary]

- Controls:

  - \[♻️ Regenerate]
  - \[📝 Edit] inline
  - \[📥 Accept to Planner]

- Show rationale when hovering:

  - "Suggested due to lack of coverage in Term 2"
  - "Paired with prior outcome CO.14 (Reinforce patterning)"

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `CurriculumOutcome` coverage history
  - `MiniLessonLogs`, `StudentGoals`, and `NarrativeReflections` (for student needs)
  - Past `WeeklyPlanner` entries
  - `ActivitySuggestion` database

- Pushes into:

  - `WeeklyPlanner`

- Optional: GPT fallback for low-data teachers or newly added outcomes

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```http
POST /api/weeklyplan/suggest
{
  "teacherId": 10,
  "term": 1,
  "week": 6
}
```

Returns:

- 3 outcomes (literacy, math, SEL)
- 4 suggested activities
- 3 sentence starters
- Draft family message

---

### 📁 DATABASE TASKS

Create draft structure in planner:

```prisma
model WeeklyPlanDraft {
  id         Int @id @default(autoincrement())
  teacherId  Int
  week       Int
  term       Int
  outcomeIds Int[]
  activityIds Int[]
  prompts    String[]
  summaryText String
  createdAt  DateTime @default(now())
}
```

---

### 🚩 RISKS

- Needs override-by-design to avoid unwanted automation
- Activity/outcome pairings must be pedagogy-aligned
- GPT-generated drafts must be reviewed for hallucination or misalignment
