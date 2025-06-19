## ✅ TASK: Implement Teacher Reflection Logbook

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are designing a reflection system that helps teachers document professional observations, reflections on student learning, classroom dynamics, and emerging needs—on the fly or at the end of a day/week. These logs are optionally tagged, linked to students or outcomes, and exportable for use in term summaries, SPT discussions, or personal growth portfolios.

---

### 🔹 GOAL

Allow teachers to:

- Log open-form reflections as needed
- Tag entries with themes, domains, or student names
- Optionally link entries to outcomes or goals
- Mark entries for inclusion in summaries, reports, or SPT files
- Browse, search, and filter past reflections
- Export by date range, tag, or student

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Quickly add and tag a new reflection
  - Filter by date, theme, domain, or student
  - Mark entries as relevant to:

    - 📈 Progress reports
    - 🧠 SPT discussions
    - 📖 Professional reflection (private)

  - Export entries in bulk

- Logs are timestamped and searchable
- Reflections can optionally:

  - Link to activities
  - Reference students or outcomes
  - Include bilingual notes (Fr/En)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `TeacherReflection` model

```prisma
model TeacherReflection {
  id              Int      @id @default(autoincrement())
  teacherId       Int
  contentFr       String?
  contentEn       String?
  studentIds      Int[]    // Optional
  outcomeIds      Int[]    // Optional
  themeId         Int?     // Optional
  domain          String?  // e.g., oral, math, behavior
  tags            String[]
  isForReport     Boolean  @default(false)
  isForSPT        Boolean  @default(false)
  isPrivate       Boolean  @default(true)
  createdAt       DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name add_teacher_reflections
npx prisma generate
```

#### 🟢 2. API Endpoints

- `POST /api/reflections`
- `GET /api/reflections?filters=...`
- `PATCH /api/reflections/:id`
- `POST /api/reflections/export`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Reflection Entry Form

Component: `ReflectionEntryForm.tsx`

Inputs:

- \[📝 Textarea FR] \[📝 Textarea EN]
- \[📅 Date override (optional)]
- \[👤 Student selector (multi)]
- \[📚 Outcome selector (multi)]
- \[🏷️ Tags input] (chips)
- \[📦 Mark for: Report | SPT | Private use]
- Submit & Clear buttons

UI emphasis: fast and frictionless entry

#### 🔵 4. Reflection Logbook Browser

Component: `ReflectionLogbook.tsx`

- Filters:

  - Date range
  - Domain or tag
  - Student
  - SPT / Report flags

- List view with:

  - Truncated preview
  - Icons for status
  - Edit / delete / mark

#### 🔵 5. Export Modal

Component: `ReflectionExportModal.tsx`

Options:

- Date range
- Include Fr / En / both
- Export format: Markdown / PDF / CSV
- Filters: student, SPT flag, domain

Export button: \[📤 Download Export]

---

### 🔗 INTEGRATION NOTES

- When writing term summaries or generating SPT exports, include flagged reflections
- Private reflections are only visible to the author, even in shared classes
- Suggest tags or domains based on planner context (e.g., “patterning”, “routine transitions”)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add a reflection:**

```http
POST /api/reflections
{
  contentFr: "Observation: Il avait de la difficulté à se concentrer après le dîner.",
  studentIds: [12],
  tags: ["attention", "behavior", "afternoon"],
  isForSPT: true
}
```

Rendered Log Entry:

> 🧠 _March 4, 2025_ | **SPT-Flagged**
> “Il avait de la difficulté à se concentrer après le dîner.”
> 🏷️ Tags: attention, behavior, afternoon
> 👤 Student: Alex

---

### 🚩 RISKS

- Teachers may avoid using the tool if it feels too formal—keep entry friction low
- Must distinguish between private and shared reflections clearly
- Require consistent tag handling to ensure filters and search work properly
