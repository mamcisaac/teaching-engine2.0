## ✅ TASK: Implement Family Communication Timeline

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **teacher-facing tool** to log and organize key points of contact with student families (e.g., messages, meetings, newsletters, progress updates, concerns, celebrations). The system helps maintain professional, documented, and consistent communication—particularly valuable in early years and bilingual contexts.

---

### 🔹 GOAL

Enable teachers to:

- Record any form of communication with a student’s family (message, meeting, note)
- Optionally attach files or notes
- Tag entries with purpose, method, language, and follow-up status
- View a **chronological timeline per student**
- Share selected entries with families when appropriate

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Log family interactions (with type, language, summary, file attachment)
  - Filter communications by purpose (celebration, concern, academic, attendance, general)
  - Track follow-ups or unanswered items
  - View per-student timeline (most recent first)
  - Generate summary (per term or year-end)

- Entries can be:

  - Private (teacher log only)
  - Shared with families (plain-language view)

- Export available (PDF/email)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `FamilyCommEntry` model

```prisma
model FamilyCommEntry {
  id           Int      @id @default(autoincrement())
  studentId    Int
  date         DateTime
  type         String   // "meeting", "message", "phone", "email", "newsletter"
  language     String   // "fr", "en", "bilingual"
  purpose      String   // "academic", "behavior", "celebration", "general"
  summaryFr    String?
  summaryEn    String?
  filePath     String?
  shared       Boolean  @default(false)
  requiresFollowUp Boolean @default(false)
  followUpDone Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name add_family_communication_log
npx prisma generate
```

#### 🟢 2. Add API endpoints

- `POST /api/students/:id/family-comm`
- `GET /api/students/:id/family-comm`
- `PATCH /api/family-comm/:entryId`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Communication Logger

Component: `FamilyCommLogger.tsx`

Inputs:

- Date/time (default to now)
- Method (select: phone, email, in-person, message, newsletter)
- Language of communication
- Purpose tag (dropdown)
- Summary (Fr + En fields)
- Upload attachment (optional)
- Toggles:

  - “🔒 Private” or “📤 Share with family”
  - “🔁 Follow-up required”

#### 🔵 4. Family Comm Timeline Viewer

Component: `FamilyCommTimeline.tsx`

- Vertical timeline sorted by date
- Each entry:

  - Icon (method)
  - Purpose tag
  - Summary preview (Fr/En)
  - File link (if attached)
  - Labels: ✅ Follow-up done / 🔁 Needed
  - If shared: “👁️ Visible to family”

Filters:

- Purpose
- Method
- Follow-up status
- Date range

#### 🔵 5. Export Summary Panel

Component: `FamilyCommExport.tsx`

- Export:

  - All logs (CSV)
  - Term summary (PDF, Markdown)
  - Shared entries only (for parent view)

---

### 🔗 INTEGRATION NOTES

- Store attachments under `/uploads/family-comm/{studentId}/`
- Shared entries shown in family portal if enabled (read-only)
- In shared views: use **plain-language summaries** with toggleable Fr/En fields

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Log entry:**

```http
POST /api/students/18/family-comm
{
  type: "phone",
  purpose: "celebration",
  language: "bilingual",
  summaryFr: "Emma a fait une belle lecture à voix haute aujourd’hui.",
  summaryEn: "Emma did a beautiful read-aloud today.",
  shared: true
}
```

Rendered View:

> 📞 **Phone Call** | Celebration | Bilingual | Feb 12
> Emma did a beautiful read-aloud today.
> 👁️ Shared with family | 🔁 No follow-up

---

### 🚩 RISKS

- Ensure privacy defaults to teacher-only; sharing must be explicit
- Language toggling (Fr/En) should be clean and readable
- Minimize extra teacher burden—enable bulk templates (e.g., “Week 2 Newsletter”)
