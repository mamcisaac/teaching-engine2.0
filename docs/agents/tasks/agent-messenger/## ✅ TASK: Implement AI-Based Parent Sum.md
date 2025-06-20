## ✅ TASK: Implement AI-Based Parent Summary Composer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a tool that enables teachers to **auto-generate professional, bilingual summaries** of a student’s progress, based on their outcomes, assessments, reflections, and artifacts. These summaries are used for parent communication (e.g., term reports, meetings, or weekly updates) and must be editable before use.

---

### 🔹 GOAL

Automatically generate **clear, humanlike summary paragraphs** describing what a student has been learning, how they’re progressing, and areas for growth—anchored to curriculum outcomes and evidence collected in the platform. Summaries should be available in both French and English.

---

### ✅ SUCCESS CRITERIA

- Teachers can select:

  - A student
  - A date range (e.g., Term 1)
  - Thematic focus or subjects (optional)

- The system generates:

  - A paragraph in **French**
  - A parallel paragraph in **English**
  - Referencing:

    - Outcomes addressed
    - Assessment patterns
    - Artifacts or observations (if available)

- Teachers can:

  - Edit both texts before saving
  - Export (PDF, Markdown, or HTML)
  - Copy or insert into a Parent Message or Report Card

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add endpoint to generate summary

Route: `POST /api/ai-parent-summary`

Input:

```json
{
  "studentId": 17,
  "from": "2026-09-01",
  "to": "2026-12-01",
  "focus": ["oral language", "literacy"]
}
```

Output:

```json
{
  "french": "Au cours de ce trimestre, Alex a participé activement...",
  "english": "This term, Alex engaged actively in oral storytelling..."
}
```

Source data should include:

- Activities with linked outcomes
- Assessments + scores
- Artifacts (titles only)
- Reflections linked to student (if any)

Use OpenAI-compatible prompt chaining to synthesize student-specific summaries.

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Summary Composer UI

Component: `ParentSummaryComposer.tsx`

Fields:

- Student selector
- Date range picker
- Focus areas (multi-select or smart chip input)
- Button: “🧠 Generate Summary”
- French and English editable textareas

Buttons:

- “✏️ Edit”
- “🗂️ Save to Student Profile”
- “📰 Insert into Newsletter”
- “📤 Export (PDF, HTML, Markdown)”

#### 🔵 3. Preview Component

Side-by-side view:

```markdown
🇫🇷 Alex a démontré une amélioration...
🇬🇧 Alex has shown improvement...
```

Optional:

- Show which outcomes/activities were referenced in generation (for transparency)

---

### 🔗 INTEGRATION NOTES

- Should reuse outcome labels in plain-language format (e.g., “Can describe characters in French stories”).
- Save generated summaries under student’s profile for reuse or printing.
- Support “regenerate” button with variation control (e.g., tone: formal/informal).

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Generate Summary:**

```http
POST /api/ai-parent-summary
{
  studentId: 17,
  from: "2026-09-01",
  to: "2026-11-30"
}
```

**Output:**

```json
{
  "french": "Au cours de ce trimestre, Alex a démontré une compréhension croissante des structures de phrases orales...",
  "english": "This term, Alex has demonstrated a growing understanding of oral sentence structures..."
}
```

---

### 🚩 RISKS

- Generated summaries must **not imply formal grades** unless assessments justify it.
- Keep tone warm, informative, and human—avoid robotic or evaluative phrasing.
- Make teacher approval required before any message is shared with families.
