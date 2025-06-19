## ✅ TASK: Implement Family Engagement Dashboard

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **dashboard to track and support family communication** for each student. It provides teachers with a centralized place to log contact history, view engagement levels, identify under-contacted families, and prepare for SPTs and report cards with transparent, respectful engagement data.

---

### 🔹 GOAL

Allow teachers to:

- Log calls, messages, notes, or meetings with families
- Tag interactions by purpose (celebration, concern, check-in, etc.)
- View communication history per student
- Flag students with limited or no engagement
- Export summaries for reporting or SPT preparation

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Add family contact entries (with date, method, purpose, and notes)
  - See a chronological log per student
  - View class-wide contact heatmap (engagement frequency)
  - Filter contacts by purpose (e.g., concern, celebration)
  - Export individual or class engagement logs

---

### 🔧 BACKEND TASKS

#### 🟢 1. FamilyContact Model

```prisma
model FamilyContact {
  id          Int       @id @default(autoincrement())
  studentId   Int
  date        DateTime
  method      String     // "phone", "email", "meeting", "message"
  purpose     String     // "celebration", "concern", "check-in", "info"
  notes       String
  createdBy   Int        // teacherId
}
```

#### 🟢 2. API Endpoints

- `POST /api/family-contact` – log new contact
- `GET /api/family-contact/student/:id` – retrieve contact log
- `GET /api/family-contact/class-summary` – engagement matrix

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Student Contact Log

Component: `FamilyContactLog.tsx`

- Timeline view:

  - Date
  - Method (icon)
  - Purpose tag
  - Notes (truncated preview, expandable)

- Filters:

  - Contact type
  - Date range
  - Purpose

- Button: \[➕ Add Contact Entry]

#### 🔵 4. Add Contact Entry Form

Component: `ContactForm.tsx`

Fields:

- Student
- Date (default to today)
- Method (dropdown)
- Purpose (tag select)
- Freeform notes
- Button: \[💾 Save Entry]

#### 🔵 5. Class Engagement Heatmap

Component: `ClassContactMatrix.tsx`

- Table:

  - Rows: Students
  - Columns: Number of contacts, last contact date, # per purpose
  - 🔴 Highlight: No contact in 30+ days
  - 🟡 Highlight: Only concern-type contacts
  - 🟢 Highlight: Balanced contact

Optional: sparkline showing frequency over time

---

### 🔵 6. Export Tool

Component: `FamilyContactExport.tsx`

- Select: Student | Class | Term
- Output:

  - Contact dates
  - Purpose breakdown
  - Notes summary

- Formats: PDF, CSV, Markdown

---

### 🔗 INTEGRATION NOTES

- Pulls from:

  - Student Roster
  - Auth (to log which teacher made the entry)

- Should allow restricted view for families (future: Family Portal)
- Links to SPT Builder in Phase 5

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**POST /api/family-contact**

```json
{
  "studentId": 17,
  "date": "2025-03-05",
  "method": "phone",
  "purpose": "concern",
  "notes": "Discussed reading struggles and strategies for home practice.",
  "createdBy": 8
}
```

Rendered View:

> 📞 **Mar 5 – Concern (Phone)**
> 🧑‍🏫 Teacher: M. Wilson
> 📝 “Discussed reading struggles and strategies for home practice.”

Class Summary View:

| Student | Total Contacts | Last Contact | Celebrations | Concerns | 🔔 Flags      |
| ------- | -------------- | ------------ | ------------ | -------- | ------------- |
| Alex    | 4              | Mar 5        | 1            | 3        | 🟡 Unbalanced |
| Jamie   | 0              | —            | 0            | 0        | 🔴 No contact |

---

### 🚩 RISKS

- Sensitive data must be handled with care—ensure proper access controls
- Risk of inequitable engagement—tool should help highlight this, not entrench it
- Must not overwhelm teachers; entry must be quick and light-touch
