## ✅ TASK: Implement Report Comment Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **comment generation engine** that assists teachers in writing narrative report card comments. It pulls from curated reflections, outcome progress, family communications, and vocabulary logs to generate personalized, structured paragraphs aligned with school policies. Teachers retain full control to review, revise, and finalize each comment.

---

### 🔹 GOAL

Allow teachers to:

- Automatically draft personalized comments for any student
- Draw from structured sources (e.g., reflections, vocabulary, artifacts)
- Organize comments by subject or domain
- Choose from tone templates (formal, warm, growth-oriented)
- Edit and save final text for each student and term

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Click a “Generate Comments” button on a student profile or planner
  - Select tone, term, and subject focus (e.g., “Oral Language – Term 2”)
  - View a generated draft comment with labeled sections
  - Edit directly in a WYSIWYG or markdown field
  - Save or export all finalized comments for a class

---

### 🔧 BACKEND TASKS

#### 🟢 1. Define `ReportCommentDraft` model

```prisma
model ReportCommentDraft {
  id         Int      @id @default(autoincrement())
  studentId  Int
  term       String   // e.g., "Term 2"
  domain     String   // e.g., "Oral Language"
  tone       String   // "Formal", "Warm", "Growth-Oriented"
  draftText  String
  editedText String?
  createdBy  Int
  createdAt  DateTime @default(now())
}
```

#### 🟢 2. AI-Driven Draft Endpoint

```ts
POST /api/comments/generate
Body:
{
  studentId: 14,
  term: "Term 2",
  domain: "oral",
  tone: "Warm"
}
```

This endpoint:

- Pulls reflections, family notes, matrix status, vocab logs
- Synthesizes into a markdown string with 1–3 paragraphs
- Includes sentence scaffolding, varied sentence openers

Example:

```md
Alex consistently engages in oral language activities with enthusiasm. This term, he has shown growth in expressing complete ideas and using domain-specific vocabulary.  
One area for continued development is turn-taking during group discussions, which will be supported through structured partner tasks next term.
```

#### 🟢 3. Save/Update/Export Endpoints

- `POST /api/comments/:id/save-edits`
- `GET /api/comments/export?term=2` → PDF / CSV / Markdown

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Comment Editor Panel

Component: `CommentGenerator.tsx`

- Dropdowns:

  - Student
  - Term
  - Domain
  - Tone

- \[⚙️ Generate] button
- Output:

  - Markdown/HTML editor
  - Auto-save edits
  - Labelled segments (introduction, strengths, next steps)

- \[📤 Export All Comments] button

#### 🔵 5. Bulk Overview Table

Component: `CommentDashboard.tsx`

- View all students by term
- Status column: “Drafted,” “Edited,” “Pending”
- Buttons:

  - \[🖋 Edit]
  - \[🧠 Regenerate]
  - \[📎 View Sources] (reflections, outcomes, etc.)
  - \[✅ Mark Final]

#### 🔵 6. Integration with Student Dashboard

- Tab: “Report Comments”
- Load domain-wise drafts per term
- Surface related reflection quotes and vocabulary progress nearby

---

### 🔗 INTEGRATION NOTES

- Pull in:

  - Reflections (with timestamps and tags)
  - Outcome mastery flags from Outcome Matrix
  - Family log summaries if tagged as “celebration”
  - Vocabulary log stats

- Support tone blending (e.g., warm + formal)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Generate Comment:**

```http
POST /api/comments/generate
{
  studentId: 14,
  term: "Term 2",
  domain: "oral",
  tone: "Warm"
}
```

Returns:

```json
{
  "draftText": "Alex consistently demonstrates enthusiasm in oral discussions..."
}
```

Rendered Editor:

> ✍️ **Alex – Oral Language – Term 2**
> “Alex consistently demonstrates enthusiasm in oral discussions. He uses increasingly precise vocabulary and engages in active listening…”
> \[🖋 Edit] \[✅ Finalize] \[📤 Export]

---

### 🚩 RISKS

- Over-reliance: Ensure comments don’t sound templated or generic
- Privacy: Don’t leak sensitive family data into drafts
- Tone balance: Comments must meet board expectations for tone and evidence
