## ✅ TASK: Implement AI-Assisted Summarization Tools

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **summarization pipeline** that takes raw learning data (reflections, planner activities, artifacts, goal logs) and produces coherent, outcome-linked summaries for professional and family-facing contexts. Teachers will initiate the summary generation process with scope and tone preferences and receive editable drafts they can accept or refine.

---

### 🔹 GOAL

Allow teachers to:

- Select a scope (student + term or date range)
- Choose tone (formal, narrative, plain)
- Generate auto-summarized text aligned to:

  - Domains
  - Outcomes
  - Evidence

- Edit and finalize the draft
- Export or insert into SPTs, report cards, or family updates

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Select student + date range (e.g., “Term 2”)
  - Choose tone (dropdown: “Formal,” “Narrative,” “Plain”)
  - Click \[Generate Summary] to produce multi-paragraph summary
  - View and edit each paragraph by domain/outcome
  - Export to Markdown or paste into SPT/Report Card builder

---

### 🔧 BACKEND TASKS

#### 🟢 1. Summary Builder API

```ts
POST / api / summarize - learning;
```

Input:

```json
{
  "studentId": 14,
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "tone": "formal"
}
```

Response:

```json
{
  "summary": [
    {
      "domain": "oral",
      "outcome": 12,
      "text": "Eddie confidently shares his ideas in structured roleplay activities. He uses relevant vocabulary and builds on peer contributions with ease."
    },
    {
      "domain": "writing",
      "outcome": 18,
      "text": "Eddie is beginning to organize his ideas independently in short texts. He uses sight words and phonetic spelling to convey meaning clearly."
    }
  ]
}
```

Generation logic:

- Filter relevant entries (reflections, artifacts, goals, activities)
- Extract representative phrases
- Use outcome statements to scaffold paragraph structure
- Tune language to selected tone

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Summary Builder Panel

Component: `LearningSummaryBuilder.tsx`

Fields:

- 👤 Student selector
- 📆 Term selector (or date range)
- 🎨 Tone dropdown
- 🔘 \[Generate Summary] button

Display:

- Accordion by domain
- Paragraphs auto-filled with editable `<textarea>`
- Buttons: \[✏️ Edit] \[🔁 Regenerate Domain] \[📤 Export All]

---

### 🔵 3. Tone Options and Language Templates

Available tone modes:

- **Formal**: “Eddie demonstrates…”
- **Narrative**: “This term, Eddie showed growth in…”
- **Plain**: “Eddie can now…”

Internal prompt scaffolds vary by tone.

---

### 🔵 4. Export Utility

Component: `SummaryExportPanel.tsx`

Options:

- Export:

  - Entire summary
  - Selected domains only

- Format:

  - Markdown
  - PDF
  - Copy to Clipboard

- Insert directly into SPT/Report Card builder if integrated

---

### 🔗 INTEGRATION NOTES

- Pulls data from:

  - Reflections
  - Planner entries
  - Goal milestones
  - Artifact logs

- Reuses domain/outcome metadata from curriculum database
- Will integrate directly into SPT narrative builder in Phase 5

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Input:

```json
{
  "studentId": 14,
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "tone": "narrative"
}
```

Output:

```json
{
  "summary": [
    {
      "domain": "oral",
      "text": "This term, Eddie showed increasing confidence in sharing ideas with the group. During the community unit, he roleplayed emergency helpers and explained their roles clearly."
    }
  ]
}
```

Rendered Summary:

> **🧩 Oral Communication**
> This term, Eddie showed increasing confidence in sharing ideas with the group. During the community unit, he roleplayed emergency helpers and explained their roles clearly.
> \[✏️ Edit] \[🔁 Regenerate] \[📤 Export]

---

### 🚩 RISKS

- Summaries may omit subtle but meaningful detail—keep teacher in control
- Language models might overstate performance—include teacher disclaimers
- Sensitive phrasing for areas of need must be edited manually
