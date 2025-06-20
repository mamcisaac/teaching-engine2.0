## ✅ TASK 17 — E4. Student Curiosity Detector

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Student Curiosity Detector**, which uses natural language analysis to identify curiosity-driven language in student reflections, questions, and classroom dialogue. The goal is to surface moments where a student shows initiative, wonder, or exploratory thinking—supporting emergent curriculum planning.

This promotes responsive teaching and honors learner agency.

---

### 🔹 GOAL

Automatically identify and tag:

- Student questions that indicate curiosity
- Reflections that show personal initiative or exploration
- Observations that connect domains or extend expected outcomes

Highlight these moments for teachers to:

- Integrate into planning
- Use for report narratives
- Tag for student profiles

---

### ✅ SUCCESS CRITERIA

- System can:

  - Process text (e.g., from a `StudentReflection` or observation log)
  - Score for presence of “curiosity signals” (e.g., Why…? I wonder if… What happens when…)
  - Surface notable segments with confidence levels

- Teachers can:

  - Review detected segments
  - Confirm or discard
  - Mark as significant to include in growth reports or parent conferences

---

### 🔧 BACKEND TASKS

#### 🟢 1. Curiosity Scoring Engine

```ts
POST /api/detectors/curiosity
{
  "text": "I saw ants walking in a line. I wonder where they are going."
}
```

Returns:

```json
{
  "score": 0.91,
  "highlight": "I wonder where they are going.",
  "type": "questioning"
}
```

Detection types:

- `questioning`: asks open-ended questions
- `hypothetical`: proposes a “what if”
- `connective`: links ideas or concepts
- `reflective`: notices a personal learning shift

#### 🟢 2. Batch Analysis API

For nightly or manual processing of all new reflections.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Teacher Curiosity Review Panel

Component: `CuriositySignals.tsx`

- Inputs:

  - Filter by student/date
  - Group by detection type

- Actions:

  - \[✅ Confirm signal]
  - \[🗑️ Dismiss]
  - \[⭐ Save to GrowthProfile]

#### 🔵 4. Highlight Integration

- In `StudentReflectionView.tsx`, highlight detected segments with soft glow or badge
- Add "Curiosity Level" tag in summary bar

---

### 🔗 INTEGRATION NOTES

- Input sources:

  - Student reflections
  - Audio transcripts (from Task E3)
  - Observation notes

- Should be language-agnostic (English/French)—tune detection prompts accordingly
- Eventually exportable to report builder or learning summary

---

### 📁 DATABASE TASKS

Add `CuriositySignal` model:

```prisma
model CuriositySignal {
  id             Int @id @default(autoincrement())
  reflectionId   Int?
  studentId      Int
  segment        String
  type           String
  score          Float
  approved       Boolean?
  createdAt      DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Student writes: “What if our class was on Mars?”
- System detects `hypothetical`, score: 0.92
- Teacher confirms and adds to student’s growth narrative for curiosity

---

### 🚩 RISKS

- Over-sensitivity: Avoid tagging generic or formulaic phrases
- Bias: Ensure diverse linguistic styles are respected (not only academic English)
- Fatigue: Teachers must be able to quickly scan and batch review results
