## ✅ TASK: Implement Dynamic Report Card Compiler

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a system to help teachers generate and format official report card content from the structured learning data already collected in the platform. This includes numeric indicators (e.g., outcome ratings), written comments (narratives), and optional bilingual versions, while aligning with the expected formats used by the PEI English School Board for Grade 1 French Immersion.

---

### 🔹 GOAL

Allow teachers to:

- Assemble official report card content for each term
- Select or generate outcome ratings (e.g., “Meeting expectations”, “Approaching”, “Needs support”)
- Include optional narrative comments per subject/domain
- Export completed report cards in compatible formats (PDF/CSV/school upload system)
- Support bilingual versions if needed

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - View each student’s report card draft
  - See structured outcome ratings per subject
  - Add/edit comments (bilingual if needed)
  - Preview full report card for a student or class
  - Export in accepted formats

- Outcome indicators can be:

  - Manually entered
  - Auto-suggested from logged evidence

- Supports domain-aligned layout (e.g., oral, reading, writing, math, personal/social)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `ReportCardEntry` model

```prisma
model ReportCardEntry {
  id           Int      @id @default(autoincrement())
  studentId    Int
  term         String
  domain       String   // e.g., "oral", "writing", "math"
  outcomeId    Int?
  rating       String   // e.g., "Meeting", "Approaching", "Needs Support"
  commentFr    String?
  commentEn    String?
  isFinalized  Boolean  @default(false)
  updatedBy    Int
  updatedAt    DateTime @updatedAt
}
```

Migrate:

```bash
npx prisma migrate dev --name create_report_card_entries
npx prisma generate
```

#### 🟢 2. Implement rating engine (optional)

- Use heuristics or thresholds based on:

  - Linked artifact count
  - Teacher reflections
  - Outcome tags
  - Vocabulary use

- Default to “suggest rating” (editable by teacher)

#### 🟢 3. API Endpoints

- `POST /api/students/:id/report-card?term=2`
- `PATCH /api/report-card/:entryId`
- `GET /api/students/:id/report-card`
- `POST /api/report-card/export?term=2&format=pdf`

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Report Card Editor

Component: `ReportCardEditor.tsx`

- Select student and term
- Table:

  - Domains as rows
  - Columns: Outcome | Rating | Comment Fr | Comment En
  - Auto-filled where possible

- Editable fields:

  - Rating (dropdown)
  - Comment (Markdown supported, optional dual language)

#### 🔵 5. Class Summary View

Component: `ReportCardClassTable.tsx`

- Grid with all students
- Quick enter/edit for ratings per domain
- Color coding: green (complete), yellow (partial), red (incomplete)
- Export button: \[📤 Generate Class PDF]

#### 🔵 6. Export Panel

Component: `ReportCardExport.tsx`

- Format options:

  - 🖨️ PDF (per student or bulk)
  - 📁 CSV (for upload to SIS)
  - 📄 Raw Text / Markdown

- Language options: Fr / En / Bilingual

---

### 🔗 INTEGRATION NOTES

- Pull outcome codes and terms from central planner state
- Avoid duplication with Term Summary Generator—this is **formal** report output
- If exporting to CSV, use board-specified headers (configurable)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Get report card:**

```http
GET /api/students/25/report-card?term=2
```

**Returns:**

```json
[
  {
    domain: "writing",
    outcomeId: 14,
    rating: "Meeting",
    commentFr: "Elle écrit des phrases complètes avec ponctuation.",
    commentEn: "She writes complete sentences with punctuation."
  },
  ...
]
```

Rendered Output:

> **Term 2 Report Card: Alice**
>
> - **Writing**: ✔️ Meeting expectations
>   _She writes complete sentences with punctuation._
> - **Oral Language**: 🔄 Approaching
>   _Still developing confidence in group discussions._ > \[📄 Download PDF]

---

### 🚩 RISKS

- PEI report card templates may change year to year—must be configurable
- Ensure alignment with school board requirements (column names, domains)
- Bilingual comment entry must be intuitive, not overwhelming
