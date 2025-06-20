## ✅ TASK 12 — D2. Teaching Philosophy Report Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Teaching Philosophy Report Generator** that supports teachers in reflecting on their practice. It compiles a structured, AI-assisted draft based on logged planning choices, teaching reflections, and outcome alignment.

This helps teachers articulate:

- Their pedagogical approach
- How they differentiate and support learners
- What they prioritize in their classroom
- How their work connects to curriculum and equity goals

---

### 🔹 GOAL

Enable teachers to:

- Auto-generate a personalized teaching philosophy draft
- Reflect on their planning and instructional patterns
- Cite examples and artifacts from their own history
- Export a polished document for professional portfolios or performance reviews

---

### ✅ SUCCESS CRITERIA

- Teachers receive a document organized into:

  1. **Planning & Curriculum Approach**
  2. **Assessment & Differentiation**
  3. **Equity and Inclusion Practices**
  4. **Reflection & Growth Areas**

- Each section:

  - Includes personalized observations
  - Draws on usage data (e.g., lesson types, outcome focus, reflections)
  - Allows full editing and override

- Export to PDF or copy/paste format

---

### 🔧 BACKEND TASKS

#### 🟢 1. Teaching Philosophy Generator API

```ts
POST /api/teacher/philosophy
{
  "teacherId": 5
}
```

Returns:

```json
{
  "sections": {
    "planning": "I prioritize student agency by building flexible plans anchored in learning outcomes...",
    "assessment": "I use observations, self-reflection, and formative checks to guide feedback...",
    "equity": "I adapt resources to reflect the diverse identities in my classroom...",
    "growth": "This year, I’ve explored more responsive teaching cycles based on student curiosity..."
  }
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Teaching Philosophy Editor

Component: `TeachingPhilosophyEditor.tsx`

- Sections with collapsible headers:

  - \[🧠 Planning] \[📏 Assessment] \[🧩 Inclusion] \[🌱 Growth]

- Features:

  - \[✏️ Edit Text] for each section
  - \[🔄 Regenerate] with different tones (formal, reflective, concise)
  - \[📄 Export PDF] and \[📋 Copy All]

---

### 🔗 INTEGRATION NOTES

- Draws from:

  - `WeeklyPlan`, `MiniLessonLog`, `StudentReflection`, `AssessmentRecord`
  - Tags (e.g., differentiation, inclusion, inquiry)

- Optional tone tuning via GPT with teacher-selected style

---

### 📁 DATABASE TASKS

Add `TeacherPhilosophyDraft`:

```prisma
model TeacherPhilosophyDraft {
  id        Int @id @default(autoincrement())
  teacherId Int
  section   String // "planning", "assessment", etc.
  content   String
  createdAt DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Teacher: Ms. Taylor
- Draft:

  - “I use backward design and emergent planning to structure learning”
  - “I’ve focused on incorporating student-led inquiry this year”

- Teacher edits equity section and adds a concrete classroom example
- Exports as PDF

---

### 🚩 RISKS

- AI must not make assumptions unsupported by data
- Tone should reflect teacher’s authentic voice—not generic admin-speak
- Must support both early-career and experienced educators with different language needs
