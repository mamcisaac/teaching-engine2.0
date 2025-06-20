## ✅ TASK 9 — C2. Term Report Insights Assistant

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **AI-powered assistant** that helps teachers draft student narrative reports by synthesizing learning evidence, highlighting strengths and challenges, and suggesting personalized language. This assistant operates within a structured reporting framework aligned with PEI expectations and subject-specific tone.

---

### 🔹 GOAL

Enable teachers to:

- Auto-generate a first draft of each student’s term report
- Edit or refine tone, vocabulary, and examples
- View report section-by-section: strengths, needs, next steps
- Cite specific portfolio items or assessment evidence
- Use bilingual phrasing where appropriate (EN/FR)

---

### ✅ SUCCESS CRITERIA

- System generates:

  - A full draft organized by domain (e.g., Literacy, Math, SEL)
  - 2–3 authentic strengths with examples
  - 1–2 growth areas and next steps
  - Teacher voice (e.g., supportive, constructive, developmental)

- Teacher can:

  - Edit, revise, or rephrase any section
  - Swap in alternate wordings
  - Export to printable PDF or SIS-compatible markdown

---

### 🔧 BACKEND TASKS

#### 🟢 1. Report Assistant API

```ts
POST /api/reports/term-summary
{
  "studentId": 7,
  "term": 2,
  "language": "en"
}
```

Returns:

```json
{
  "literacy": {
    "strengths": [
      "Ethan communicates clearly through oral retellings and often elaborates on story events with detail.",
      "He has shown growing confidence in sounding out unfamiliar words and enjoys reading aloud in small groups."
    ],
    "needs": [
      "Next term, Ethan is encouraged to include more supporting details in his written responses and explain his thinking more fully."
    ]
  },
  "math": {
    "strengths": [
      "Consistently uses strategies like drawing, counting on, and number lines to solve problems."
    ],
    "needs": [
      "Continued practice with explaining how answers were found will help consolidate reasoning."
    ]
  },
  ...
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Term Report Builder

Component: `TermReportAssistant.tsx`

- Sections:

  - \[📘 Literacy] \[📐 Math] \[💬 SEL/Competency] \[🧭 Next Steps]

- Features:

  - \[✏️ Edit Text] for each entry
  - \[🔄 Rephrase] button (e.g., 2–3 tone options)
  - \[📋 Cite Evidence] link to supporting artifact
  - \[📤 Export Draft] (PDF, copy, or SIS markup)

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `PortfolioItem`, `AssessmentRecord`, `StudentReflection`, `GoalProgress`

- Uses:

  - Outcome-to-domain mapping (e.g., CO.11 → Literacy)
  - Tag-based strength/need inferences from Task C1

- Uses GPT fallback for tone tuning and summarization

---

### 📁 DATABASE TASKS

Create `StudentTermReportDraft`:

```prisma
model StudentTermReportDraft {
  id         Int @id @default(autoincrement())
  studentId  Int
  term       Int
  domain     String
  strengths  String[]
  needs      String[]
  language   String
  createdAt  DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Student: Lily, Term 2
- Generates:

  - Literacy: 2 strength statements + 1 need
  - Math: 1 strength + 1 next step

- Teacher rephrases 1 entry using \[🔄 Rephrase]
- Adds link to reflection dated Feb 1
- Exports to final PDF draft

---

### 🚩 RISKS

- Generated tone must match professional, empathetic teacher voice
- Must avoid overgeneralization (e.g., “always” or “never”)
- Teachers must retain editorial control over final reports
