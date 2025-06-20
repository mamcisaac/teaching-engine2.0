## ✅ TASK 3 — A3. Reflection Classifier & Outcome Linker

---

**Agent**: Agent-Evaluator
**Phase**: 3 - Enhancement
**Priority**: 5 (Medium - Enhancement feature)
**Dependencies**: E1 Curriculum Embeddings (Agent-Atlas)
**Estimated Time**: 2-3 days
**Implementation Note**: Enhancement to existing reflection features

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **smart reflection classifier** that analyzes student-written or oral reflections and suggests:

- Likely curriculum outcomes being addressed
- Emotional/SEL indicators (e.g., perseverance, curiosity)
- Tags for teacher searchability or summarization

This enables rapid linking of authentic student work to outcomes and goals without requiring the teacher to manually label each reflection.

---

### 🔹 GOAL

Empower teachers to:

- Submit or paste student reflections
- Receive outcome suggestions based on reflection content
- Auto-tag SEL indicators and reflection themes (e.g., risk-taking, collaboration)
- Link tagged reflections to learning evidence, narrative reports, and goals

---

### ✅ SUCCESS CRITERIA

- System accepts:

  - Text reflections (typed or dictated)
  - Optional image captions, audio transcriptions

- Returns:

  - Top 1–3 suggested curriculum outcomes
  - SEL/competency tags
  - Rationale preview for each suggestion

- Teacher can:

  - Accept or reject each outcome/tag
  - Add reflection to student portfolio

---

### 🔧 BACKEND TASKS

#### 🟢 1. Reflection Classification API

```ts
POST /api/reflections/classify
{
  "studentId": 24,
  "text": "Today I worked with Alex. We solved the story problem by drawing pictures. I had to try twice before I got it right."
}
```

Returns:

```json
{
  "outcomes": [
    {
      "id": 18,
      "confidence": 0.92,
      "rationale": "Describes solving word problems with visual support"
    },
    { "id": 33, "confidence": 0.61, "rationale": "References perseverance in problem-solving" }
  ],
  "selTags": ["perseverance", "collaboration", "visual strategy"]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Reflection Review Panel

Component: `ReflectionClassifier.tsx`

- Input:

  - Reflection text box
  - \[🎤 Transcribe Audio] optional

- Output:

  - Suggested outcomes + rationale
  - Suggested tags
  - \[✅ Accept] \[❌ Reject] \[✏️ Edit]
  - \[📌 Add to Portfolio] \[🎯 Link to Goal]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `CurriculumOutcome` semantic descriptions
  - `SELGoal` and `CompetencyTag` vocabularies

- Pushes to:

  - `StudentPortfolio`
  - `NarrativeReportBuilder`
  - `CurriculumHeatmap` (optional anecdotal boost)

Optional: train custom classifier or use GPT 4.5 Turbo with embedded outcome vectors for matching.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```json
{
  "text": "I used blocks to count backwards from 20. Then I showed Snowflake how to do it too!"
}
```

Returns:

- Outcomes:

  - CO.7: Count backward from 20 (confidence: 0.95)
  - CO.14: Explain number strategies to peers (confidence: 0.64)

- Tags: "collaboration", "leadership", "number sequencing"

---

### 📁 DATABASE EXTENSION

Extend `StudentReflection` model:

```prisma
model StudentReflection {
  id          Int      @id @default(autoincrement())
  studentId   Int
  text        String
  outcomeIds  Int[]
  selTags     String[]
  createdAt   DateTime @default(now())
}
```

---

### 🚩 RISKS

- Risk of false positives (e.g., matching vague reflections)
- SEL tag taxonomy must remain developmentally grounded
- Teacher must have ultimate override authority to ensure accuracy
