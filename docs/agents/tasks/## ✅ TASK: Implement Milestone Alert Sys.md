## ✅ TASK: Implement Milestone Alert System

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a smart alerting tool that **proactively monitors progress** through the curriculum and flags risks when certain outcomes, assessments, or themes are falling behind schedule. This helps early-career teachers keep pace with the PEI Grade 1 French Immersion curriculum over the full school year.

---

### 🔹 GOAL

Automatically analyze progress-to-date and **surface alerts** for outcomes or themes that are:

- Not yet introduced
- Rarely addressed
- Not assessed by their expected milestone date

Alerts should appear as **gentle nudges** within the dashboard or planner.

---

### ✅ SUCCESS CRITERIA

- System tracks:

  - Target milestone dates for outcomes (e.g. “CO.14 should be introduced by Oct 15”)
  - Expected assessments per outcome/theme
  - Minimum expected coverage frequency

- Alerts appear when:

  - An outcome is unaddressed past its milestone
  - A theme has no activities in its scheduled window
  - A core strand (e.g. oral language) is underrepresented in planning

- Alerts are:

  - Visible but non-disruptive
  - Dismissible or snoozable
  - Linked to remediation options (e.g. “Add activity now”)

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `MilestoneDefinition` reference table

In `prisma/schema.prisma`:

```prisma
model MilestoneDefinition {
  id         Int      @id @default(autoincrement())
  outcomeId  Int?
  themeId    Int?
  dueDate    DateTime
  minCoverageCount Int?
  minAssessmentRequired Boolean @default(false)
}
```

Seed file example:

```ts
// CO.14 should be introduced by Oct 15 and assessed once by Nov 30
{
  outcomeId: 14,
  dueDate: "2026-10-15T00:00:00.000Z",
  minCoverageCount: 1,
  minAssessmentRequired: true
}
```

#### 🟢 2. Add `GET /api/alerts/milestones?classId=xx` endpoint

Return array:

```json
[
  {
    "type": "outcome_missed",
    "outcomeId": 14,
    "message": "Outcome CO.14 has not been introduced. Target date: Oct 15.",
    "severity": "warning"
  },
  {
    "type": "underassessed_domain",
    "domain": "Oral Language",
    "message": "Only 1 oral language assessment logged. Expect ≥ 3 by now.",
    "severity": "notice"
  }
]
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Milestone Alert Card

Component: `MilestoneAlertCard.tsx`

Display:

- 🔔 Alert icon + brief message
- Tag (Outcome, Theme, Domain)
- Date (target or overdue)
- Severity icon (color-coded)
- Button: “View Suggestions” → opens planner filtered to that gap

#### 🔵 4. Dashboard & Planner Integration

- Class Dashboard:

  - Alert badge if ≥1 active alerts
  - “📅 Milestone Alerts” sidebar or card

- Planner View:

  - Alert ribbon at top
  - Filter: “Show overdue outcomes/themes”

Optional: let teachers dismiss or snooze alerts until a later date.

---

### 🔗 INTEGRATION NOTES

- This does **not block planning**; it simply guides attention.
- Alerts should be teacher-specific, not visible to students or families.
- Add toggle to disable alerts or suppress minor ones (e.g. frequency-based only).

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Return overdue alert:**

```json
{
  "type": "outcome_missed",
  "outcomeId": 12,
  "message": "Outcome CO.12 was expected by Oct 1 but has not been addressed.",
  "severity": "warning"
}
```

**Rendered Card:**

> ⚠️ **Outcome CO.12 not yet introduced**
> Target: Oct 1 | Status: ❌
> ➕ Plan activity | 📖 View outcome details | ⏰ Snooze

---

### 🚩 RISKS

- Teachers may feel overwhelmed if alerts are too frequent or harsh—tone must remain supportive.
- Must distinguish between critical alerts (missed milestones) vs. gentle trends (underuse).
- Avoid auto-fixing; always leave decisions with teacher.
