## ✅ TASK: Implement SPT Export Engine

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a tool to extract and format structured student performance data—especially reflections, outcome coverage, and interventions—into clean, reviewable exports suitable for **Student Progress Team (SPT)** meetings, referrals, or cumulative student files. These exports are editable, term-based, and optionally anonymized.

---

### 🔹 GOAL

Allow teachers to:

- Export all relevant data for SPT meetings or referrals:

  - Curriculum coverage
  - Learning concerns or flags
  - Linked observations
  - Artifacts and interventions

- Format for sharing with school teams, administrators, or resource staff
- Export with optional anonymization or name redaction
- Align with PEI cumulative file standards

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Select a student and term
  - See all logged concerns, flags, follow-ups, and linked interventions
  - Export a professional summary file (PDF, docx, or Markdown)

- File includes:

  - Student name (or redacted)
  - Term
  - Summary of learning progress (from outcome logs)
  - Family communication overview
  - Logged goals, plans, interventions (if any)
  - Linked artifacts (optional inclusion)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `SPTExportLog` model

```prisma
model SPTExportLog {
  id           Int      @id @default(autoincrement())
  studentId    Int
  term         String
  createdBy    Int
  createdAt    DateTime @default(now())
  exportedFilePath String?
}
```

#### 🟢 2. Build export assembler

- Pull from:

  - FamilyComm logs (flagged or concern-related)
  - Outcome coverage and performance flags
  - Teacher reflections/notes (marked “relevant for SPT”)
  - Interventions (if available)

- Assemble into markdown or HTML → render as PDF/docx

#### 🟢 3. API Endpoints

- `POST /api/spt/export?student=ID&term=TERM`
- `GET /api/spt/export/:id`

---

### 🎨 FRONTEND TASKS

#### 🔵 4. SPT Export Panel

Component: `SPTExportPanel.tsx`

- Inputs:

  - Student selector
  - Term selector
  - Options:

    - \[✓] Include interventions
    - \[✓] Include family comm summary
    - \[✓] Redact student name

- Preview window (Markdown or live-rendered)
- Button: “📥 Download SPT Export”

#### 🔵 5. SPT History Table

Component: `SPTExportHistory.tsx`

- Table:

  - Student
  - Term
  - Created by
  - Date
  - \[📄 View] \[📤 Download again]

---

### 🔗 INTEGRATION NOTES

- Use reflections already flagged with `isRelevantForSPT: true`
- Redaction mode replaces names with pseudonyms (e.g., “Student A”)
- File naming: `SPT_Alex_Term1_2025.pdf`

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Generate SPT Export:**

```http
POST /api/spt/export?student=27&term=Term2
```

**Returns:**

```json
{
  "id": 42,
  "studentId": 27,
  "exportedFilePath": "/exports/SPT_Alex_Term2.pdf"
}
```

Export includes:

- Term summary (auto from generator)
- Family concern log:

  - “On Jan 18, teacher noted difficulty with number recognition”
  - “Feb 4: Parent reported anxiety at home”

- Observed interventions:

  - “Daily 1:1 reading support trialed from Feb 5–25”

---

### 🚩 RISKS

- Export must **never leak** unredacted data if anonymized mode is selected
- Requires careful filtering of relevant logs—default to explicit tagging (`SPT-relevant`)
- PDF export engine must gracefully handle long logs and artifacts
