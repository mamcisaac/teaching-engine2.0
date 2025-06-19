## ✅ TASK: Implement SPT Support Export System

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an export tool that compiles a comprehensive, yet concise, **SPT meeting report** for any student flagged for support. It draws from goals, daily observations, reflections, outcome data, and relevant communication logs to create a term-based summary for intervention planning and record-keeping.

---

### 🔹 GOAL

Allow teachers to:

- Mark students for SPT attention
- Generate an exportable summary document for each student
- Include structured observations, goal status, outcome status, communication, and work samples
- Export to PDF or Markdown for SPT files

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Flag students for SPT follow-up
  - Select a student and generate a complete SPT report
  - View and edit the generated summary before export
  - Export as PDF (preferred), Markdown, or CSV (fallback)
  - Archive past SPT reports by term

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `sptFlag` to `Student` model

```prisma
model Student {
  ...
  sptFlag     Boolean @default(false)
}
```

#### 🟢 2. Create `SPTReport` model

```prisma
model SPTReport {
  id         Int      @id @default(autoincrement())
  studentId  Int
  term       String
  generatedBy Int
  content    String   // Markdown or HTML
  createdAt  DateTime @default(now())
}
```

#### 🟢 3. Report Generation API

```ts
POST /api/spt/export
{
  studentId: 14,
  term: "Term 2"
}
```

Server gathers:

- Active and completed **Student Goals**
- Tagged **Observations**
- Any linked **Artifacts** or **Reflections**
- **Outcome progress** from Matrix (summary only)
- **Family Communications** with “support” tag

Returns:

```json
{
  "content": "## SPT Report – Alex – Term 2\n\n### Goals\n- Use calming strategy before math…"
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Flag Student for SPT

- Add toggle in `StudentProfile.tsx`:

  > \[🟢 Flag for SPT Meeting]

- Flagged students appear in dashboard section:

  > “📋 SPT: 4 Students Flagged”

#### 🔵 5. SPT Export Panel

Component: `SPTReportPanel.tsx`

Inputs:

- Select student (only flagged)
- Select term
- \[🧠 Generate Draft]

Output:

- WYSIWYG or markdown editor of full report
- Sections:

  - Goals + Status
  - Observations timeline
  - Curriculum summary (1–2 paragraphs max)
  - Work sample descriptions or artifact links
  - Family communication summary (if tagged)

Buttons:

- \[✅ Finalize & Archive]
- \[📤 Export PDF / Markdown]

#### 🔵 6. Archived Report Viewer

Component: `SPTHistoryTab.tsx`

- For each past report:

  - Date
  - Summary preview
  - \[📖 View]
  - \[📄 Export Again]

---

### 🔗 INTEGRATION NOTES

- Family messages must support a tag system (“support”, “attendance”, “SPT”)
- All evidence tagged to SPT-linked goals is prioritized in the report
- Outcome Matrix should export a sentence like:

  > “Of 14 reading outcomes this term, 9 were completed; 3 are in progress.”

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Generate Report:**

```http
POST /api/spt/export
{
  studentId: 14,
  term: "Term 2"
}
```

Returns:

```json
{
  "content": "## SPT Report – Alex – Term 2\n\n### Goals\n- Use calming strategy before math…\n### Observations\n- Feb 3: Used visual prompt…"
}
```

Rendered Preview:

> 📋 **SPT Report – Alex – Term 2** > **Goals**
>
> 1. Calming strategy → In progress
>    **Observations**
>
> - Feb 3: Used visual prompt with minor hesitation
> - Feb 10: Successfully initiated breathing independently
>   **Curriculum Summary**
>   Reading outcomes: 9/14 complete
>   **Work Samples**
> - Paired writing sample (Winter theme)
>   \[📤 Export PDF]

---

### 🚩 RISKS

- Risk of sensitive content exposure—ensure access is scoped
- Avoid excessive verbosity—output must fit SPT time constraints
- Family data must be sanitized and tagged before inclusion
