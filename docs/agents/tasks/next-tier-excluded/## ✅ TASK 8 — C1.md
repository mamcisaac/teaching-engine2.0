## ✅ TASK 8 — C1. Pattern Miner for Student Growth

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **student growth pattern miner** that detects recurring strengths and needs across student portfolios, assessments, and reflections. The system highlights longitudinal trends—such as consistent strengths in math reasoning or repeated challenges in writing elaboration—using tagged learning artifacts.

These insights are surfaced to teachers to:

- Guide goal-setting
- Support report writing
- Monitor progress over time

---

### 🔹 GOAL

Enable teachers to:

- View student strengths and challenges inferred from past entries
- Identify emerging trends across weeks or terms
- Access AI-summarized growth narratives for report support
- Validate or override the pattern detection logic

---

### ✅ SUCCESS CRITERIA

- For each student, system surfaces:

  - 2–3 **highlighted strengths** (e.g., “Consistently uses strategies to solve problems”)
  - 2–3 **recurring growth areas** (e.g., “Needs support explaining ideas in writing”)
  - Examples of supporting artifacts with timestamps
  - Option to flag any as inaccurate

- Teachers can:

  - View a timeline of tagged observations
  - Export a summary paragraph for narrative reports

---

### 🔧 BACKEND TASKS

#### 🟢 1. Growth Pattern Mining API

```ts
POST /api/patterns/analyze
{
  "studentId": 16
}
```

Returns:

```json
{
  "strengths": [
    {
      "tag": "math_strategy_use",
      "summary": "Often applies multi-step strategies to math tasks",
      "evidence": [
        {
          "source": "MiniLessonLog",
          "date": "2025-01-18",
          "text": "Used number line to solve subtraction story"
        },
        {
          "source": "Reflection",
          "date": "2025-01-25",
          "text": "I drew a picture and then subtracted"
        }
      ]
    }
  ],
  "needs": [
    {
      "tag": "writing_detail",
      "summary": "Struggles to include supporting details in writing",
      "evidence": [
        {
          "source": "AssessmentRecord",
          "date": "2025-02-01",
          "text": "Writing lacks examples and elaboration"
        }
      ]
    }
  ]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Student Growth Dashboard

Component: `GrowthPatternViewer.tsx`

- Tabs:

  - \[💪 Strengths] \[🚧 Growth Areas] \[🕰️ Timeline]

- Features:

  - AI summaries with \[📋 Copy] and \[✏️ Edit]
  - Artifact drill-down: “Click to view source”
  - \[⚠️ Flag Inaccurate Insight]
  - \[📄 Export Growth Summary]

---

### 🔗 INTEGRATION NOTES

- Sources data from:

  - `MiniLessonLogs`
  - `StudentReflections`
  - `AssessmentRecords`
  - `PortfolioItems`

- Relies on:

  - Tags (e.g., `math_strategy_use`, `writing_detail`, `collaboration`)
  - Outcome linkage and NLP-based thematic clustering (e.g., GPT with semantic tags)

---

### 📁 DATABASE TASKS

Extend `StudentPatternInsight`:

```prisma
model StudentPatternInsight {
  id         Int      @id @default(autoincrement())
  studentId  Int
  tag        String
  type       String // "strength" or "need"
  summary    String
  evidence   Json
  createdAt  DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Student: Ethan
- Detected strength: “Builds number sense through repeated patterning”
- Detected need: “Difficulty organizing ideas in French writing”
- 3 artifacts shown for each
- Teacher flags 1 need as inaccurate → insight removed

---

### 🚩 RISKS

- Requires balance between accurate pattern detection and teacher override
- Models must avoid false inferences from noisy or incomplete logs
- Narrative summaries must be editable and bias-free
