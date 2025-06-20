## ✅ TASK 15 — E2. GPT Planning Agent Plugin

---

**Agent**: Agent-Planner
**Phase**: 2 - Core AI Planning (Parallel with A2)
**Priority**: 4 (High - Conversational interface)
**Dependencies**: E1 Curriculum Embeddings
**Estimated Time**: 3-4 days
**Implementation Note**: Can develop parallel to A1/A2

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are implementing a **GPT-powered Planning Agent Plugin** that interacts with teachers to co-create weekly plans, daily activities, and teaching sequences. It uses curriculum alignment, class context, and current goals to suggest responsive plans—and refines them through conversational input.

This agent supports dynamic planning, emergent learning, and just-in-time support.

---

### 🔹 GOAL

Enable teachers to:

- Interact with an embedded GPT-style assistant
- Request help creating or adapting weekly plans
- Receive suggestions aligned to curriculum outcomes
- Guide the assistant with constraints (e.g., “focus on inquiry” or “use recycled materials”)
- Generate structured plans that can be edited or pushed directly into the planning system

---

### ✅ SUCCESS CRITERIA

- Teacher can:

  - Prompt the planner conversationally (e.g., “I need 3 math stations for Monday”)
  - Get curriculum-aligned suggestions
  - Edit, save, or regenerate each section
  - Push output directly into `WeeklyPlan` or `MiniLessonLog`

- Assistant adapts tone and content to grade/subject context

---

### 🔧 BACKEND TASKS

#### 🟢 1. Planning Agent API

```ts
POST /api/planner/ask
{
  "prompt": "Give me a week of activities focused on PEI Grade 1 French immersion math outcomes.",
  "context": {
    "teacherId": 7,
    "grade": 1,
    "domain": "math",
    "term": 3,
    "goals": ["subtraction", "patterning"]
  }
}
```

Returns:

```json
{
  "plan": [
    { "day": "Monday", "activity": "Pattern walk and sort objects", "outcomes": [105, 106] },
    { "day": "Tuesday", "activity": "Story problems with number lines", "outcomes": [108] },
    ...
  ]
}
```

#### 🟢 2. Context Resolver

- Pull teacher-specific context:

  - Grade, subjects, current goals, student needs

- Pull current `WeeklyPlan`, `GoalTracker`, and class tags (e.g., “outdoor learner-friendly”)

#### 🟢 3. GPT Integration Layer

- Plugin-ready interface to GPT-4 or Claude 3
- Preloaded with:

  - Local curriculum vector index (from Task E1)
  - Template guardrails (e.g., PEI outcome format)
  - Adjustable style presets (structured / narrative / bilingual)

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Interactive Planning Assistant UI

Component: `PlanningAgent.tsx`

- Chat interface with:

  - \[🗨️ Prompt box]
  - \[📋 Insert activity into plan]
  - \[🔄 Regenerate suggestion]
  - \[📁 Save to WeeklyPlan]

- Sidebar:

  - Context overview (grade, term, goals)
  - Curriculum matches
  - Toggle between daily/weekly format

---

### 🔗 INTEGRATION NOTES

- Uses:

  - Outcome embeddings (Task E1)
  - Curriculum outcome alignment engine
  - Lesson plan template logic

- Must support bilingual content generation (EN/FR toggle)
- Stores history for iterative planning and undo

---

### 📁 DATABASE TASKS

Add optional `PlanningAgentLog` table:

```prisma
model PlanningAgentLog {
  id         Int @id @default(autoincrement())
  teacherId  Int
  prompt     String
  response   Json
  createdAt  DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Prompt: “Make me a three-day unit on patterning with outdoor components”
- Output:

  - Day 1: Leaf and rock sorting → Outcome 102
  - Day 2: Pattern relay race → Outcome 103

- Teacher edits day 2 to use indoor gym plan
- Pushes to Week 9 plan via \[📁 Save]

---

### 🚩 RISKS

- Hallucination risk—must require teacher confirmation for AI-generated content
- Content must be grounded in curriculum outcomes and pedagogy, not just creative output
- Needs strong prompt logging and retry functionality to reduce repetition
