## ✅ TASK: Implement Longitudinal Reading Fluency Graphs

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **dashboard module that visualizes reading growth** using repeated fluency assessments. It tracks metrics like words per minute (WPM), accuracy, and prosody across terms. This tool helps identify trends, stagnation, or acceleration and supports teacher reporting and intervention planning.

---

### 🔹 GOAL

Allow teachers to:

- Record reading fluency observations or scores for students
- Automatically generate visual trend graphs (per student, per class)
- See flagged slow growth or regression
- Export visual fluency profiles for report cards or SPT meetings

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Enter reading fluency data (WPM, accuracy %, notes)
  - See graphs of fluency over time per student
  - Filter by date range or reading type
  - View class-wide summary (e.g., average WPM over time)
  - Export student-level charts to PDF/Markdown

---

### 🔧 BACKEND TASKS

#### 🟢 1. Reading Fluency Model

```prisma
model ReadingFluency {
  id         Int      @id @default(autoincrement())
  studentId  Int
  date       DateTime
  readingType String   // e.g., "decodable", "leveled", "poetry"
  wordsPerMinute Int
  accuracy     Float   // as %
  notes        String?
}
```

#### 🟢 2. API Endpoints

- `POST /api/fluency` – add entry
- `GET /api/fluency/student/:id` – all entries
- `GET /api/fluency/class-summary` – aggregated stats by date

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Student Fluency Graph

Component: `ReadingFluencyGraph.tsx`

- Line chart with:

  - X-axis: Date
  - Y-axis: WPM (primary)
  - Overlay: Accuracy (%) as dashed line or secondary Y-axis

- Optional:

  - Color by readingType
  - Tooltips show notes

Filters:

- Date range
- Reading type
- View mode: WPM | Accuracy | Both

#### 🔵 4. Class Fluency Overview

Component: `ClassFluencyDashboard.tsx`

- Table or chart:

  - Mean WPM by date
  - Growth rate slope
  - % of students below expected range

- Flags:

  - Students with regression over last 3 samples
  - Students with high fluency but low accuracy

#### 🔵 5. Export Tools

Component: `FluencyExportPanel.tsx`

- Exports for:

  - Student chart with commentary area
  - Class summary table

- Formats: PDF, Markdown, CSV

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - Student roster
  - Vocabulary/reading themes (optional future feature)

- Option: link individual readings to artifacts (audio recordings)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
GET /api/fluency/student/14
```

Returns:

```json
[
  {
    "date": "2025-02-12",
    "readingType": "decodable",
    "wordsPerMinute": 34,
    "accuracy": 0.91,
    "notes": "Still decoding slowly but improving segmenting"
  },
  {
    "date": "2025-03-14",
    "readingType": "decodable",
    "wordsPerMinute": 42,
    "accuracy": 0.94
  }
]
```

Rendered Chart:

📈 **WPM Trend:**

- Feb 12: 34 WPM (91%)
- Mar 14: 42 WPM (94%)

Flag: 🔼 23% growth over 30 days

---

### 🚩 RISKS

- Overemphasis on WPM could obscure deeper comprehension or expression issues
- Teachers may forget to input regularly—consider reminders
- Ensure outliers (e.g., one bad day) don’t skew trends disproportionately
