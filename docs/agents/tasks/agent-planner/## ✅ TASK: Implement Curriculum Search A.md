## ✅ TASK: Implement Curriculum Search Assistant

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an interactive, educator-facing **search and discovery interface** for exploring curriculum outcomes and learning goals. This assistant enables teachers to locate relevant outcomes quickly, understand their meaning, and link them to activities, themes, or assessments—with bilingual support and intelligent tagging.

---

### 🔹 GOAL

Enable teachers to:

- Search outcomes by keywords, domain, strand, or developmental focus
- View outcomes in Fr and En
- Understand suggested grouping (e.g., "Oral Language Foundations")
- Tag or favorite commonly-used outcomes
- Link outcomes to activities, assessments, or themes

---

### ✅ SUCCESS CRITERIA

- Search bar returns:

  - Direct keyword matches in Fr or En
  - Related concepts and tags (e.g., “describe”, “counting”, “oral sequence”)

- Results show:

  - Outcome code (e.g., CO.14)
  - Fr and En versions
  - Linked domain (oral, writing, reading, math)
  - Tags (e.g., “early numeracy”, “phonemic awareness”)

- Teachers can:

  - Bookmark outcomes
  - View suggested links (activities, themes, assessments)
  - Jump to planner integration

---

### 🔧 BACKEND TASKS

#### 🟢 1. Enhance `Outcome` model with searchable tags

```prisma
model Outcome {
  id          Int      @id @default(autoincrement())
  code        String
  textFr      String
  textEn      String
  domain      String
  tags        String[] // e.g. ["oral", "storytelling", "describing"]
}
```

Migrate:

```bash
npx prisma migrate dev --name add_outcome_tags
npx prisma generate
```

#### 🟢 2. Add search index (PostgreSQL full-text or Elastic-style fallback)

If using PostgreSQL:

```sql
CREATE INDEX outcome_search_idx ON "Outcome"
USING GIN (to_tsvector('simple', textFr || ' ' || textEn || ' ' || array_to_string(tags, ' ')));
```

#### 🟢 3. API endpoints

- `GET /api/outcomes/search?q=describe&domain=oral`
- `GET /api/outcomes/:id/suggestions`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Search Assistant UI

Component: `CurriculumSearchAssistant.tsx`

Features:

- Search bar (Fr/En input, handles typos/stems)
- Domain filter dropdown
- Tag filter (multi-select chips)
- Results list:

  - Outcome code
  - Fr + En
  - Tags shown as pills
  - Bookmark ⭐ button
  - Quick actions:

    - “📌 Add to planner”
    - “➕ Link to activity”

#### 🔵 4. Outcome Detail Sidebar

Component: `OutcomeDetailPanel.tsx`

- Full text (Fr & En)
- Suggested tags
- Domain & strand
- Linked activities/themes
- Option to annotate privately (teacher notes)

---

### 🔗 INTEGRATION NOTES

- Outcomes already exist—do not create duplicates
- Use consistent tags across planner, vocab, and assessment features
- Future: integrate NLP to auto-suggest outcomes based on activity text

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Search:**

```http
GET /api/outcomes/search?q=describe&domain=oral
```

Returns:

```json
[
  {
    "id": 14,
    "code": "CO.14",
    "textFr": "Décrire un objet à l’oral en utilisant des mots descriptifs.",
    "textEn": "Describe an object orally using descriptive language.",
    "domain": "oral",
    "tags": ["oral", "description", "vocabulary"]
  }
]
```

Rendered Card:

> **CO.14**
> 🗣️ _Décrire un objet à l’oral…_
> 📝 _Describe an object orally…_
> Tags: 🗣️ Oral | 🧠 Description | 📚 Vocabulary
> ⭐ Save | ➕ Link to Activity

---

### 🚩 RISKS

- Ensure bilingual keyword matching works reliably; avoid false positives
- Distinguish between teacher-facing tags vs. curriculum-authoritative structure
- Avoid overwhelm: show only most relevant matches first; allow refinement
