## ✅ TASK: Implement Student Goal-Setting & Self-Reflection Module

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a feature that allows teachers to **facilitate student goal-setting and self-reflection**, anchored in curriculum outcomes and themes. This tool is designed for **Grade 1 French Immersion** and must be scaffolded for pre-literate or early-literate students using icons, audio cues, or adult-led prompts.

---

### 🔹 GOAL

Allow students (with or without teacher guidance) to:

- Choose or set **goals** tied to outcomes or themes
- Reflect on their **progress**, effort, or learning experience
- Use **visuals, emojis, or voice inputs** to express understanding
- Store reflections and goals per term or theme

This fosters accountability, confidence, and bilingual development.

---

### ✅ SUCCESS CRITERIA

- Each student can have:

  - 1–3 current goals
  - A history of past goals and outcomes
  - Reflection entries (termly or monthly)

- Reflection entry includes:

  - Outcome/theme
  - Prompt response (in French or English)
  - Optional emoji rating or voice recording

- Teachers can:

  - View all reflections and goals per student
  - Add or help modify entries
  - Export or share with families (optional)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `StudentGoal` and `StudentReflection` models

In `prisma/schema.prisma`:

```prisma
model StudentGoal {
  id         Int       @id @default(autoincrement())
  studentId  Int
  text       String
  outcomeId  Int?
  themeId    Int?
  createdAt  DateTime  @default(now())
  status     String    // "active" | "completed" | "abandoned"
}

model StudentReflection {
  id         Int       @id @default(autoincrement())
  studentId  Int
  date       DateTime
  text       String?
  emoji      String?   // e.g. "🙂", "😐", "😕"
  voicePath  String?   // path to optional recording
  outcomeId  Int?
  themeId    Int?
  createdAt  DateTime  @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name add_student_goals_reflections
npx prisma generate
```

#### 🟢 2. Add endpoints

- `POST /api/students/:id/goals`
- `GET /api/students/:id/goals`
- `PATCH /api/students/:id/goals/:goalId`
- `POST /api/students/:id/reflections`
- `GET /api/students/:id/reflections`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Student Goal Manager

Component: `StudentGoals.tsx`

- Display:

  - 🎯 Active Goals (max 3)
  - ✅ Completed Goals

- “➕ Set New Goal” modal

  - Select outcome or type custom
  - Optional link to theme
  - Text input with plain-language support

#### 🔵 4. Student Reflection Journal

Component: `StudentReflectionJournal.tsx`

- Timeline view of past reflections
- Add new:

  - Choose outcome or theme
  - Emoji rating (🙂😐😕)
  - Text entry (Fr/En)
  - Option to record audio (WebRTC or upload)

- Option for teacher to scribe on behalf of student

#### 🔵 5. Dashboard Integration

- Student Profile → Tabs:

  - “🎯 Goals”
  - “🧠 Reflections”

- Goal status editing
- Reflection export (Markdown, HTML, PDF)

---

### 🔗 INTEGRATION NOTES

- Use the same plain-language outcome labels used in planner and reports.
- Audio storage should link to same `/uploads/students/` directory tree.
- Reflections and goals are **not visible to peers**, only teacher (and optionally families).

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Add Reflection:**

```http
POST /api/students/19/reflections
{
  date: "2026-03-01",
  emoji: "🙂",
  text: "J’ai aimé raconter mon histoire avec des images!",
  outcomeId: 13
}
```

**Rendered View:**

> 🧠 CO.13 — Mar 1
> "J’ai aimé raconter mon histoire..." 🙂
> \[🎙️ Voice available]

---

### 🚩 RISKS

- Keep UI very simple and low-literacy-friendly
- Avoid treating this as a formal assessment; it’s metacognitive and motivational
- Must be 100% teacher-controlled (editing, voice review, privacy)
