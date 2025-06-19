## ✅ TASK: Implement Bilingual Vocabulary Tracker

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a tool that helps teachers **record, organize, and surface student vocabulary acquisition**, tracking new words introduced, reinforced, or assessed across both French and English. The tracker supports thematic planning, oral language development, and cross-linguistic comparison over time.

---

### 🔹 GOAL

Allow teachers to:

- Enter vocabulary words (Fr and/or En) linked to themes, outcomes, and activities
- View student-level vocabulary exposure and usage
- Generate vocabulary sets for review, reinforcement, or parent communication
- Analyze which domains (e.g., oral, writing, reading) use which words

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Add vocabulary entries (single words or phrases)
  - Tag with:

    - Theme
    - Outcome(s)
    - Domain(s): oral, writing, reading, comprehension

  - Optionally attach example sentence, image, or audio

- For each student:

  - View vocabulary exposure by theme or time
  - Add observed usage (checkbox or frequency count)
  - Export personal vocabulary lists (per theme or term)

- Dashboard shows:

  - Most-used vocabulary
  - Least-reinforced words
  - Words needing review

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `VocabularyEntry` and `StudentVocabularyUse` models

```prisma
model VocabularyEntry {
  id         Int      @id @default(autoincrement())
  wordFr     String
  wordEn     String
  themeId    Int?
  outcomeIds Int[]
  domains    String[] // "oral", "writing", "reading"
  imagePath  String?
  audioPath  String?
  exampleFr  String?
  exampleEn  String?
  createdAt  DateTime @default(now())
}

model StudentVocabularyUse {
  id            Int      @id @default(autoincrement())
  studentId     Int
  vocabularyId  Int
  usedInSpeech  Boolean  @default(false)
  usedInWriting Boolean  @default(false)
  seenDate      DateTime
}
```

Migrate:

```bash
npx prisma migrate dev --name add_vocabulary_tracker
npx prisma generate
```

#### 🟢 2. Add API endpoints

- `POST /api/vocabulary`
- `GET /api/vocabulary?theme=xx&domain=oral`
- `POST /api/students/:id/vocab-usage`
- `GET /api/students/:id/vocab-usage`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Vocabulary Entry Manager

Component: `VocabularyEntryManager.tsx`

- Inputs:

  - French & English word/phrase
  - Optional: example sentence, image upload, audio upload
  - Theme selector
  - Outcome tagger
  - Domain tagger (checkboxes: oral, writing, etc.)

Button: “➕ Add to Word Bank”

#### 🔵 4. Word Bank Viewer

Component: `VocabularyWordBank.tsx`

- Filter by:

  - Theme
  - Domain
  - Date added

- Word cards:

  - Word (Fr/En)
  - Audio icon 🎧
  - Example sentence
  - Tags (outcomes, domain)
  - “📎 Link to Activity” button

#### 🔵 5. Student Vocabulary Usage Tracker

Component: `StudentVocabTracker.tsx`

- Timeline of words introduced
- For each: mark ✔️ used in speech / ✔️ used in writing
- Auto-summarize words:

  - “Introduced but not used”
  - “Used in oral only”
  - “Mastered”

---

### 🔗 INTEGRATION NOTES

- Audio/image storage same as artifacts and voice journal
- Future: integrate with SPT report → “Word bank highlights for home”
- Must support bilingual display and RTL toggling (Fr first or En first)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add Vocabulary Word:**

```http
POST /api/vocabulary
{
  wordFr: "la forêt",
  wordEn: "the forest",
  themeId: 2,
  outcomeIds: [14],
  domains: ["oral", "reading"],
  exampleFr: "Les animaux vivent dans la forêt.",
  exampleEn: "Animals live in the forest."
}
```

Rendered card:

> **la forêt** / _the forest_
> 📚 Domain: Oral, Reading
> 📖 “Les animaux vivent dans la forêt.”
> 🎧 \[Listen]
> 🏷️ Theme: Winter | Outcome: CO.14

---

### 🚩 RISKS

- Overloading teachers with input fields—allow batch imports or AI-suggested vocab
- Distinguish between **teacher vocabulary goals** vs **student mastery**
- Avoid turning this into high-stakes tracking—stay formative, supportive
