## ✅ TASK 4 — A4. Pedagogical Prompt Generator

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **prompt-generation tool** that assists teachers by generating developmentally appropriate **teacher prompts**, **questions**, and **sentence starters** linked to selected outcomes. These are designed to:

- Scaffold student thinking
- Support formative assessment
- Deepen inquiry and reflection
- Provide linguistic structures for French Immersion learners

---

### 🔹 GOAL

Help teachers:

- Select one or more curriculum outcomes
- Generate pedagogical prompts categorized by type

  - Open-ended questions
  - Scaffolded sentence stems
  - Metacognitive reflections
  - Peer discussion starters

- Copy and insert selected prompts into lesson plans, activities, or reflections

---

### ✅ SUCCESS CRITERIA

- System generates:

  - 3–5 prompt types per outcome
  - At least 1–2 of each category: question / stem / discussion
  - Language-specific phrasing (EN or FR)

- Teacher can:

  - View rationale/context for each prompt
  - Copy to clipboard or insert into WeeklyPlanner
  - Flag helpful prompts for reuse

- Prompts are:

  - Concise, age-appropriate, and classroom-ready
  - Aligned with selected outcome’s intent

---

### 🔧 BACKEND TASKS

#### 🟢 1. Pedagogical Prompt API

```ts
POST /api/prompts/generate
{
  "outcomeId": 31,
  "language": "fr"
}
```

Returns:

```json
{
  "outcome": "CO.31: Ask and answer questions about texts",
  "prompts": [
    { "type": "open_question", "text": "Pourquoi penses-tu que le personnage a choisi cela ?" },
    { "type": "sentence_stem", "text": "Je pense que le personnage est ___ parce que ___." },
    {
      "type": "discussion",
      "text": "Partage avec ton partenaire une question que tu as sur l'histoire."
    }
  ]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Prompt Generator Interface

Component: `PromptGeneratorPanel.tsx`

- Input:

  - \[🎯 Outcome Selector]
  - \[🌐 Language Switch: EN/FR]

- Output:

  - Categorized prompt cards:

    - \[❓ Open Questions]
    - \[🧠 Reflection Stems]
    - \[💬 Peer Prompts]

  - Controls:

    - \[📋 Copy Prompt]
    - \[📥 Add to Plan]
    - \[⭐ Flag for Reuse]

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - `CurriculumOutcome` descriptions and examples
  - `LanguagePhraseBank` (for age-appropriate phrasing)

- Pushes into:

  - `WeeklyPlanner`
  - `ActivityBuilder`

- GPT fallback: use curated few-shot examples for prompt types in each domain to ground completions

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Call:

```json
{
  "outcomeId": 5,
  "language": "en"
}
```

Returns:

- "How do you know your measurement is accurate?"
- "I used \_\_\_ to figure out the answer."
- "Ask your partner to explain their thinking."

---

### 📁 DATABASE TASKS

Seed or store prompts (optional):

```prisma
model OutcomePrompt {
  id         Int @id @default(autoincrement())
  outcomeId  Int
  type       String // e.g., "open_question", "stem", "discussion"
  language   String
  text       String
  createdAt  DateTime @default(now())
}
```

---

### 🚩 RISKS

- Requires careful control of linguistic tone and complexity (especially in French)
- Redundancy if teachers are repeatedly shown similar prompts—must deduplicate well
- Prompts must remain pedagogically neutral (avoid assuming instruction style)
