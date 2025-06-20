## ✅ TASK: Implement Family Engagement Portal with Weekly Summaries

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **family-facing portal** that shows curated snapshots of a student’s week:

- Voice artifacts (photos, quotes, short videos)
- Reflections and classroom moments
- Progress on personal goals
- Optional teacher message or outcome summary

All content must be **teacher-controlled**: nothing is auto-published without explicit approval. The portal supports trust, transparency, and partnership with families.

---

### 🔹 GOAL

Allow families to:

- View personalized, timely updates each week
- Hear and see student learning in their own words
- Understand what’s being learned and practiced
- See continuity across terms

---

### ✅ SUCCESS CRITERIA

- Teacher can:

  - Select artifacts and reflections for sharing
  - Add weekly summary message
  - Preview before publishing

- Families can:

  - View secure student page
  - Browse by week, term, domain
  - Receive notifications of new posts

- Portal supports:

  - French/English toggle
  - Mobile-friendly responsive layout
  - PDF download per term (if enabled)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Family Portal Entry Model

```prisma
model FamilyViewEntry {
  id         Int      @id @default(autoincrement())
  studentId  Int
  week       Int
  term       Int
  title      String
  message    String
  artifactIds Int[]    // links to VoicePortfolioEntry, ArtifactUpload
  goalIds    Int[]     // StudentGoal references
  isPublished Boolean  @default(false)
  createdAt  DateTime  @default(now())
}
```

#### 🟢 2. Family Portal API

```ts
GET /api/family/entry?studentId=14&week=6
```

Returns:

```json
{
  "title": "Week 6 Highlights",
  "message": "This week, Maya practiced storytelling with images and built a garden using recycled materials.",
  "artifacts": [...],
  "goals": [...]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Teacher Portal Composer

Component: `FamilyEntryComposer.tsx`

- Timeline selector (Term 1, Week 6…)
- Select:

  - \[📷 Artifacts] \[🗣️ Quotes] \[🎯 Goals]

- Add:

  - \[📝 Weekly Message] \[🌐 Language Toggle]

- Buttons:

  - \[👁️ Preview] \[📤 Publish to Portal] \[📄 Export PDF]

---

#### 🔵 4. Family Portal View

Component: `FamilyStudentView.tsx`

- Timeline of weekly entries
- Content blocks:

  - “This Week’s Message”
  - Voice quotes and captions
  - Photo/video carousel
  - Goal progress summary

- Export options:

  - \[⬇️ Download as PDF] \[🖨️ Print]

- Language toggle: \[🇬🇧 English] / \[🇫🇷 Français]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `ArtifactUpload`, `VoicePortfolioEntry`
  - `StudentGoal` progress API
  - Optional: `WeeklyPlanner` → show “focus outcome” if available

- Connects to:

  - `NarrativeReportGenerator` (to reuse wording)
  - `FamilyAccessControl` (login system)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/family/entry?studentId=9&week=5
```

Returns:

```json
{
  "title": "Week 5 Recap",
  "message": "Eddie worked on number stories and practiced asking questions in French.",
  "artifacts": [
    { "type": "photo", "caption": "Math blocks", "url": "..." },
    { "type": "voice", "quote": "I asked Monkey for help!" }
  ],
  "goals": [{ "goal": "Ask questions clearly", "status": "progressing" }]
}
```

---

### 🚩 RISKS

- Must prevent accidental publication (explicit publish step required)
- Needs secure student/family access (no global links)
- Translation toggle must preserve formatting
- Risk of teacher overload if too much is manual; consider auto-draft with human approval
