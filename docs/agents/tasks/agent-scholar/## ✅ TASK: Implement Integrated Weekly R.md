## ✅ TASK: Implement Integrated Weekly Reflection Prompt Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **prompt generation engine** that creates customized weekly reflection prompts for students. These prompts should be:

- Adapted to classroom activity history (e.g., math focus, oral work)
- Linked to recent outcomes and student goals
- Presented in student-friendly language
- Optionally voice- or picture-enabled (depending on interface)

Teachers can preview, edit, and assign prompts. Students respond via typed, drawn, recorded, or emoji-based interfaces depending on age and ability.

---

### 🔹 GOAL

Enable teachers to:

- Auto-generate reflection prompts for each student or whole class
- Align prompts to recent activity, SEL goals, and curriculum outcomes
- Capture rich student voice input in structured and flexible formats
- Use reflection responses in assessment and reporting

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Generate and assign reflection prompts by week
  - Preview/edit prompt before assignment
  - Link prompt to outcomes, domains, and goals
  - Review all student responses on dashboard

- Students can:

  - See weekly reflection question(s)
  - Submit response by typing, drawing, recording, or emoji
  - Review previous responses

---

### 🔧 BACKEND TASKS

#### 🟢 1. Reflection Prompt Generator API

```ts
POST / api / reflection - prompts / generate;
```

Payload:

```json
{
  "studentId": 12,
  "term": 2,
  "week": 5
}
```

Returns:

```json
{
  "prompt": "What was something you felt proud of during your group work this week?",
  "linkedOutcomes": [3, 8],
  "domains": ["oral", "SEL"]
}
```

Generation algorithm should consider:

- Activities tagged for the week
- Linked outcomes
- Active student goals
- Recently assessed domains

Optionally: allow `mode` param → "class-wide", "personalized", "SEL-focused", etc.

---

#### 🟢 2. Reflection Response Model

```prisma
model ReflectionResponse {
  id             Int      @id @default(autoincrement())
  studentId      Int
  week           Int
  term           Int
  promptText     String
  responseText   String?
  audioUrl       String?
  drawingUrl     String?
  emojiFeedback  String?
  outcomeTags    Int[]     // Optional FK to Outcome IDs
  createdAt      DateTime  @default(now())
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Teacher Prompt Editor

Component: `PromptEditor.tsx`

- For selected week:

  - Show suggested prompt
  - Allow teacher edits
  - Link to outcomes and goals (pre-filled but editable)
  - Assign prompt to all or some students

---

#### 🔵 4. Student Response Interface

Component: `StudentReflectionWidget.tsx`

- Shows current week's prompt
- Input modes:

  - \[✏️ Type Response]
  - \[🎤 Record Audio]
  - \[🎨 Draw Response]
  - \[😀 Emoji Scale]

- Optional AI-generated scaffold (e.g., sentence starters)

---

#### 🔵 5. Teacher Review Dashboard

Component: `ReflectionReviewBoard.tsx`

- Grid view of student responses for a week
- Columns: Student, Response Preview, Domain, Outcomes Tagged
- Buttons:

  - \[🧠 Tag Outcome]
  - \[📝 Add Comment]
  - \[📤 Use in Report]

---

### 🔗 INTEGRATION NOTES

- Pulls context from:

  - `WeeklyPlanner`
  - `StudentGoal`
  - `AssessmentOutcomeLink`

- Reflections flow into:

  - Student Voice Portfolio
  - Family Portal View
  - Term Summary Generator

- Teacher prompt may also be shown in planner preview for week

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```json
POST /api/reflection-prompts/generate
{
  "studentId": 14,
  "term": 2,
  "week": 6
}
```

**Returns:**

```json
{
  "prompt": "What was something tricky in math this week, and how did you solve it?",
  "linkedOutcomes": [12],
  "domains": ["math", "SEL"]
}
```

**Student sees:**

> **Reflection:**
> "What was something tricky in math this week, and how did you solve it?"
> \[✏️ Write] \[🎤 Speak] \[🎨 Draw] \[😀 Emoji]

---

### 🚩 RISKS

- Prompts must remain age-appropriate and clear—AI hallucinations must be edited
- Must handle varied input modalities robustly (especially for primary students)
- Linking reflections to outcomes must remain teacher-controlled
