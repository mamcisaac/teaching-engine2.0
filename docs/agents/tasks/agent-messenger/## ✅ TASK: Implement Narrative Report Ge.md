## ✅ TASK: Implement Narrative Report Generator with AI Drafting Support

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **narrative reporting system** that synthesizes:

- Student artifacts (voice, work, media)
- Teacher observations and annotations
- Progress toward personal goals and outcomes
- Reflections and emotional tags

It generates **editable narrative reports** that feel human and individualized. The AI drafts serve as time-saving scaffolds, not final outputs.

---

### 🔹 GOAL

Enable teachers to:

- View a summary of evidence per student
- Generate an initial AI-written narrative
- Edit and finalize the narrative with inline annotations
- Export PDF reports per term, or preview in the family portal

---

### ✅ SUCCESS CRITERIA

- Narrative includes:

  - Introductory sentence(s)
  - Domain-specific observations (literacy, SEL, math…)
  - Growth evidence with tagged outcomes
  - Voice/choice emphasis (quotes or student reflections)
  - Optional closing comment to family

- Teacher can:

  - Regenerate, rephrase, or rewrite any section
  - Accept/modify AI suggestions
  - Flag or insert specific portfolio entries or reflections

---

### 🔧 BACKEND TASKS

#### 🟢 1. Student Report Summary API

```ts
GET /api/reports/summary?studentId=14&term=2
```

Returns:

```json
{
  "studentId": 14,
  "term": 2,
  "outcomeCoverage": [7, 8, 12],
  "goalProgress": [
    { "goal": "Ask questions clearly", "status": "progressing" }
  ],
  "portfolioQuotes": [
    "I was brave when I shared my story in French.",
    "Math is getting easier when I use blocks."
  ],
  "reflections": [...],
  "teacherNotes": [...],
  "emotionTags": ["😊", "😠"]
}
```

#### 🟢 2. AI Narrative Generator

```ts
POST /api/reports/generate
{
  "studentId": 14,
  "term": 2
}
```

Returns:

```json
{
  "intro": "In Term 2, Maya continued to grow as a confident communicator.",
  "literacy": "She used oral storytelling and visual prompts to express ideas in French.",
  "math": "Maya explored quantity and pattern using blocks and movement activities.",
  "SEL": "She showed resilience by continuing to participate even when unsure.",
  "voice": "“I was brave when I shared my story in French.”",
  "closing": "We are proud of her growth and look forward to continued success."
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Report Editor Interface

Component: `NarrativeReportEditor.tsx`

- For each student:

  - \[🧠 Generate Draft]
  - Inline editor per section:

    - \[♻️ Regenerate], \[✏️ Edit], \[💬 Insert Note]

  - Display portfolio snippets inline
  - \[📤 Export PDF] or \[🌐 Preview in Family Portal]

---

#### 🔵 4. Report Configuration Panel

Component: `NarrativeReportConfig.tsx`

- Toggle:

  - \[Include Goals] \[Include Outcomes] \[Include Quotes]
  - \[Domain sections: Literacy, Math, SEL…]

- Download or share settings:

  - \[Export as CSV] \[Batch PDF] \[Send to Principal]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `VoicePortfolioEntry`
  - `AssessmentOutcomeLink`
  - `StudentGoalLog`
  - `ReflectionResponse`

- Connects to:

  - `FamilyPortalView`
  - `ProgressReviewDashboard`
  - PDF Exporter or ShareLink module

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
POST /api/reports/generate?studentId=23&term=1
```

Returns:

```json
{
  "intro": "In her first term, Sophie settled well into the routines of Grade 1 French Immersion.",
  "math": "Sophie engaged with number games and manipulatives to build quantity sense.",
  "SEL": "She showed kindness and responsibility during transitions and partner work.",
  "voice": "“I liked building with my friends—it felt like solving a puzzle.”",
  "closing": "Thank you for your support at home. We look forward to continued growth."
}
```

---

### 🚩 RISKS

- AI-generated text may become repetitive or overly generic if data is sparse
- Must avoid hallucination of progress or tone
- Requires human review to ensure alignment with teacher voice and intent
- PDF export needs to support French accents and student names cleanly
