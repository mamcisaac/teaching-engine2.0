## ✅ TASK: Implement Guided Planning Copilot

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **context-aware planning assistant** that helps teachers generate weekly lesson plans aligned to curriculum outcomes, previously taught content, student goals, and assessment coverage. It integrates outcome recommendations, vocabulary previews, prior teaching history, and AI-curated activity ideas into a single guided interface.

---

### 🔹 GOAL

Allow teachers to:

- Select a week and term
- See recommended outcomes to address next
- Receive suggested activities or templates aligned to outcomes
- Log new lessons with prefilled outcomes, vocabulary, and domains
- Avoid unintentional over-/under-representation of key domains

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Launch the copilot planning flow for an upcoming week
  - Select from suggested outcomes based on:

    - Coverage history
    - Curriculum pacing
    - Class/student needs

  - Auto-fill activities with aligned vocab, domains, and assessment ideas
  - Save full weekly plan with confidence that outcomes are balanced and scaffolded
  - Export or push to documentation/assessment

---

### 🔧 BACKEND TASKS

#### 🟢 1. Outcome Recommendation Engine

New endpoint:

```ts
GET /api/planning-copilot/recommendations?teacherId=7&term=3&week=2
```

Returns:

```json
{
  "recommendedOutcomes": [
    { "outcomeId": 8, "priority": "high", "reason": "Not yet covered this term" },
    { "outcomeId": 14, "priority": "medium", "reason": "Previously taught 4 weeks ago" },
    { "outcomeId": 3, "priority": "optional", "reason": "Linked to active student goal" }
  ]
}
```

Scoring logic combines:

- Coverage history
- Outcome pacing maps
- Open student goals
- Past assessment coverage
- Cross-linking (e.g., themes, vocab from previous weeks)

---

#### 🟢 2. Activity Suggestion API (AI)

```ts
POST / api / planning - copilot / activities;
```

Payload:

```json
{
  "outcomeIds": [8, 14],
  "theme": "community",
  "grade": 1
}
```

Returns:

```json
[
  {
    "title": "Community Helpers Roleplay",
    "description": "Students choose a helper role and act out typical day. Emphasis on vocabulary use and structured speech.",
    "linkedOutcomes": [8, 14],
    "suggestedVocab": ["firefighter", "community", "help"]
  }
]
```

Model trained on:

- Existing activity bank
- Curriculum-vocab mappings
- Example past plans

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Weekly Planning Copilot UI

Component: `WeeklyCopilotPlanner.tsx`

Steps:

1. **Select Week**

   - Pre-selects next unplanned week in term

2. **Outcome Suggestions**

   - Shows 5–8 prioritized outcomes
   - Allows teacher to check/uncheck and add others

3. **Activity Suggestions**

   - For each outcome, shows 1–3 aligned activity cards
   - Teacher selects or edits

4. **Draft Plan Assembly**

   - Previews full plan: activities, outcomes, vocab, domains

5. **Save/Export**

   - \[💾 Save Week Plan] \[📤 Export to PDF or Markdown]

---

#### 🔵 4. Vocabulary and Domain Auto-fill

- When outcome is selected:

  - Auto-fill:

    - Suggested vocabulary
    - Suggested domain(s)
    - Optional assessment type

---

### 🔗 INTEGRATION NOTES

- Links to:

  - Curriculum Outcome metadata
  - Outcome Heatmap (for coverage gaps)
  - Student Goal Tracker (relevance engine)
  - Assessment Planner (suggest follow-up)

- Output stored in:

  - `WeeklyPlannerEntry`
  - Each lesson also links back to outcomes and themes

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Input:**

```json
{
  "teacherId": 7,
  "term": 3,
  "week": 2
}
```

**Generated Plan Preview:**

- **Outcome CO.8**: Ask and answer questions in oral interactions
- **Activity**: Community Helpers Roleplay
- **Suggested Vocab**: firefighter, police officer, help
- **Assessment**: Structured discussion + observation checklist

Teacher can:

- \[✏️ Edit Title]
- \[➕ Add New Activity]
- \[📤 Save and Export Plan]

---

### 🚩 RISKS

- Over-reliance on AI suggestions may reduce teacher autonomy
- Needs fine-tuned balance between guidance and flexibility
- Suggestions must be editable and grounded in curriculum language
