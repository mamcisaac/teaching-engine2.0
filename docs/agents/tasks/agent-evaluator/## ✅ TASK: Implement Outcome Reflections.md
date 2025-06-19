## ✅ TASK: Implement Outcome Reflections Journal

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are designing a journaling system for teachers to **write short reflections** linked to curriculum outcomes, assessments, and thematic units. These reflections help teachers consolidate their instructional strategies, track anecdotal classroom insights, and support professional inquiry (e.g., identifying what worked, what needs re-teaching, how language development is progressing).

---

### 🔹 GOAL

Enable teachers to write, store, and review reflections tied to specific outcomes, themes, and assessment events. Reflections must be timestamped, editable, and viewable by outcome or term. The system should support fast retrieval and future integration with performance tracking or planning suggestions.

---

### ✅ SUCCESS CRITERIA

- Teachers can add reflections linked to:

  - One or more curriculum outcomes
  - A specific theme or assessment (optional)
  - A date or time period

- Journal entries are:

  - Editable
  - Private to user
  - Viewable by term, theme, or outcome

- Reflections can be exported or printed by outcome or theme
- Optionally, reflections surface in outcome dashboards

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `ReflectionJournalEntry` model

In `prisma/schema.prisma`:

```prisma
model ReflectionJournalEntry {
  id             Int       @id @default(autoincrement())
  userId         Int
  date           DateTime
  content        String
  outcomeIds     Int[]     @default([])
  themeId        Int?
  assessmentId   Int?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

Migrate:

```bash
npx prisma migrate dev --name add_reflection_journal
npx prisma generate
```

#### 🟢 2. Add API routes

- `POST /api/reflections`
- `GET /api/reflections?outcomeId?themeId?term?`
- `PATCH /api/reflections/:id`
- `DELETE /api/reflections/:id`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Reflection Editor

Component: `ReflectionEditor.tsx`

- Inputs:

  - Date (defaults to today)
  - Multiselect: Outcomes
  - Optional dropdowns: Theme, Assessment
  - Textarea for reflection notes (max \~1000 characters)

Auto-save on blur or submit.

#### 🔵 4. Outcome-Based Journal Viewer

Component: `OutcomeReflectionsView.tsx`

- For each outcome:

  - Display all reflections chronologically
  - Optional summary at top: count of reflections, most recent date
  - Buttons:

    - “📝 Add New Reflection”
    - “📤 Export Reflections (PDF)”

Group by:

- Outcome
- Theme
- Term (e.g., Sept–Nov)

#### 🔵 5. Dashboard Integration

In `OutcomeDashboard.tsx`:

- Sidebar: “🧠 Teacher Reflections”
- Show badge if any exist for that outcome
- Click → open `OutcomeReflectionsView` pre-filtered

---

### 🔗 INTEGRATION NOTES

- This is not visible to families or students.
- Does not affect outcome “completion” or mastery.
- Future: surface reflections as part of professional learning tools.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create Reflection:**

```http
POST /api/reflections
{
  userId: 42,
  date: "2026-03-01",
  content: "Many students struggled with sequencing events in French; I used puppets and gestures, which improved engagement.",
  outcomeIds: [21],
  themeId: 3,
  assessmentId: 12
}
```

**View Output:**

```markdown
🧠 Outcome CO.21: “Sequencing Events”
🗓️ Mar 1: “Many students struggled… puppets helped...”
```

---

### 🚩 RISKS

- Should not become burdensome; keep it fast and optional.
- Avoid mixing reflection with grading or assessment—this is formative insight only.
- Provide encouragement (e.g. prompts or templates) without requiring too much typing.
