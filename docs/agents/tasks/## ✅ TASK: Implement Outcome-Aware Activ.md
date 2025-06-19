## ✅ TASK: Implement Outcome-Aware Activity Search Tool

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **AI-enhanced activity discovery tool** that helps teachers find instructional activities aligned with:

- Specific curriculum outcomes
- Domains (e.g., oral, reading, numeracy, SEL)
- Student age, term, and learning mode (e.g., group, center, outdoor)
- Artifact type or assessment potential

It pulls from a shared bank of teacher-contributed and AI-suggested activities, each tagged with rich metadata. Results should be sortable, previewable, and insertable into planners or goals.

---

### 🔹 GOAL

Allow teachers to:

- Search or browse instructional activities
- Filter by outcome, domain, time, or learning context
- Preview and customize activity details
- Insert directly into planner or share to others
- Contribute new activities to the shared bank

---

### ✅ SUCCESS CRITERIA

- Search returns high-quality, tagged activities
- Results match the selected outcome(s) and classroom constraints
- Activities include:

  - Title, summary, materials, instructions, outcomes
  - Optional visuals or downloadable support

- One-click export to: Weekly Planner, Mini-Lesson Log, or Family Note

---

### 🔧 BACKEND TASKS

#### 🟢 1. Activity Model

```prisma
model Activity {
  id           Int      @id @default(autoincrement())
  title        String
  summary      String
  materials    String?
  instructions String
  outcomeTags  Int[]
  domains      String[]   // e.g. ["oral", "SEL"]
  suitableFor  String[]   // e.g. ["outdoor", "group", "station"]
  mediaUrl     String?
  createdBy    Int?
  createdAt    DateTime   @default(now())
}
```

#### 🟢 2. Search API

```ts
GET /api/activity/search?outcomeId=14&domain=oral&mode=group
```

Returns array of `ActivityPreview` objects.

Optional AI reranker:

```ts
POST /api/activity/search/smart
{
  "query": "hands-on storytelling for French oral skills",
  "studentAge": 6,
  "targetOutcomes": [12, 15],
  "context": ["station", "group"],
  "term": 2
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Activity Search Interface

Component: `ActivityFinder.tsx`

- Search bar + filters:

  - \[Outcome] \[Domain] \[Term] \[Mode] \[Age] \[Assessment Potential]

- Result Cards:

  - ✅ Title & outcome tags
  - 📄 Summary & materials
  - \[👁️ View Full] \[📥 Insert in Planner] \[⭐ Save to My Bank]

---

#### 🔵 4. Activity Editor

Component: `ActivityEditor.tsx`

- Edit and submit new activity:

  - Outcome(s)
  - Domain(s)
  - Grade/age
  - Teaching mode
  - Materials + instructions

- Buttons:

  - \[✅ Submit to Shared Bank]
  - \[💾 Save Draft]
  - \[🔁 Reuse Existing Activity]

---

### 🔗 INTEGRATION NOTES

- Pulls outcome taxonomy from curriculum engine
- Surfaces AI-suggested lessons from:

  - Reflection Generator
  - Mini-Lesson Generator
  - Teacher activity contributions

- Exportable to:

  - `WeeklyPlanner`
  - `MiniLessonLog`
  - `FamilyViewEntry`

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Search Call:**

```http
GET /api/activity/search?outcomeId=7&domain=oral&mode=group
```

Returns:

```json
[
  {
    "title": "Picture Prompt Pair Share",
    "summary": "Students describe visual scenes to a partner using new vocabulary.",
    "materials": "Printed images",
    "instructions": "Partner A describes image while B listens and retells. Switch roles.",
    "outcomeTags": [7],
    "domains": ["oral", "listening"],
    "suitableFor": ["partner", "oral"]
  }
]
```

---

### 🚩 RISKS

- Low-quality activities could clutter the bank without curation
- Risk of mismatched outcomes if metadata tagging is weak
- Must allow easy filtering for grade appropriateness and time constraints
