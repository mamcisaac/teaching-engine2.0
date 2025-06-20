## ✅ TASK 10 — C3. Student Longitudinal Portrait Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Student Portrait Generator** that creates a holistic, longitudinal summary of a student’s development across terms and years. This profile draws on logged reflections, assessment records, goal progress, and artifacts—curated and optionally annotated by the teacher.

The tool supports:

- Student-led conferences
- Cumulative record keeping
- Teacher transitions (e.g., Grade 1 → Grade 2 handover)

---

### 🔹 GOAL

Enable teachers to:

- View and curate a cumulative narrative of each student
- Highlight progress across key competencies (literacy, numeracy, social-emotional learning, etc.)
- Attach supporting evidence for each narrative strand
- Export a polished PDF or HTML portrait to share with families or next-year teachers

---

### ✅ SUCCESS CRITERIA

- System:

  - Compiles key learning evidence across terms
  - Groups content into 3–5 domains (e.g., Literacy, Math, SEL, Inquiry)
  - Surfaces notable growth moments and quotes
  - Enables teacher editing of each domain narrative
  - Allows adding/removing artifacts per section

- Final product:

  - Clean, printable 1–2 page portrait
  - Personalized and evidence-informed
  - Free of automated filler

---

### 🔧 BACKEND TASKS

#### 🟢 1. Portrait Generation API

```ts
POST /api/students/portrait
{
  "studentId": 19
}
```

Returns:

```json
{
  "studentName": "Sofia",
  "domains": {
    "literacy": {
      "narrative": "Sofia has grown as a confident storyteller...",
      "evidence": [
        { "date": "2025-01-18", "source": "Portfolio", "summary": "Recorded audio story using sequencing cards" },
        { "date": "2025-02-03", "source": "Reflection", "summary": "Shared: 'I used words like 'first' and 'then' to help my reader'" }
      ]
    },
    ...
  }
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Student Portrait Composer

Component: `StudentPortraitEditor.tsx`

- Sections:

  - \[📘 Literacy] \[📐 Math] \[💬 SEL] \[🔬 Inquiry] \[🎯 Goal Summary]

- Features:

  - Inline editing of narrative
  - \[📎 Add Evidence] selector
  - \[📋 Copy to Clipboard], \[📄 Export PDF], \[🌐 Export HTML]
  - Portrait title/header (e.g., “Sofia’s Learning Story — Grade 1”)

---

### 🔗 INTEGRATION NOTES

- Pulls data from:

  - `PortfolioItem`, `MiniLessonLog`, `AssessmentRecord`, `GoalProgress`, `StudentReflection`

- Maps to domains via `outcome → domain` mapping
- Allows optional teacher voice notes to override summaries

---

### 📁 DATABASE TASKS

Create `StudentPortrait` and `PortraitEvidenceLink`:

```prisma
model StudentPortrait {
  id         Int @id @default(autoincrement())
  studentId  Int
  year       Int
  domain     String
  narrative  String
  createdAt  DateTime @default(now())
}

model PortraitEvidenceLink {
  id           Int @id @default(autoincrement())
  portraitId   Int
  sourceType   String
  sourceId     Int
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Student: Kieran
- Generates draft across 4 domains
- Teacher adds 1 reflection and 1 math artifact
- Edits SEL paragraph to personalize tone
- Exports to “Kieran_G1_Portrait.pdf”

---

### 🚩 RISKS

- Overly generic text undermines trust—ensure human curation is foregrounded
- Tone must reflect the student positively without whitewashing challenges
- Some teachers may need scaffolding for how to use/interpret the tool
