## ✅ TASK: Implement Daily Evidence Quick Entry Tool

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **fast-entry panel** for teachers to log multiple pieces of evidence each day, across students and domains. Each entry is tagged with outcomes, domains, and students, and automatically linked to the current date and term. This tool supports documentation during busy teaching days, and anchors future planning, comments, and reporting.

---

### 🔹 GOAL

Allow teachers to:

- Quickly record learning evidence (1–3 sentences) for one or more students
- Tag each entry with domain(s), outcome(s), and optional activity/theme
- View a list of recent entries (chronological or filterable)
- Use voice-to-text input and Markdown formatting
- Export all entries by term, domain, or student

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Open a daily entry panel from the dashboard or planner
  - Log entries within seconds:

    - Text, students, domain, outcomes

  - View today's entries at a glance
  - Filter by domain, outcome, student
  - Export to PDF or CSV for documentation or sharing

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `QuickEvidenceLog` model

```prisma
model QuickEvidenceLog {
  id          Int      @id @default(autoincrement())
  authorId    Int
  studentIds  Int[]
  date        DateTime @default(now())
  domain      String
  outcomeIds  Int[]
  notes       String   // Markdown
  themeId     Int?
  activityId  Int?
  createdAt   DateTime @default(now())
}
```

#### 🟢 2. API Endpoints

- `POST /api/evidence-log`
- `GET /api/evidence-log?date=...&filters=...`
- `PATCH /api/evidence-log/:id`
- `POST /api/evidence-log/export?filters=...`

Support query filters:

- Student
- Domain
- Outcome
- Date range

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Entry Panel

Component: `DailyEvidencePanel.tsx`

- Sticky quick-entry form:

  - \[🧠 Observation Text] (markdown / voice-to-text)
  - \[👥 Students] (multi-select)
  - \[📚 Outcomes] (multi-select)
  - \[🧭 Domain]
  - \[🧩 Theme / Activity] (optional)
  - \[✅ Save]

Keyboard-friendly and optimized for mobile/tablet use.

#### 🔵 4. Entry Log Display

Component: `EvidenceLogList.tsx`

- View all entries for today
- Filters:

  - Domain
  - Student
  - Outcome
  - Date

- Render each as:

  > 🗓️ \[Time] | 📚 Writing | 👥 Alex, Emma
  > “Wrote a shared recount using transition words...”
  > \[🧾 View] \[📝 Edit] \[📤 Export]

#### 🔵 5. Export Utility

Component: `EvidenceExportModal.tsx`

- Select:

  - Date range
  - Students
  - Domain / Outcome

- Format:

  - PDF
  - CSV
  - Markdown

- Include outcome and theme tags

---

### 🔗 INTEGRATION NOTES

- Entries should appear in:

  - Student Dashboard → Reflections
  - Report Generator (as source text)
  - Outcome Matrix (via hover details)

- Planner activities can suggest “Add quick evidence” links post-lesson
- Tagging interface should mirror that of Artifact and Reflection forms

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add entry:**

```http
POST /api/evidence-log
{
  studentIds: [14, 17],
  domain: "writing",
  outcomeIds: [22, 25],
  notes: "Students co-wrote a winter safety poem using 3 new vocabulary words.",
  themeId: 2
}
```

Rendered Entry:

> 🗓️ Feb 14 – 📚 Writing – 👥 Alex, Emma
> “Students co-wrote a winter safety poem using 3 new vocabulary words.”
> Outcomes: CO.22, CO.25
> \[📎 View Linked Theme: Winter Safety]

---

### 🚩 RISKS

- Must be fast enough to use during live instruction—optimize form UX
- Teachers may skip outcome tagging unless made effortless (autocomplete)
- Voice-to-text may introduce transcription errors—include quick edit shortcut
