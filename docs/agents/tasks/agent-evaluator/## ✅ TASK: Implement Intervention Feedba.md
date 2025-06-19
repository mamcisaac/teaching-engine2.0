## ✅ TASK: Implement Intervention Feedback Loop Enhancer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **loop-based system for tracking student interventions** (academic or behavioral), including the reason for concern, action taken, timing, follow-up results, and whether further support is required. The system allows teachers to document interventions, monitor student response, and ensure structured escalation to supports such as SPT.

---

### 🔹 GOAL

Allow teachers to:

- Log instructional or behavioral concerns and interventions
- Specify the strategy used and link it to outcomes/domains
- Set a follow-up check-in date
- Record post-intervention status (improved, unchanged, escalated)
- Export summaries for SPTs, IEP prep, or parent communication

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create and manage intervention records for any student
  - Specify concern type (academic, behavioral, social)
  - Link to outcomes, domains, themes
  - Specify one or more response strategies
  - Schedule check-ins and record observed response
  - Mark intervention as resolved or escalate to support team

- Generate printable reports of intervention history per student

---

### 🔧 BACKEND TASKS

#### 🟢 1. Intervention Model

```prisma
model Intervention {
  id           Int       @id @default(autoincrement())
  studentId    Int
  domain       String
  outcomeIds   Int[]
  theme        String?
  concernType  String     // "academic" | "behavioral" | "social"
  description  String
  strategy     String
  createdAt    DateTime   @default(now())
  checkInDate  DateTime
  followUp     String?    // summary of what happened
  status       String     // "pending" | "resolved" | "escalated"
}
```

#### 🟢 2. API Endpoints

- `POST /api/interventions` – create new
- `PATCH /api/interventions/:id` – update status/follow-up
- `GET /api/interventions?student=14&term=Term2`
- `GET /api/interventions/class-summary?term=Term2`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Intervention Manager Panel

Component: `InterventionTracker.tsx`

- Table of active and past interventions
- Columns: Student, Concern, Strategy, Status, Check-in Date
- \[➕ Add New] \[✅ Mark as Resolved] \[📤 Export]

Filters:

- Student
- Domain
- Concern type
- Term/status

#### 🔵 4. Intervention Entry Form

Component: `InterventionForm.tsx`

Fields:

- Concern type + description
- Domain + outcome link
- Theme (optional)
- Response strategy
- Check-in date
- \[Save + Set Reminder]

#### 🔵 5. Follow-Up Flow

Button: \[📝 Record Follow-Up]

- Fields:

  - Follow-up notes
  - Outcome (Improved / Unchanged / Escalated)
  - Update status

Optional button: \[📎 Link to SPT Export]

#### 🔵 6. SPT Export Summary

Component: `SPTPrepExport.tsx`

- Student intervention history (Term 1–3)
- Tables of:

  - Concerns raised
  - Actions taken
  - Response summaries

- Printable + Markdown/PDF export

---

### 🔗 INTEGRATION NOTES

- Connects to:

  - Outcome Matrix (for concern/outcome linking)
  - SPT System (if escalation occurs)
  - Planner (optionally tag intervention-aligned activities)

- Future: auto-suggest strategies based on outcome/concern type

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**POST /api/interventions**

```json
{
  "studentId": 14,
  "domain": "math",
  "outcomeIds": [32],
  "concernType": "academic",
  "description": "Struggling with number sense in subtraction",
  "strategy": "1-on-1 math lab + manipulatives",
  "checkInDate": "2025-04-10"
}
```

Rendered Panel:

> 🎯 **Student:** Alex | 📘 Math – Subtraction
> ❗ Concern: Struggling with number sense
> 🛠️ Strategy: Manipulatives + 1-on-1
> ⏳ Follow-Up Due: Apr 10
> \[📝 Add Follow-Up] \[✅ Resolved] \[📤 Export]

---

### 🚩 RISKS

- Teachers may forget to follow up—consider dashboard reminders
- Must be fast and easy to use or it won’t be adopted
- Escalation pathways should integrate into existing SPT workflows (later phase)
