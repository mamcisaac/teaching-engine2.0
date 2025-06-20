## ✅ TASK: Implement SPT Narrative Report Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **report-writing assistant** that helps teachers generate high-quality, structured narrative reports for SPT meetings. The system compiles learning evidence, intervention notes, and engagement logs into scaffolded sections, and optionally uses AI summarization to support drafting. Teachers can refine and export the final product for official documentation.

---

### 🔹 GOAL

Allow teachers to:

- Open an SPT narrative template for a selected student
- Autofill content from:

  - Goal logs
  - Reflections and observations
  - Reading fluency entries
  - Family contact logs

- View and edit each section before finalizing
- Export or attach to student file

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Launch a narrative template from a student's profile
  - See all linked observations, goals, and contact notes grouped by area of need
  - Edit or add commentary to each section
  - Save in editable draft form or export to PDF/Markdown
  - Track status (e.g., draft, submitted, archived)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Narrative Model

```prisma
model SPTNarrative {
  id          Int       @id @default(autoincrement())
  studentId   Int
  authorId    Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  status      String    // "draft", "finalized", "archived"
  sections    Json      // see below
}

type SPTSection = {
  area: string,
  summary: string,
  linkedEvidence: {
    type: "goal" | "observation" | "contact" | "fluency",
    date: string,
    content: string
  }[]
}
```

#### 🟢 2. API Endpoints

- `POST /api/spt-narratives` – create new
- `GET /api/spt-narratives/:studentId` – fetch current or past
- `PUT /api/spt-narratives/:id` – update
- `GET /api/spt-narratives/:id/export` – export to markdown/PDF

---

### 🎨 FRONTEND TASKS

#### 🔵 3. SPT Narrative Editor

Component: `SPTNarrativeEditor.tsx`

Tabs or collapsible sections for:

- 👁️ Observations
- 🎯 Goals + Progress
- 📚 Reading + Literacy
- 🏠 Family Communication
- 📈 Strategies Tried / Adjustments
- 🧭 Next Steps + Plan
- ✍️ Teacher Notes

Features:

- View linked evidence in context
- Text editor per section (rich text or Markdown)
- Button: \[🔁 Auto-Summarize Section] (uses AI summaries)
- Button: \[📤 Export Narrative]

---

#### 🔵 4. Status Tracker

Component: `NarrativeStatusBadge.tsx`

- Display current status (draft, finalized, archived)
- Allow teacher to update status manually

---

#### 🔵 5. Narrative Export Tool

Component: `NarrativeExportPanel.tsx`

- Options:

  - Format: Markdown | PDF
  - Include evidence footnotes or not
  - Version history: show edits over time (optional Phase 6)

---

### 🔗 INTEGRATION NOTES

- Pulls evidence from:

  - Reflections
  - GoalTracker
  - Reading Fluency Graphs
  - Family Engagement Dashboard

- Links to future SPT Meeting Log System (Phase 6)
- Auto-summarization calls AI summarization tool from previous task

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
POST /api/spt-narratives
```

Payload:

```json
{
  "studentId": 14,
  "sections": [
    {
      "area": "Oral Communication",
      "summary": "",
      "linkedEvidence": [
        {
          "type": "observation",
          "date": "2025-02-01",
          "content": "Eddie struggled to initiate group talk during partner work."
        },
        {
          "type": "goal",
          "date": "2025-02-12",
          "content": "Student goal: Speak clearly and confidently when sharing ideas."
        }
      ]
    }
  ]
}
```

Rendered Section in UI:

> **🧩 Oral Communication**
> 📅 _Feb 1_: Eddie struggled to initiate group talk during partner work.
> 🎯 _Feb 12_: Goal set: “Speak clearly and confidently when sharing ideas.”
> ✍️ \[Editable Summary Box]
> \[🔁 Auto-Summarize] \[📤 Export Section]

---

### 🚩 RISKS

- Sensitive language risks—ensure teacher always reviews and edits
- Data overload—collapse repeated evidence into patterns
- Export formatting must match institutional documentation standards
