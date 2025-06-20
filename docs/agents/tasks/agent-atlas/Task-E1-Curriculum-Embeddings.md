## ✅ TASK 14 — E1. Curriculum Outcome Embedding Engine

---

**Agent**: Agent-Atlas
**Phase**: 1 - Foundation (CRITICAL FIRST)
**Priority**: 1 (Highest - blocks all other AI features)
**Dependencies**: None
**Estimated Time**: 2-3 days
**Implementation Note**: MUST BE COMPLETED BEFORE any A1, A2, A3, A4, E2 tasks

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are implementing an **embedding engine** that converts curriculum outcomes into semantic vector representations. These embeddings allow AI systems to match activities, student work, and reflections to outcomes more flexibly—based on meaning rather than exact keyword overlap.

This underpins smarter activity recommendations, personalized assessment, and deep curriculum alignment.

---

### 🔹 GOAL

Enable the platform to:

- Generate and store dense vector embeddings for each curriculum outcome
- Support semantic search and alignment between:

  - Teacher plans ↔ outcomes
  - Student reflections ↔ outcomes
  - Activities ↔ learning goals

- Lay foundation for intelligent, meaning-aware features

---

### ✅ SUCCESS CRITERIA

- Each outcome has an associated embedding vector
- System can:

  - Compare new text (e.g., activity title) to all outcomes and rank top matches
  - Return top-N outcomes by semantic relevance

- Embeddings stored and queryable via fast vector search
- Vector model is tunable (default: OpenAI or open-source fallback)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Embedding Generator

Create a function to embed outcome text:

```ts
async function embedOutcomeText(text: string): Promise<number[]> {
  // Use OpenAI embeddings or SentenceTransformer
  // e.g., "Students will identify patterns in counting and sorting"
}
```

#### 🟢 2. Vector Store Integration

- Option 1: Use PostgreSQL + pgvector extension
- Option 2: Use external vector DB (e.g., Pinecone, Weaviate)

Example schema:

```sql
CREATE TABLE outcome_embeddings (
  id SERIAL PRIMARY KEY,
  outcome_id INTEGER REFERENCES CurriculumOutcome(id),
  embedding VECTOR(1536),
  model TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### 🟢 3. Semantic Search Endpoint

```ts
POST /api/embeddings/match-outcomes
{
  "text": "Organize objects by color and shape"
}
```

Returns:

```json
[
  { "outcomeId": 102, "score": 0.87, "text": "Sorts objects based on observable attributes" },
  { "outcomeId": 121, "score": 0.82, "text": "Identifies repeating patterns" }
]
```

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Preview & Match UI

Component: `OutcomeSemanticMatcher.tsx`

- User inputs:

  - \[🧠 Description of task or observation]

- Output:

  - List of top 3–5 matching outcomes
  - Match strength scores
  - \[📋 Copy Outcome ID] or \[🔗 Link to Activity]

---

### 🔗 INTEGRATION NOTES

- Should fallback gracefully if embedding service is unavailable
- All curriculum outcomes must be preprocessed once, then stored
- Enables downstream use in:

  - Activity Generator
  - Reflection classifier
  - Smart planning assistant

---

### 📁 DATABASE TASKS

- Add `OutcomeEmbedding` table or extension via `pgvector`
- Index vector column for fast nearest-neighbor search

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Input: “Grouping animals by habitat”
- Top matches:

  - “Classifies living things based on characteristics” (score 0.91)
  - “Describes habitats and environmental needs” (score 0.88)

- Teacher selects one to align task with outcome

---

### 🚩 RISKS

- Semantic drift: Must validate match logic doesn’t mislead teachers
- Vector storage increases DB complexity—ensure backup/fallback logic
- Embeddings must be re-generated if curriculum is updated
