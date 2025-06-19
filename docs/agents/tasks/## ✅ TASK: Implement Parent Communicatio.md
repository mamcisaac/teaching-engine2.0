## ✅ TASK: Implement Parent Communication Center

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are implementing a communication system to help teachers **inform and engage parents** about what’s happening in the classroom. It must support **bilingual communication** (English and French), attach visuals or student work, and connect home with school by referencing curriculum and classroom themes.

---

### 🔹 GOAL

Build a communication tool that enables teachers to create and send regular newsletters, classroom updates, or individual notes home. Teachers should be able to include summaries of learning outcomes, photos/resources, and home activities. A bilingual preview/export option is essential.

---

### ✅ SUCCESS CRITERIA

- Teachers can create newsletters and messages linked to classroom activities or themes.
- Each message can include:

  - Title
  - Timeframe (week, month)
  - Text (manual or AI-suggested)
  - Linked outcomes/themes
  - Embedded media
  - Optional home activities

- Teachers can toggle between English and French views.
- Export options: PDF (print/email), copyable HTML/Markdown
- Eventually supports individual student logs (for future upgrade)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `ParentMessage` model

In `prisma/schema.prisma`:

```prisma
model ParentMessage {
  id           Int      @id @default(autoincrement())
  userId       Int
  title        String
  timeframe    String   // "week" | "month" | custom
  contentFr    String
  contentEn    String
  linkedOutcomes Outcome[] @relation("ParentMessageOutcomes")
  linkedActivities Activity[] @relation("ParentMessageActivities")
  createdAt    DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name add_parent_messages
npx prisma generate
```

#### 🟢 2. Add API routes

- `POST /api/parent-messages`
- `GET /api/parent-messages`
- `GET /api/parent-messages/:id`
- `DELETE /api/parent-messages/:id`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Build Message Editor

Component: `ParentMessageEditor.tsx`

- Inputs:

  - Title
  - Timeframe selector (auto-fills week/month)
  - Rich text editor for French and English
  - Outcome selector (multi)
  - Activity selector (multi)
  - Embed Resource (reuse from Visual Resource Organizer)
  - Suggested Home Activities (optional textarea or AI helper)

- Auto-translate option:

  - Toggle “↔ Auto-translate from French to English”
  - Use LibreTranslate API or mock implementation for now

#### 🔵 4. Create Preview & Export Component

Component: `ParentMessagePreview.tsx`

- Preview:

  - Side-by-side French & English views
  - Embedded visuals
  - Linked outcomes (summarized)

- Export:

  - Button: “Download PDF” (use `html2pdf.js` or similar)
  - Button: “Copy HTML”
  - Button: “Print-friendly”

#### 🔵 5. Weekly Integration

In `WeeklyPlanner.tsx`:

- Button: “📰 Create Newsletter”
- Prefill form with:

  - Activities for the week
  - Thematic unit (if active)
  - Outcomes marked as covered

Render link in planner summary:

```jsx
📬 Parent Newsletter (Week of Jan 12) — [View] [Export PDF]
```

---

### 🔗 INTEGRATION NOTES

- Content should persist as Markdown + raw HTML for email/export.
- Outcomes should be summarized in plain language (e.g. "We practiced numbers 1–10").
- Newsletter content is not public—teachers control visibility/export manually.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Create Newsletter:**

```http
POST /api/parent-messages
{
  title: "Week of Jan 12 – Exploring Winter",
  timeframe: "2026-01-12 to 2026-01-19",
  contentFr: "Cette semaine, nous avons exploré le thème de l'hiver...",
  contentEn: "This week, we explored the theme of winter...",
  linkedOutcomeIds: [4, 7],
  linkedActivityIds: [13, 18]
}
```

**Preview Display:**

```markdown
🇫🇷 Cette semaine, nous avons appris les mots liés à l'hiver...
🇬🇧 This week, we explored winter-related vocabulary...

🎯 Outcomes covered:

- Use winter words in oral sentences
- Sequence events in a story

🏡 Home Tip:
Try asking your child: “Que vois-tu dehors aujourd’hui?”
```

---

### 🚩 RISKS

- Keep interface lightweight — avoid requiring full translations if teacher prefers single-language use.
- Ensure PDF/HTML output is formatted cleanly for families.
- Avoid linking to restricted/private resources in public messages.
