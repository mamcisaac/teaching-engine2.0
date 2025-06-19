## ✅ TASK: Implement Student Profile Dashboard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are creating a dashboard that enables teachers to access a **holistic view of a single student’s learning journey**. It should consolidate outcomes addressed, assessments logged, reflections tagged, and artifacts submitted for that student—while remaining private, respectful, and easy to navigate.

---

### 🔹 GOAL

Enable teachers to view a per-student dashboard that shows:

- Progress across curriculum outcomes
- Assessment history
- Visual artifacts (drawings, writing samples, recordings)
- Observational notes or tagged reflections
- Thematic engagement (what units the student participated in)

---

### ✅ SUCCESS CRITERIA

- Teachers can open a dashboard for each student
- Each dashboard shows:

  - Outcomes covered (with summary stats and last activity)
  - Assessments (scores, notes)
  - Media artifacts (images, PDFs, audio clips)
  - Reflections tagged with that student

- Quick navigation to:

  - Timeline view
  - Weekly snapshots
  - Print/export profile (for SPTs or reporting)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `StudentArtifact` model

In `prisma/schema.prisma`:

```prisma
model StudentArtifact {
  id         Int      @id @default(autoincrement())
  studentId  Int
  title      String
  filePath   String
  type       String   // "image", "audio", "video", "pdf"
  date       DateTime
  notes      String?
  outcomeIds Int[]    @default([])
  createdAt  DateTime @default(now())
}
```

Also ensure:

- `AssessmentResult.studentId` (if individualized)
- `ReflectionJournalEntry` can be optionally tagged with `studentId`

Migrate:

```bash
npx prisma migrate dev --name add_student_dashboard_tables
npx prisma generate
```

#### 🟢 2. Add API routes

- `GET /api/students/:id/profile`
- `POST /api/students/:id/artifacts`
- `GET /api/students/:id/artifacts`
- Optional: `GET /api/students/:id/outcome-summary`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Profile Dashboard View

Component: `StudentProfileDashboard.tsx`

Tabs or sections:

- 📊 **Outcome Summary**

  - Table of outcomes with coverage %, last activity date
  - Option to filter by subject/domain

- 🧠 **Assessments**

  - Chronological list with type, date, score, notes

- 🖼️ **Artifacts**

  - Thumbnails or file icons
  - Upload new (teacher-only)

- 📓 **Reflections**

  - Show teacher reflections that mention this student

- 📅 **Timeline View**

  - Reuse from previous foundational task, filtered to this student

#### 🔵 4. Artifact Upload Modal

Component: `UploadStudentArtifactModal.tsx`

Fields:

- Title
- File upload (with preview)
- Linked outcomes
- Date
- Optional notes

Render with preview and edit/delete buttons.

#### 🔵 5. Navigation Links

- From class list: button “👤 View Profile”
- From assessment result logging: dropdown to tag a student
- From artifact manager: filter by student

---

### 🔗 INTEGRATION NOTES

- Artifacts are visible only to the teacher; this is not a student-facing portfolio (yet).
- All outcome links must sync with the curriculum map.
- Optional future integration with SPT report generator or parent updates.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Upload Artifact:**

```http
POST /api/students/17/artifacts
{
  title: "Winter Scene Drawing",
  filePath: "/uploads/students/17/winter-scene.jpg",
  type: "image",
  date: "2026-01-18",
  outcomeIds: [11, 14],
  notes: "Strong oral language scaffolded from visual storytelling."
}
```

**Rendered View:**

> 🖼️ _Winter Scene Drawing_ — Jan 18
> Outcomes: Oral narrative, Vocabulary development

---

### 🚩 RISKS

- Avoid overwhelming teachers with too many fields—uploading an artifact must take <1 minute.
- Don’t misrepresent progress—artifacts ≠ mastery.
- Ensure no sensitive data leaks between students.
