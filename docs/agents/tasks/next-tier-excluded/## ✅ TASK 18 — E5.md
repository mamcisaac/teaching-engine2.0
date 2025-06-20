## ✅ TASK 18 — E5. Personalized Learning Loop Synthesizer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Personalized Learning Loop Synthesizer**, an experimental feature that automatically detects feedback loops in a student's journey—e.g., when a reflection, an activity, and a reassessment show evidence of growth across time. The system surfaces these loops for teacher review and generates narrative summaries to support report writing, conferencing, and progress tracking.

This transforms disconnected data into growth stories.

---

### 🔹 GOAL

Automatically identify and narrate student learning loops by:

- Linking 3+ related events (e.g., observation → plan → student reflection → assessment)
- Showing a clear feedback cycle and improvement over time
- Generating a paragraph-length narrative highlighting growth or change

---

### ✅ SUCCESS CRITERIA

- Teachers can view:

  - Detected learning loops
  - Associated dates, artifacts, and outcomes
  - Suggested growth narrative

- Teachers can:

  - Approve/edit/override narrative
  - Tag for inclusion in report cards or learning summaries
  - Download or print individualized progress briefs

---

### 🔧 BACKEND TASKS

#### 🟢 1. Loop Detection Engine

Scan student-linked data for:

- At least one `GoalTracker` entry
- Followed by an activity plan or observation (e.g., `MiniLessonLog`)
- Ending with a reflection or assessment tagged to the same outcome(s)

Example detection:

```json
{
  "studentId": 22,
  "loop": [
    { "type": "goal", "text": "Use descriptive language in writing", "date": "2025-01-12" },
    { "type": "plan", "text": "Mini-lesson on adjectives", "date": "2025-01-14" },
    {
      "type": "reflection",
      "text": "I used more describing words like 'sparkly' and 'cold'",
      "date": "2025-01-20"
    }
  ],
  "outcomeId": 305
}
```

#### 🟢 2. Narrative Generator

Generate 3–5 sentence paragraph:

> “At the start of January, \[Student] set a goal to use more descriptive language. They participated in a mini-lesson on adjectives, and later reflected that they used words like ‘sparkly’ and ‘cold’ in their journal writing. This shows a strong link between goal-setting and written expression.”

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Loop Review Interface

Component: `LearningLoopSynthesizer.tsx`

- For each detected loop:

  - Timeline of linked entries
  - Generated narrative (editable)
  - Outcome(s) tagged
  - \[✅ Approve & Save], \[📝 Edit], \[⏹️ Dismiss]

- Options:

  - \[📄 Export All Narratives for Report Cards]
  - \[📋 Copy to Student Summary]

---

### 🔗 INTEGRATION NOTES

- Input types:

  - `GoalTracker`, `MiniLessonLog`, `StudentReflection`, `AssessmentRecord`

- Requires semantic linking using:

  - Outcome tags
  - Outcome embeddings (from Task E1)
  - Shared keyword overlap (fallback)

---

### 📁 DATABASE TASKS

Add `LearningLoop` model:

```prisma
model LearningLoop {
  id           Int @id @default(autoincrement())
  studentId    Int
  outcomeId    Int
  artifactIds  Json // references to linked items
  narrative    String
  approved     Boolean?
  createdAt    DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Input:

  - Goal: “Improve oral storytelling” (Jan 10)
  - Activity: “Drama storytelling circle” (Jan 12)
  - Reflection: “I used voices and actions in my story” (Jan 15)

- Outcome: “Expresses ideas through oral language”
- Output:
  Narrative auto-generated and presented to teacher
  Teacher edits second sentence, saves to report export

---

### 🚩 RISKS

- False links: Ensure loops are not just co-occurrences in time
- Narrative tone must reflect classroom voice, not AI generic summaries
- Teachers need control: override, redact, or refine all AI-detected loops
