## ✅ TASK: Implement Vocabulary Growth Dashboard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a vocabulary tracking system that records which words each student has been exposed to, practiced, and used independently—especially during thematic units. This dashboard will support teachers in monitoring expressive language development and planning next steps in vocabulary instruction.

---

### 🔹 GOAL

Allow teachers to:

- Log and view vocabulary taught per theme, week, or activity
- Track which students have used which words (individually or in groups)
- Visualize vocabulary coverage and depth over time
- Export individual vocabulary logs for reflection or reporting

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - See a list of vocabulary introduced per theme or date
  - Mark students’ usage level per word (e.g., “Exposed”, “Practiced”, “Used Independently”)
  - Filter by term, theme, or student
  - Export individual or class-level word logs

- Dashboard displays:

  - Growth over time (e.g., “Word bank size this term”)
  - Frequency of use
  - Areas of strength (oral vs. written usage)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `VocabularyWord` and `VocabularyUsage` models

```prisma
model VocabularyWord {
  id         Int      @id @default(autoincrement())
  wordFr     String
  wordEn     String
  themeId    Int?
  term       String
  createdAt  DateTime @default(now())
}

model VocabularyUsage {
  id         Int      @id @default(autoincrement())
  wordId     Int
  studentId  Int
  usageLevel String   // "Exposed", "Practiced", "Independent"
  observedAt DateTime
  observerId Int
}
```

Migrate:

```bash
npx prisma migrate dev --name create_vocabulary_tracking
npx prisma generate
```

#### 🟢 2. API Endpoints

- `GET /api/vocabulary?term=2&theme=Winter`
- `POST /api/vocabulary/:id/usage`
- `GET /api/students/:id/vocabulary-log`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Vocabulary Tracker Interface

Component: `VocabularyTracker.tsx`

- View by:

  - Theme
  - Term
  - Activity

- List of words:

  - Fr / En side by side
  - For each student:

    - Dropdown or pill: \[–] / \[✓ Exposed] / \[✓✓ Practiced] / \[★ Independent]

Searchable and filterable. Show:

- \[🧾 Add word]
- \[📊 View dashboard]

#### 🔵 4. Student Vocabulary Log

Component: `StudentVocabLog.tsx`

- Table grouped by term or theme
- Color-code usage:

  - Gray = Exposed
  - Blue = Practiced
  - Green = Independent

- Timeline view:

  - First seen → last used
  - Sparkline: word growth curve

Export options:

- \[📤 PDF] \[📁 CSV] \[📝 Summary comment for report card]

#### 🔵 5. Class Growth Dashboard

Component: `VocabularyGrowthDashboard.tsx`

- Aggregate views:

  - Total vocabulary introduced (per class)
  - % of students reaching “Independent” use
  - Domain coverage (oral/writing)
  - Thematic gaps

---

### 🔗 INTEGRATION NOTES

- Pull theme data from planner; link vocab to `Theme.id` when relevant
- Consider auto-suggesting vocabulary from planned activities or SFX captions (future AI enhancement)
- Use consistent French accents and spelling rules (avoid duplication)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add usage:**

```http
POST /api/vocabulary/42/usage
{
  studentId: 14,
  usageLevel: "Independent",
  observedAt: "2025-02-12",
  observerId: 8
}
```

Rendered Log:

> **Theme: Winter**
> ❄️ neige | snow → ✅ Exposed → ✅ Practiced → ✅ Independent
> 🧣 écharpe | scarf → ✅ Exposed → 🔄 Practiced
> 🐧 pingouin | penguin → ✅ Exposed
>
> Growth: +9 new words this term
> Export: \[📄 PDF Summary]

---

### 🚩 RISKS

- Must avoid overwhelming teachers with micro-tracking—batch entry options are key
- Risk of duplication if words are spelled inconsistently (Fr accents, plurals)
- Avoid implying vocabulary mastery without sufficient evidence
