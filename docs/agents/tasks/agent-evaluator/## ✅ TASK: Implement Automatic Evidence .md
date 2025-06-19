## ✅ TASK: Implement Automatic Evidence Tagger

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **backend inference engine** that reads the content of any submitted learning evidence (e.g., reflections, artifacts, observations, planner activities) and predicts the most likely:

- Curriculum domains involved
- Linked outcomes
- Thematic tags
- Vocabulary words used or practiced

It does not auto-submit, but **suggests** tags for the teacher to confirm/edit during the entry process—saving time while preserving human judgment.

---

### 🔹 GOAL

Allow teachers to:

- Paste or upload reflections, activity descriptions, or student work
- See automatically suggested:

  - 🧩 Domains (oral, writing, math, etc.)
  - 🎯 Outcome IDs (based on fuzzy match)
  - 🎨 Themes
  - 📚 Vocabulary words

- Accept, remove, or modify these tags before saving

---

### ✅ SUCCESS CRITERIA

- On entry form load, if the content field is non-empty:

  - Suggested tags populate asynchronously

- Teacher can edit any suggestions before final save
- Suggestions are:

  - Reproducible and fast
  - Based on text similarity, keyword maps, and optionally language models

- Suggestions improve over time as outcome lists or vocab banks are updated

---

### 🔧 BACKEND TASKS

#### 🟢 1. Inference API

Create `POST /api/infer-tags` endpoint with payload:

```json
{
  "content": "Eddie shared his ideas during the community roleplay and used full sentences to explain his role as a firefighter."
}
```

Returns:

```json
{
  "suggestedDomains": ["oral"],
  "suggestedOutcomes": [12],
  "suggestedThemes": ["community"],
  "suggestedVocabulary": ["firefighter", "role", "community"]
}
```

Implementation details:

- FastText or embedding-based vector matching for domain/outcome prediction
- Keyword matching + optional semantic similarity (e.g., mini-LLM or static sentence transformers)
- Fuzzy matching against known vocab banks, themes, and outcomes
- Optional caching for common entries

#### 🟢 2. Outcome and Vocabulary Indexes

- Maintain local semantic index of all outcomes by language
- Maintain searchable vocab bank per term/theme
- On update of curriculum, rebuild semantic vectors

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Integration into Reflection and Artifact Forms

Component: `AutoTagSuggestion.tsx`

- When user begins typing or pastes content:

  - Debounce 1s → call `/api/infer-tags`
  - Display chips under each field:

    - Suggested Domain: `oral`
    - Suggested Outcomes: `🎯 12 – Expresses ideas clearly...`
    - Suggested Vocab: `firefighter`, `community`
    - Suggested Theme: `Community`

Each chip has:

- ✔️ Accept
- ❌ Reject
- ✏️ Edit (opens dropdown or text field)

If no tags are chosen manually, default to accepted suggestions.

---

### 🔗 INTEGRATION NOTES

- Works in:

  - `ReflectionForm.tsx`
  - `ArtifactUploadForm.tsx`
  - `PlannerActivityForm.tsx` (optional)

- Uses the same outcome and vocab references as the curriculum backend
- Future: retrainable tagging model based on teacher edits (Phase 6)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

Input:

```text
Eddie confidently explained how firefighters help people and remembered to include why safety gear matters.
```

Inferred:

```json
{
  "suggestedDomains": ["oral"],
  "suggestedOutcomes": [12],
  "suggestedThemes": ["community helpers"],
  "suggestedVocabulary": ["firefighter", "safety", "gear"]
}
```

Rendered Suggestion Panel:

> 🧩 Suggested Domain: Oral
> 🎯 Outcome 12 – Expresses ideas clearly in structured speech
> 🎨 Theme: Community Helpers
> 📚 Vocabulary: firefighter, safety, gear
> \[✔️ Accept All] \[✏️ Edit] \[❌ Clear]

---

### 🚩 RISKS

- False positives: the model may over-assign outcomes or domains
- May reinforce tagging biases if used uncritically—require teacher confirmation
- Needs to balance speed with accuracy to avoid disrupting workflow
