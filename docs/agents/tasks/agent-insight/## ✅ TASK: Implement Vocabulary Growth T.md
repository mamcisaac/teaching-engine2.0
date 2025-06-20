## ✅ TASK: Implement Vocabulary Growth Tracker

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **vocabulary tracking module** that helps teachers log, monitor, and analyze the words and expressions introduced and practiced over time. This system is especially critical in Early French Immersion, where vocabulary exposure and reinforcement must be deliberate, thematic, and cumulative.

---

### 🔹 GOAL

Allow teachers to:

- Log key vocabulary introduced each week by domain, theme, and activity
- Track frequency of usage and reinforcement
- View which words have been underused or dropped
- Export vocabulary summaries for student portfolios, planning, or home support

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Add vocabulary entries per theme or activity
  - View term-by-term vocabulary growth per student and class
  - Filter by domain, theme, or word type (noun, verb, expression)
  - See frequency of vocabulary used in planning, artifacts, or observations
  - Export word lists and usage summaries

---

### 🔧 BACKEND TASKS

#### 🟢 1. VocabularyEntry Model

```prisma
model VocabularyEntry {
  id          Int      @id @default(autoincrement())
  word        String
  language    String   // "fr" or "en"
  themeId     Int?
  domain      String
  week        Int
  type        String   // "noun", "verb", "expression", "connector"
  activities  Int[]    // planner IDs
  artifactIds Int[]    // optional link to student work
  createdAt   DateTime @default(now())
}
```

#### 🟢 2. Usage Log Model

```prisma
model VocabularyUsage {
  id           Int      @id @default(autoincrement())
  vocabId      Int
  sourceType   String   // "Artifact" | "Planner" | "Reflection"
  studentId    Int?
  date         DateTime
  frequency    Int
  notes        String?
}
```

#### 🟢 3. API Endpoints

- `POST /api/vocabulary` – add vocab word
- `GET /api/vocabulary?theme=Community&domain=oral`
- `POST /api/vocabulary/log-usage`
- `GET /api/vocabulary/usage-summary?student=14&term=Term2`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Vocabulary Dashboard

Component: `VocabularyTracker.tsx`

Table/List View:

- 🗣️ Word
- 📚 Domain
- 🎨 Theme
- 🕓 Week Introduced
- 🔄 Usage Frequency
- 🧠 Type: noun/verb/expression

Filters:

- Theme, Domain, Term, Word Type

\[➕ Add New Word] \[📤 Export List]

#### 🔵 4. Word Entry Form

Component: `VocabularyEntryForm.tsx`

Fields:

- Word (in French or English)
- Theme
- Domain
- Word type
- Optional: connect to weekly planner activity

#### 🔵 5. Vocabulary Heatmap

Component: `VocabularyHeatmap.tsx`

Grid:

- Rows: Vocabulary
- Columns: Weeks or Themes
- Cells: Frequency of use (color-coded)
- Tooltip → Source list: “Used in Artifact: ‘Community Letter’”

#### 🔵 6. Export Tools

Component: `VocabularyExportPanel.tsx`

Export options:

- CSV / Markdown / PDF
- Per class, per student
- Filters: domain, week, type
- Option: printable vocabulary cards for take-home folders

---

### 🔗 INTEGRATION NOTES

- Words used in student **artifacts** or **reflections** increment frequency score
- Suggest missing vocabulary for upcoming themes in Planner
- Future: AI auto-extraction from reflections (e.g., identify new words student used independently)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add Word:**

```http
POST /api/vocabulary
{
  word: "les pompiers",
  language: "fr",
  domain: "oral",
  themeId: 5,
  type: "noun",
  week: 6
}
```

**Log Usage:**

```http
POST /api/vocabulary/log-usage
{
  vocabId: 22,
  sourceType: "Artifact",
  studentId: 14,
  date: "2025-03-18",
  frequency: 3,
  notes: "Used orally in peer roleplay"
}
```

Rendered View:

> 🗣️ **les pompiers**
> Domain: Oral | Theme: Community | Week: 6
> Usage: 12x across 5 students
> Used in: “Firefighter Visit Reflection”, “Community Skit”

---

### 🚩 RISKS

- Requires regular entry to be useful—needs tight integration with Planner
- Autodetection of vocab in reflections is a complex NLP task (phase 2)
- Must distinguish exposure vs mastery (consider confidence markers later)
