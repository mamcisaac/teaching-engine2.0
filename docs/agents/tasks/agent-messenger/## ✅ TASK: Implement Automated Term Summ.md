## ✅ TASK: Implement Automated Term Summary Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a system that generates rich, human-readable term summaries for each student, drawing on artifacts, observations, reflections, and outcome coverage logged in the system. These summaries are customizable, bilingual, and exportable, supporting both professional reporting and meaningful family communication.

---

### 🔹 GOAL

Allow teachers to:

- Automatically compile a term summary for each student
- Pull from:

  - Linked curriculum outcomes
  - Teacher observations (reflections, family comms)
  - Vocabulary logs
  - Artifacts (photos, writing, audio, etc.)

- Add/edit narrative sections
- Export as PDF, Markdown, or plain text (Fr/En or bilingual)

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - View a draft summary auto-generated per student, per term
  - See outcome-aligned content and linked examples
  - Edit narrative sections manually (per domain or per theme)
  - Include vocabulary highlights, family communication logs, and observed growth
  - Export to parent-ready formats (PDF preferred)

- Summaries reflect:

  - Progress over time
  - Areas of strength and need
  - Clear, parent-friendly language

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `TermSummaryDraft` model

```prisma
model TermSummaryDraft {
  id           Int      @id @default(autoincrement())
  studentId    Int
  term         String   // e.g., "Term 1"
  generatedAt  DateTime
  contentFr    String
  contentEn    String
  isFinalized  Boolean  @default(false)
  editedBy     Int?
}
```

Migrate:

```bash
npx prisma migrate dev --name create_term_summary_drafts
npx prisma generate
```

#### 🟢 2. Implement summary assembly logic

Use server-side logic to:

- Fetch:

  - Covered outcomes
  - Linked artifacts with captions
  - FamilyComm entries (shared or marked relevant)
  - Vocabulary milestones

- Assemble coherent draft text using sentence templates and reusable blocks:

  - E.g., _“This term, Sam explored the theme of community through oral storytelling. He used key vocabulary such as ‘maison’, ‘école’, and ‘pompier’ in conversation.”_

#### 🟢 3. API Endpoints

- `POST /api/students/:id/summaries/generate?term=1`
- `GET /api/students/:id/summaries/:term`
- `PATCH /api/summaries/:id` (for edits)
- `POST /api/summaries/:id/export?format=pdf|md|txt`

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Term Summary Editor

Component: `TermSummaryEditor.tsx`

- Header: Student, term, status (draft/final)
- Tabs:

  - 🧾 Full draft
  - 🧱 Sections (editable blocks by domain: oral, writing, math, etc.)
  - 📚 Outcome alignment (read-only list)

- Each section:

  - Auto-generated text
  - Editable textarea (Fr & En side-by-side)
  - “Insert artifact” or “Insert quote” options

#### 🔵 5. Summary Export Panel

Component: `SummaryExportOptions.tsx`

Options:

- Format: PDF / Markdown / Plain Text
- Language: Fr / En / Bilingual (side-by-side or merged)
- Include sections: \[✓] Vocabulary | \[✓] Reflections | \[✓] Artifacts

Button: “📤 Download Summary”

---

### 🔗 INTEGRATION NOTES

- Use same term definitions as elsewhere in the planner
- Pull artifacts only if explicitly tagged to term or outcome
- Use standardized phrasing templates for initial drafts, e.g.:

  - _“In math, \[StudentFirstName] demonstrated understanding of \[OutcomeLabel] through…”_
  - _“Lors des activités de vocabulaire, il/elle a utilisé les mots suivants…”_

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Generate draft:**

```http
POST /api/students/12/summaries/generate?term=1
```

**Response:**

```json
{
  "summaryId": 44,
  "studentId": 12,
  "contentFr": "Ce trimestre, Alex a exploré le thème de l’hiver...",
  "contentEn": "This term, Alex explored the theme of winter..."
}
```

Rendered Output:

> **Term 1 Summary for Alex**
> ❄️ _Winter_, 🧠 _Descriptive Language_, 🧾 _CO.14, CO.22_
>
> - Used oral vocabulary such as _bonhomme_, _neige_, and _écharpe_
> - Demonstrated confidence in class storytelling
> - Shared family tradition in winter journal artifact
>   \[📄 Download PDF] \[✍️ Edit]

---

### 🚩 RISKS

- Avoid robotic or repetitive phrasing—use varied sentence starters and human tone
- Ensure sensitive data (e.g., behavior logs) isn’t included unless explicitly tagged
- Handle bilingual formatting cleanly (side-by-side or merged options)
