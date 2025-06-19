## ✅ TASK: Implement Cognate & Language Transfer Tracker

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a bilingual teaching assistant for PEI Grade 1 French Immersion educators. Your goal in this task is to allow teachers to track and highlight **French-English cognates** (e.g. “animal – animal”) and explicitly support **cross-language transfer** between L1 and L2. This fosters vocabulary development and helps students recognize patterns between the two languages, especially when planning thematic or literacy-rich units.

---

### 🔹 GOAL

Support explicit tracking, annotation, and usage of **cognate pairs** and transferable vocabulary across French and English. These pairs should be viewable, searchable, and usable in planning and teaching. Activities can be linked to cognates or labeled as supporting **cross-language transfer**.

---

### ✅ SUCCESS CRITERIA

- Teachers can create and view French-English **cognate pairs**.
- Teachers can link cognates to activities and outcomes.
- Teachers can filter/search for activities that include language transfer support.
- Daily/Weekly planners can surface suggested cognates tied to outcomes.
- Resource suggestions can include bilingual glossaries or visuals when appropriate.

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `CognatePair` model

In `prisma/schema.prisma`:

```prisma
model CognatePair {
  id            Int      @id @default(autoincrement())
  wordFr        String
  wordEn        String
  notes         String?     // e.g. “Exact cognate”, “False friend caution”
  linkedOutcomes Outcome[] @relation("CognateOutcomes")
  linkedActivities Activity[] @relation("CognateActivities")
  userId        Int
  createdAt     DateTime @default(now())
}
```

Run:

```bash
npx prisma migrate dev --name add_cognate_model
npx prisma generate
```

#### 🟢 2. Create API endpoints

- `GET /api/cognates`
- `POST /api/cognates`
- `PUT /api/cognates/:id`
- `DELETE /api/cognates/:id`

Allow optional linking to outcomes and activities. Enforce uniqueness on `(wordFr, wordEn)` pairs for each user.

#### 🟢 3. Add utility function

File: `services/cognates.ts`

Function: `suggestCognatesForOutcome(outcomeId)`
Logic:

- Extract keywords from the outcome description (in French).
- Compare against a static or expanding database of known cognates.
- Return matching pairs or near-matches.

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Add Cognate Library Manager

Component: `CognateLibrary.tsx`

- List all cognate pairs with:

  - 🇫🇷 wordFr – 🇬🇧 wordEn
  - Notes
  - Linked outcomes
  - Linked activities

- Allow create/edit/delete

Include in sidebar or planning tools menu.

#### 🔵 5. Link Cognates in Activity Editor

In `ActivityModal.tsx`:

- Add section: “Cognates Supported”
- Search or select from list of CognatePair items.
- Store `activityId → cognateIds` in database.

#### 🔵 6. Weekly Planner cognate assist

- For each scheduled activity:

  - Show cognates used (if any)
  - Tooltip: “This lesson reinforces animal – animal and nature – nature.”

- Add weekly summary widget:

> 🧠 Language Transfer This Week:
>
> - 4 activities include cognates
> - Top pair: “animal – animal”

#### 🔵 7. Curriculum coverage integration

- On coverage dashboard, add optional filter: “Show outcomes linked to cognates”
- Highlight outcomes that are being reinforced via cross-language transfer.

---

### 🔗 INTEGRATION NOTES

- Cognate usage does not imply outcome coverage unless activity is also linked.
- Later, AI can auto-suggest cognates during activity creation.
- Cognates should be stored at user level, not global, unless a public library is added later.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create Cognate Pair:**

```http
POST /api/cognates
{
  wordFr: "animal",
  wordEn: "animal",
  notes: "Exact cognate, useful in science theme"
}
```

**Link to Activity:**

```http
PUT /api/activities/34
{
  cognateIds: [12, 15]
}
```

**UI:**
In Daily Plan:

> “Reading: Les animaux”
> Cognates: 🧠 animal – animal, sauvage – savage (⚠️ false friend)

---

### 🚩 RISKS

- Avoid false cognates unless explicitly marked (e.g. “librairie – library”).
- Don’t auto-assume that outcome descriptions always contain transferable vocabulary.
- Long-term: support tag-based filtering (e.g., “cross-linguistic support”).
