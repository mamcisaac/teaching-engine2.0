## ✅ TASK: Implement Activity Suggestion Engine

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are developing a **context-aware activity suggestion tool** that helps teachers select or adapt classroom activities. It provides recommendations tailored to the currently selected term, theme, curriculum outcomes, and classroom observations (e.g., flagged needs, underdeveloped domains). Activities are sourced from a curated bank and optionally AI-augmented, with metadata for subject, materials, prep time, and differentiation strategies.

---

### 🔹 GOAL

Allow teachers to:

- Browse, search, and filter activity ideas
- Automatically receive suggestions for planned outcomes
- Link activities to lesson plans, reflections, or themes
- Flag favorite or past-used activities for reuse
- Generate printable or editable instructions

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Receive activity suggestions tied to selected outcomes or themes
  - Browse activity bank by subject, domain, outcome, or keyword
  - Save or link activities to planner days or units
  - View required materials, setup time, and differentiation options
  - Filter by:

    - Grade level
    - Domain (e.g., oral, math)
    - Learning context (group, individual, outdoor)

- Activities support dual-language entries

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `ActivityTemplate` model

```prisma
model ActivityTemplate {
  id             Int      @id @default(autoincrement())
  titleFr        String
  titleEn        String
  descriptionFr  String
  descriptionEn  String
  domain         String
  subject        String
  outcomeIds     Int[]
  themeId        Int?
  materialsFr    String?
  materialsEn    String?
  prepTimeMin    Int?
  groupType      String   // "Whole class", "Small group", "Individual"
  createdBy      Int
  createdAt      DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name create_activity_templates
npx prisma generate
```

#### 🟢 2. API Endpoints

- `GET /api/activities?suggestFor=CO.14,CO.15&theme=Winter`
- `POST /api/activities` (for new entries)
- `POST /api/planner/day/:id/link-activity/:activityId`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Suggestion Sidebar

Component: `ActivitySuggestions.tsx`

- Autoloaded when:

  - Viewing a planner day
  - Editing a unit theme

- Panel displays:

  - 📘 Title (Fr/En)
  - 🧠 Summary
  - 🧪 Linked outcomes
  - 🧰 Materials needed
  - \[📎 Add to plan] button

Filters:

- Term
- Outcome
- Theme
- Group size
- Language availability

#### 🔵 4. Activity Library Browser

Component: `ActivityLibrary.tsx`

- Grid or list view with filter controls
- \[💾 Save for later], \[🖋️ Edit], \[🧩 Link outcomes]
- Sort by popularity, domain, or prep time
- Option to upload/import .md or .docx versions

#### 🔵 5. Add/Edit Activity Modal

Component: `ActivityEditor.tsx`

- Inputs:

  - Fr/En title & description
  - Domain & subject
  - Outcome tags
  - Materials (multi-line)
  - Prep time (slider)
  - Group type selector

- Save button: \[✅ Create Activity]

---

### 🔗 INTEGRATION NOTES

- Auto-suggest from planner context:

  - Outcomes already tagged in lesson planner
  - Under-assessed outcomes from Outcome Matrix
  - Goals from Goal Tracker (if linked to domain)

- Allow activity reuse: “🔁 Used before” indicator
- Tag activities by differentiation strategy (e.g., visuals, sentence stems)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Suggestion query:**

```http
GET /api/activities?suggestFor=CO.14,CO.27&theme=Winter
```

**Returns:**

```json
[
  {
    titleFr: "Chasse au trésor hivernale",
    titleEn: "Winter Vocabulary Scavenger Hunt",
    domain: "oral",
    prepTimeMin: 10,
    groupType: "Small group"
  },
  ...
]
```

Rendered Suggestion:

> ❄️ **Winter Vocabulary Scavenger Hunt**
> 🗣️ Oral Language | 🧰 Materials: picture cards, baskets
> ⏱️ Prep: 10 min | 👥 Small Group
> Linked Outcomes: CO.14 (naming), CO.15 (sentence use)
> \[📎 Add to Plan] \[⭐ Save]

---

### 🚩 RISKS

- Must avoid excessive or irrelevant suggestions—limit to high-quality matches
- Activity metadata must be rigorously structured (or suggestions will degrade)
- Ensure dual-language support is preserved in entry/editing
