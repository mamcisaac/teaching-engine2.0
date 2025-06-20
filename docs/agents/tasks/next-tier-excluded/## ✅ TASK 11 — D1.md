## ✅ TASK 11 — D1. Portable Portfolio Packager

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **Portable Portfolio Packager** that enables teachers to export a complete, organized student portfolio for offline sharing, parent meetings, or archival purposes. The export includes tagged artifacts, reflections, assessments, and teacher notes, grouped by outcome or domain.

This supports parent-teacher interviews, grade transitions, and cumulative learning documentation.

---

### 🔹 GOAL

Enable teachers to:

- Select a student and term/year
- Export all evidence (portfolio, assessments, reflections)
- Structure the export by outcome, subject, or date
- Output to ZIP (HTML), PDF report, or linked Google Drive folder

---

### ✅ SUCCESS CRITERIA

- User can:

  - Choose export format (ZIP, PDF, Google Drive)
  - Select time period (term, year, or full history)
  - Choose structure (by outcome, domain, or date)
  - Download organized, human-readable package

- Package includes:

  - Table of contents
  - Student info
  - Artifacts with source, date, and tags
  - Optional teacher summary per section

---

### 🔧 BACKEND TASKS

#### 🟢 1. Export API

```ts
POST /api/portfolio/export
{
  "studentId": 7,
  "term": 2,
  "format": "zip",
  "structure": "by_domain"
}
```

Returns:

- Downloadable ZIP
- HTML or PDF format inside

#### 🟢 2. Evidence Compilation Logic

- Aggregate data from:

  - `PortfolioItem`
  - `StudentReflection`
  - `AssessmentRecord`
  - `MiniLessonLog`

- Sort/group based on user-selected structure
- Include teacher-added comments if available

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Export Interface

Component: `PortfolioExporter.tsx`

- Inputs:

  - \[👧 Student Picker]
  - \[📅 Time Range] (term, full year)
  - \[🗂️ Structure By]: Outcome / Domain / Date
  - \[📝 Include Teacher Notes?]
  - \[⬇️ Export as]: PDF / ZIP / Google Drive

- Button: \[📤 Generate & Download Portfolio]

---

### 🔗 INTEGRATION NOTES

- Use same evidence schema as `GrowthPattern`, `StudentPortrait`
- PDF rendering can use Puppeteer, wkhtmltopdf, or browser-based print-to-PDF
- Google Drive export requires OAuth integration (optional phase)

---

### 📁 DATABASE TASKS

No schema changes needed. If needed, extend `PortfolioItem` and `Reflection` to include optional `teacherNote`.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

- Teacher selects: Alex, Term 1, Structure: by domain, Format: ZIP
- System generates:

  - HTML index.html with Literacy, Math, SEL sections
  - Embedded artifacts with date, title, and comments
  - Downloadable ZIP: “Alex_Term1_Portfolio.zip”

---

### 🚩 RISKS

- Must clearly separate system-generated vs teacher-added content
- Long documents must remain well-structured and scannable
- Parents/guardians may misinterpret data—include disclaimers where needed
