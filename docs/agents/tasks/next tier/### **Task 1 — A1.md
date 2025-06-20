### **Task 1 — A1. Smart Activity Generator**

---

## ✅ TASK: Implement Smart Activity Generator (Outcome-Aligned Task Suggestions)

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building an **AI-powered activity generation module** that suggests developmentally appropriate learning activities, matched to curriculum outcomes, learner profiles, and preferred teaching style.

Activities can include prompts, games, hands-on tasks, writing invitations, and collaborative challenges. These must be outcome-linked and offer tiered scaffolding or adaptation for varying ability levels.
This is a teacher-facing planning aid—not auto-assigned to students.

---

### 🔹 GOAL

Allow teachers to:

- Select a curriculum outcome
- Generate a set of recommended learning activities
- Filter by grouping type (individual, pairs, whole group), language (English/French), and level of support
- Copy or adapt suggestions into their weekly plans

---

### ✅ SUCCESS CRITERIA

- Activity suggestions are:

  - Matched to selected outcome(s)
  - Developmentally appropriate for Grade 1
  - Adaptable by teacher (editable)
  - Presented in plain language

- Filters available:

  - Domain (e.g., literacy, SEL, math)
  - Grouping (1:1, small group, whole class)
  - Language (EN/FR)
  - Activity type (game, prompt, hands-on, etc.)

- Teachers can:

  - Add a suggested activity to their WeeklyPlanner
  - Edit the description before saving
  - View source outcome and rationale

---

### 🔧 BACKEND TASKS

#### 🟢 1. Activity Suggestion API Endpoint

```ts
POST /api/activities/suggest
{
  "outcomeId": 27,
  "language": "fr",
  "grouping": "small group",
  "types": ["hands-on", "prompt"]
}
```

Returns:

```json
{
  "outcome": "CO.27: Describe patterns in numbers and shapes",
  "suggestions": [
    {
      "title": "Pattern Stations",
      "description": "Set up stations with beads, stamps, and number blocks. Students rotate and describe what patterns they see or build.",
      "grouping": "small group",
      "tier": "universal"
    },
    {
      "title": "Pattern Walk",
      "description": "Go on a classroom scavenger hunt to find repeating patterns on walls, clothes, and objects. Discuss in a circle.",
      "grouping": "whole class",
      "tier": "oral scaffold"
    }
  ]
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Request:

```json
{
  "outcomeId": 12,
  "language": "en",
  "grouping": "pairs",
  "types": ["writing"]
}
```

Returns:

- "Partner Postcards": “Students write a postcard to their partner describing their weekend using time words (first, next, then)."
- "Dialogue Builders": “Give students sentence starters to build short conversations using present tense French verbs.”

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Activity Suggestion UI Panel

Component: `ActivityGeneratorPanel.tsx`

- Fields:

  - \[🎯 Outcome Picker]
  - \[🌐 Language: EN/FR]
  - \[👥 Grouping: 1:1 / Group / Class]
  - \[🧩 Activity Type: Prompt, Game, Writing, Manipulative…]

- Output:

  - Accordion-style list of 3–5 suggestions
  - Each suggestion:

    - Title
    - Outcome link
    - Activity description
    - \[📝 Edit] \[➕ Add to Planner]

---

### 🔗 INTEGRATION NOTES

- Must connect to:

  - `CurriculumOutcome` model
  - `WeeklyPlanner` module

- Optional: store teacher-generated suggestions for re-use or refinement
- Future enhancement: GPT-backed suggestion fallback if no pre-curated examples exist

---

### 📁 DATA SOURCES

- Seed initial dataset with \~150 activities tagged by:

  - Outcome
  - Language
  - Grouping
  - Type
  - Tier (universal, support, enrichment)

- Store in `ActivitySuggestion` model

```prisma
model ActivitySuggestion {
  id         Int      @id @default(autoincrement())
  outcomeId  Int
  language   String
  title      String
  description String
  grouping   String
  type       String
  tier       String
  createdAt  DateTime @default(now())
}
```

---

### 🚩 RISKS

- GPT activity generation must be validated—avoid hallucinated content or dev-inappropriate ideas
- Teachers may be overwhelmed if too many suggestions are returned; cap intelligently
- Needs nuance for EN/FR language equivalency (some tasks don’t translate directly)
