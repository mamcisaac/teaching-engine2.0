## ✅ TASK: Implement Family Portal Preview

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **read-only family-facing dashboard** that shows:

- Weekly learning highlights
- Evidence of student participation (artifacts, photos, reflections)
- Outcome-linked summaries in accessible language
- Progress on goals
- Optional teacher notes for home support

This portal must protect student data, avoid jargon, and be accessible via a private login link or invitation code. Families see only their child’s data.

---

### 🔹 GOAL

Allow families to:

- View curated snapshots of what their child is learning
- See photos, work samples, and milestone comments
- Understand progress on goals and key curriculum areas
- Read optional teacher-supplied home notes
- Feel informed and connected—without logging into the teacher portal

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Choose what content appears for families
  - Attach optional notes to each learning week
  - Preview what a family will see

- Families can:

  - Log in securely (or use link/code)
  - View recent weeks, progress summaries, artifacts
  - Understand content without requiring curriculum knowledge

---

### 🔧 BACKEND TASKS

#### 🟢 1. Family View Model

```prisma
model FamilyViewEntry {
  id          Int       @id @default(autoincrement())
  studentId   Int
  week        Int
  term        Int
  curatedText String    // Teacher’s parent-facing summary
  artifacts   Int[]     // Artifact IDs
  goalNotes   String?
  homeSupport String?   // Optional tip or message
  published   Boolean   @default(false)
  createdAt   DateTime  @default(now())
}
```

#### 🟢 2. Secure Access Tokens

```prisma
model FamilyAccessToken {
  id          Int       @id @default(autoincrement())
  studentId   Int
  token       String    @unique
  expiresAt   DateTime
}
```

API endpoints:

- `GET /api/family/preview/:token` → returns curated data
- `POST /api/family/entry` → create/update by teacher
- `POST /api/family/send-token` → email/share access link

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Family Portal View

Component: `FamilyPreview.tsx`

- Sections per week:

  - 📅 Week and Term Label
  - 📝 “This week, your child…” (teacher-written summary)
  - 🖼️ Photo gallery or artifact list (click to enlarge)
  - 🎯 Goal snapshot (e.g., “Working on using kind words…”)
  - 🏠 At-home support tips (optional)

- Pagination or infinite scroll for weeks

---

#### 🔵 4. Teacher Preview and Publisher

Component: `FamilyViewEditor.tsx`

- Select a student and week
- Add:

  - Summary
  - Artifacts to include
  - Goal status (from Goal Tracker)
  - Home support note

- Toggle “Publish to Family View”
- Button: \[👁️ Preview] \[📤 Publish] \[🔗 Share Link]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - WeeklyPlanner summaries (optional)
  - Artifact metadata (title, thumbnail)
  - StudentGoal model
  - Teacher notes

- Must **sanitize language**: avoid outcome codes, abbreviations, overly technical terms

- Can eventually integrate with:

  - Term summaries
  - Translation support (future)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Teacher creates:**

```json
POST /api/family/entry
{
  "studentId": 14,
  "week": 6,
  "term": 2,
  "curatedText": "Eddie explored measurement in math and compared the length of different items using non-standard units.",
  "artifacts": [120, 122],
  "goalNotes": "He’s continuing to work on expressing ideas clearly during group work.",
  "homeSupport": "Ask your child to compare the length of two spoons using blocks!"
}
```

**Family view renders:**

> 📅 Week 6 — Term 2
> ✏️ Eddie explored measurement in math and compared the length of different items using non-standard units.
> 🖼️ \[Artifact thumbnails]
> 🎯 Working on: “Expressing ideas clearly during group work.”
> 🏠 Try this at home: “Ask your child to compare the length of two spoons using blocks!”

---

### 🚩 RISKS

- Teacher summary must be family-readable; consider using AI rewording assistance
- Access link must expire after set time to prevent misuse
- Over-sharing risks: teachers must control what gets shown
