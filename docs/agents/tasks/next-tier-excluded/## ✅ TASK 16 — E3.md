## ✅ TASK 16 — E3. Voice-Based Reflection Detector

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are developing a **Voice-Based Reflection Detector** that enables students to record brief verbal reflections using a tablet, which are automatically transcribed and tagged to curriculum outcomes using natural language processing and semantic similarity scoring.

This feature supports:

- Oral language development
- Student-led documentation
- Equity of expression for emergent writers

---

### 🔹 GOAL

Allow students to:

- Record 30–90 second audio reflections
- Receive instant transcription
- Have key ideas matched to curriculum outcomes
- Tag content for teachers to review and accept/reject alignment

---

### ✅ SUCCESS CRITERIA

- Students can:

  - Record directly in the browser or app
  - See a transcript of what they said
  - Review 2–3 suggested curriculum tags

- Teachers can:

  - View tagged reflections in their dashboard
  - Approve or adjust outcome matches
  - Add feedback or reuse excerpts in student portfolios

---

### 🔧 BACKEND TASKS

#### 🟢 1. Audio Processing Pipeline

- Accepts `.webm` or `.mp3` uploads
- Transcribes using:

  - `whisper` API (OpenAI) or open-source `faster-whisper`

- Sanitizes and stores transcription

#### 🟢 2. Outcome Matching Engine

- Uses semantic search over outcome embeddings (see Task 14)
- Scores transcript against each outcome
- Returns top 3 outcomes with match strength

#### 🟢 3. Submission API

```ts
POST /api/reflection/submit-voice
{
  "studentId": 12,
  "audioBlob": "...",
  "language": "fr"
}
```

Returns:

```json
{
  "transcript": "J'ai utilisé une loupe pour regarder les insectes...",
  "suggestedOutcomes": [
    { "outcomeId": 204, "text": "Observe et décrit des organismes vivants", "score": 0.88 },
    { "outcomeId": 209, "text": "Pose des questions sur la nature", "score": 0.76 }
  ]
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 4. Voice Reflection Interface

Component: `VoiceReflectionRecorder.tsx`

- Buttons:

  - \[🎤 Record], \[⏹ Stop], \[🔁 Retry], \[📄 Submit]

- After recording:

  - Transcript preview
  - Suggested outcome tags
  - Confirm or edit before submission

#### 🔵 5. Teacher Review Panel

Component: `ReflectionReviewQueue.tsx`

- View pending reflections
- Filter by student/date/domain
- Approve/edit outcome tags
- Option to link to portfolio or assessment

---

### 🔗 INTEGRATION NOTES

- Audio stored in `StudentReflection`
- Outcome suggestions stored in `SuggestedTag` (with review status)
- Should support bilingual audio recognition and tagging

---

### 📁 DATABASE TASKS

Add fields to `StudentReflection`:

```prisma
model StudentReflection {
  ...
  audioUrl     String?
  transcript   String?
  language     String
  submittedBy  Enum("student", "teacher", "assistant")
}
```

Add `SuggestedTag` model:

```prisma
model SuggestedTag {
  id             Int @id @default(autoincrement())
  reflectionId   Int
  outcomeId      Int
  score          Float
  approved       Boolean?
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Student records: “Aujourd’hui, j’ai observé des papillons dans le jardin.”
- Transcript generated
- Suggested outcomes: \[Observe living things], \[Describe natural environments]
- Teacher confirms first outcome, discards second, adds note

---

### 🚩 RISKS

- Must handle background noise and false positives
- Requires transparent flagging: AI-tagged vs human-approved
- Young students may need simplified interface and playback control
