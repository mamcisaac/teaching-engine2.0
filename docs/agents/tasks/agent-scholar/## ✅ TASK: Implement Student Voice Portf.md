## ✅ TASK: Implement Student Voice Portfolio System

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **student-centered portfolio system** that captures voice, choice, and growth over time. It brings together:

- Weekly reflections (text/audio/drawing)
- Selected artifacts (photos, videos, scanned work)
- Goal tracking commentary
- Curriculum outcome tags
- Teacher annotations

The system should support both informal, student-initiated entries and curated, teacher-requested entries. It must allow for both individual student review and class-wide dashboards.

---

### 🔹 GOAL

Allow teachers and students to:

- Review student work and reflections over time
- Filter and tag entries by outcome, domain, goal, week, or media type
- Surface evidence of learning growth and self-expression
- Support narrative reporting, family communication, and documentation

---

### ✅ SUCCESS CRITERIA

- Students can:

  - View, add, and revisit their voice portfolio
  - Upload artifacts, record voice, draw, or type
  - Tag entries with emotion, outcome, or activity

- Teachers can:

  - Filter by student, domain, or goal
  - Annotate entries and mark exemplars
  - Export entries for family reporting or printing

- Portfolio supports continuity across terms

---

### 🔧 BACKEND TASKS

#### 🟢 1. Voice Portfolio Entry Model

```prisma
model VoicePortfolioEntry {
  id            Int       @id @default(autoincrement())
  studentId     Int
  week          Int
  term          Int
  type          String    // "reflection", "artifact", "goal", "open"
  title         String?
  textContent   String?
  audioUrl      String?
  drawingUrl    String?
  artifactIds   Int[]     // FK to Artifact(s)
  outcomeTags   Int[]     // FK to Outcome(s)
  emotionTag    String?   // e.g. "😊", "😠", "😕"
  createdBy     String    // "student" | "teacher"
  createdAt     DateTime  @default(now())
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Student Portfolio Dashboard

Component: `StudentPortfolioView.tsx`

- Timeline or card layout by week
- Each entry shows:

  - Media preview (🖼️, 🎤, ✍️)
  - Outcome(s), goal (if linked), emotion
  - Add \[💬 Reflection] \[🎤 Record] \[🖼️ Upload] \[🎨 Draw]

Students can:

- Filter by: type, emotion, outcome
- See a “growth map” for their own voice over time

---

#### 🔵 3. Teacher Portfolio Review

Component: `ClassPortfolioDashboard.tsx`

- Grid or list view: one row per student
- Columns: # of entries, domains covered, exemplar flagged
- View mode:

  - \[🧠 Reflections]
  - \[📎 Artifacts]
  - \[🏁 Goals]
  - \[🎯 Outcome map]

- Buttons:

  - \[📥 Export Student Portfolio]
  - \[🗂️ Compile Report Evidence]
  - \[⭐ Flag Exemplar Entry]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `ReflectionResponse`
  - `ArtifactUpload`
  - `StudentGoal`

- Used by:

  - Family Portal Preview
  - Reporting Generator
  - End-of-Term Synthesis Tool

Supports eventual:

- Student-to-student commenting (moderated)
- Public/private flagging (by entry)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Student entry:**

```json
{
  "studentId": 12,
  "term": 2,
  "week": 4,
  "type": "reflection",
  "textContent": "I liked building with blocks today. I made a really tall tower!",
  "emotionTag": "😊",
  "outcomeTags": [8, 11],
  "createdBy": "student"
}
```

Displays in timeline as:

> Week 4 – 😊
> "I liked building with blocks today. I made a really tall tower!"
> 🏗️ Linked to Outcome CO.8, CO.11

---

### 🚩 RISKS

- Must moderate media uploads (especially audio)
- Risk of overwhelm if students over-tag or use generically
- Requires scaffolding for younger learners (sentence stems, icons)
