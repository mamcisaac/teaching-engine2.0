## ✅ TASK: Implement Reflections-to-Report Flow Enhancer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a system to **connect teacher-written reflections** (e.g., Daily Evidence, Artifacts, Goal Observations) to the **term-end reporting process**. The system extracts tagged snippets, links them to outcomes and domains, and supports teachers in compiling personalized, rich report content that reflects the child’s learning journey.

---

### 🔹 GOAL

Allow teachers to:

- Reuse documented reflections, observations, and quick entries in student report comments
- Filter and select excerpts by outcome, domain, or theme
- Auto-generate draft reports using accumulated content
- Manually edit drafts before finalization and export

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Open a student's report draft
  - See suggested content drawn from reflections
  - Accept, reject, or edit suggested content
  - Finalize and export personalized narrative reports
  - Save draft comments per domain and outcome

---

### 🔧 BACKEND TASKS

#### 🟢 1. Link All Reflections to Outcomes and Domains

Ensure every reflection/log/artifact entry includes:

- `studentIds`
- `domain`
- `outcomeIds`
- `createdAt`
- `notes` (markdown)

Normalize a `ReflectionSnippet` structure:

```ts
{
  id: "entry_id",
  sourceType: "DailyEvidence" | "Artifact" | "GoalObservation",
  studentId: 14,
  domain: "reading",
  outcomeIds: [12],
  content: "Alex demonstrated confidence when reading aloud during our poetry circle...",
  date: "2025-04-02"
}
```

#### 🟢 2. Reporting Snippet Service

Create a backend endpoint:

```ts
GET /api/report-snippets?student=14&domain=reading&term=Term2
```

Returns an array of tagged snippet objects from that term, filtered by outcome/domain.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Report Comment Composer

Component: `ReportComposer.tsx`

For each domain:

- \[📜 Draft Comment Area] (markdown)
- \[🧠 Suggested Reflections Panel] – shows snippets

  > 🗓️ Apr 2 – “Alex demonstrated confidence when reading aloud...”
  > \[➕ Add to Draft] \[🗑️ Ignore] \[📝 Edit First]

Features:

- Auto-save in progress
- Snippet search bar: filter by keyword or outcome
- Character/word count limit

#### 🔵 4. Auto-Generate Drafts

Button: \[✨ Auto-Fill Drafts From Reflections]

- For each student:

  - Uses most relevant/frequent reflection per domain
  - Builds a 2–4 sentence initial draft per subject
  - Prompts user to review and edit before locking

#### 🔵 5. Export Support

Allow:

- Preview full student report
- Export: PDF, CSV, Markdown
- Include both domain comments and optional overall summary

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - DailyEvidenceLog
  - StudentGoals + GoalObservations
  - Artifacts (if student-linked)

- Snippet filtering uses:

  - Term (e.g., “Term 2”)
  - Domain (e.g., “math”)
  - Outcome ID

Future upgrade:

- Use LLM summarization to auto-consolidate multiple entries per outcome

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/report-snippets?student=14&domain=writing&term=Term2
```

Returns:

```json
[
  {
    "content": "Emma independently composed a thank-you note using new vocabulary from our spring unit...",
    "outcomeIds": [32],
    "date": "2025-04-03"
  }
]
```

Rendered in Composer:

> ✍️ **Suggested Reflection (Apr 3)**
> “Emma independently composed a thank-you note...”
> \[➕ Add to Draft] \[📝 Edit] \[🗑️ Ignore]

---

### 🚩 RISKS

- Overreliance on AI-generated text may miss nuance—teachers must review
- Snippet quality depends on consistent tagging of evidence
- Must respect per-domain comment length limits (some boards have strict character caps)
