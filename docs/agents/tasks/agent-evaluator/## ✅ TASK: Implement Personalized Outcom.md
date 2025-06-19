## ✅ TASK: Implement Personalized Outcome Mini-Lesson Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **AI-powered mini-lesson generation system**. This tool supports teachers in providing **personalized re-teaching, enrichment, or practice** focused on a specific outcome.

Mini-lessons are concise, 5–10 minute instructional activities that include:

- Clear objective
- Vocabulary focus
- Step-by-step instructions
- Optional printable or visual support
- Prompt for student response or evidence

These lessons help teachers support struggling learners, reinforce mastery, or differentiate instruction—especially in small-group settings.

---

### 🔹 GOAL

Allow teachers to:

- Select a specific outcome
- Receive 1–3 mini-lesson suggestions:

  - Scaled to grade level and classroom context
  - Aligned to active student goals (if selected)
  - Editable and exportable

- Link mini-lesson to planner, documentation, or assessment

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Choose an outcome and teaching context (e.g., reteach, extension)
  - Receive curated, editable mini-lesson ideas
  - Assign or log mini-lessons to specific students
  - Capture reflection or evidence of student response

---

### 🔧 BACKEND TASKS

#### 🟢 1. Mini-Lesson Generator API

```ts
POST / api / mini - lesson / generate;
```

Payload:

```json
{
  "outcomeId": 14,
  "studentId": 7,
  "mode": "reteach"
}
```

Returns:

```json
[
  {
    "title": "Building Sentences with Visual Prompts",
    "objective": "Use visuals to construct oral sentences that include descriptive vocabulary.",
    "vocabulary": ["house", "big", "red"],
    "steps": [
      "Show image of a house and model a descriptive sentence.",
      "Ask student to describe a new picture using 'big' or 'red'.",
      "Record or write the sentence together."
    ],
    "studentTask": "Say or write two full descriptive sentences using vocabulary from the lesson."
  }
]
```

Supports multiple `mode` values:

- `"reteach"` → scaffolded
- `"enrich"` → more open-ended
- `"practice"` → repetition & rehearsal
- `"station"` → printable mini-center activity

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Mini-Lesson Request UI

Component: `MiniLessonCreator.tsx`

- Teacher selects:

  - Outcome (from dropdown or search)
  - Mode (reteach, enrich, practice, etc.)
  - Optional: specific student, group, or context tag

- Shows 1–3 AI-generated mini-lessons
- Editable interface:

  - \[✏️ Edit Steps]
  - \[📎 Attach Resource]
  - \[📥 Export] or \[📤 Push to Planner]

---

#### 🔵 3. Student Assignment Tracker

Component: `MiniLessonLog.tsx`

- For each lesson:

  - Students it was used with
  - Date, notes, outcome link
  - Attachments or artifacts

- Teacher can tag outcome as “addressed via mini-lesson”

---

### 🔗 INTEGRATION NOTES

- Outcome list sourced from curriculum model
- Optional links to:

  - `StudentGoal`
  - `ReflectionResponse`
  - `AssessmentOutcomeLink`

- Output may populate:

  - Planner → “small group” slot
  - Documentation → “targeted support” log
  - Assessment → “informal check-in”

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Input:**

```json
{
  "outcomeId": 5,
  "studentId": 14,
  "mode": "practice"
}
```

**Returns:**

```json
[
  {
    "title": "Sound Sorting Game",
    "objective": "Sort words by their beginning sounds.",
    "steps": [
      "Present cards with pictures of objects (e.g., sun, ball, sock).",
      "Ask student to group cards by initial sound.",
      "Check for accuracy and discuss any mismatches."
    ],
    "vocabulary": ["sun", "sock", "ball"],
    "studentTask": "Choose 3 new items and say their beginning sound."
  }
]
```

---

### 🚩 RISKS

- Lessons must remain developmentally appropriate; AI output may overcomplicate
- Risk of teacher overreliance on AI material rather than student-centered dialogue
- Needs strong safeguards on terminology to match curriculum language and tone
