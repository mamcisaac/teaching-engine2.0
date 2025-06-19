## ✅ TASK: Implement Goal-Progress Analyzer and Summarizer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are implementing a **student goal tracking and summarization system** that captures growth across personal, SEL, and academic goals. Students may have goals like:

- “Ask for help when I need it” (SEL)
- “Use French words when talking to friends” (oral language)
- “Try again when something is hard” (growth mindset)

Teachers assign or co-create these goals with students. As weeks go by, evidence from reflections, artifacts, and mini-lessons is automatically analyzed to determine goal progress, which is visualized and summarized.

---

### 🔹 GOAL

Allow teachers and students to:

- Set and edit meaningful goals
- Link reflections and evidence to goals
- View visual indicators of progress
- Use summarized status in report cards and family communications

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create new student goals
  - Link existing artifacts or reflections as “evidence of progress”
  - View each goal’s timeline and current status

- System can:

  - Auto-suggest potential goal evidence from voice/artifact uploads
  - Display summaries like “demonstrated consistently” or “still emerging”

- Families can:

  - View progress on goals in weekly summaries and reports

---

### 🔧 BACKEND TASKS

#### 🟢 1. Goal Model

```prisma
model StudentGoal {
  id          Int      @id @default(autoincrement())
  studentId   Int
  goalText    String
  category    String     // e.g., "SEL", "oral", "academic"
  createdAt   DateTime   @default(now())
  updatedAt   DateTime
  status      String     // "not_started", "progressing", "demonstrated"
  evidenceIds Int[]      // links to VoicePortfolioEntry or ArtifactUpload
}
```

#### 🟢 2. Goal Progress Evaluator API

```ts
GET /api/goals/summary?studentId=23&term=2
```

Returns:

```json
[
  {
    "goal": "Try again when something is hard",
    "category": "SEL",
    "status": "progressing",
    "evidence": [
      "Reflection Week 4: 'I tried again when it didn’t work the first time.'",
      "Artifact: Block structure with retry photo"
    ]
  }
]
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Goal Dashboard

Component: `GoalProgressView.tsx`

- Shows all current and past goals
- Visual indicators:

  - 🟥 Not Started
  - 🟧 Progressing
  - 🟩 Demonstrated

- Buttons:

  - \[➕ New Goal] \[🔗 Link Evidence] \[📝 Edit Goal] \[📊 View Summary]

- Optional AI Suggestion:

  - “This reflection may demonstrate progress on Goal X”

---

#### 🔵 4. Teacher Review Panel

Component: `GoalReviewTeacher.tsx`

- Table of all students with:

  - # of goals in progress
  - Status summary per category
  - Most recent linked evidence

- Export to:

  - Narrative Report
  - Term Summary Sheet
  - Family Summary

---

### 🔗 INTEGRATION NOTES

- Pulls evidence from:

  - `VoicePortfolioEntry`
  - `ArtifactUpload`
  - `MiniLessonLog`

- Appears in:

  - Narrative Report Generator
  - Family Portal
  - Curriculum Dashboard (SEL/Goal sections)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```http
GET /api/goals/summary?studentId=12
```

Returns:

```json
[
  {
    "goal": "Ask for help when I need it",
    "category": "SEL",
    "status": "demonstrated",
    "evidence": [
      "Week 3 Reflection: 'I asked FridgeCat for help!'",
      "Teacher Note: Participated in group SEL session"
    ]
  }
]
```

---

### 🚩 RISKS

- Young students may forget goals if not routinely reinforced—needs visual cues and reflection prompts
- Auto-linking of evidence must avoid false positives
- Teachers may need nudges to update status or reflect on goal alignment
