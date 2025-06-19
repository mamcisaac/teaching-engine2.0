## ✅ TASK: Implement Theme-to-Outcome Planning Mapper

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a tool that supports teachers in **planning thematic units** by clearly linking each theme to relevant curriculum outcomes. This ensures that thematic inquiry (e.g., on _weather_, _friendship_, _animals_) results in documented, outcome-driven instruction—and prevents overlooked domains during creative planning.

---

### 🔹 GOAL

Enable teachers to:

- Select or define themes for a unit, week, or day
- Browse or auto-suggest relevant outcomes (in French or English)
- Track which themes address which outcomes across the year
- Visualize coverage to avoid gaps or redundancies

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - View all current themes in use (class-level or term-level)
  - For each theme, map associated outcomes (linked manually or suggested)
  - Add notes or rationale (e.g., “This connects via our oral storytelling circle.”)

- The system shows:

  - Outcomes **with no theme coverage**
  - Themes **not linked to outcomes** (risk of low alignment)
  - A **theme-to-outcome heatmap** or matrix

---

### 🔧 BACKEND TASKS

#### 🟢 1. Update `Theme` model

Add relationship to outcomes:

```prisma
model Theme {
  id         Int      @id @default(autoincrement())
  labelFr    String
  labelEn    String
  startDate  DateTime?
  endDate    DateTime?
  outcomeIds Int[]
  notes      String?
  createdAt  DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name link_themes_to_outcomes
npx prisma generate
```

#### 🟢 2. Add API endpoints

- `GET /api/themes?includeOutcomes=true`
- `PATCH /api/themes/:id/link-outcomes`
- `GET /api/audit/theme-outcome-matrix`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Theme-Outcome Mapper Interface

Component: `ThemeOutcomeMapper.tsx`

- Show list/grid of active themes
- For each:

  - Editable list of linked outcomes
  - Add outcomes (autocomplete or suggest by tag)
  - Add rationale or notes

- “Add new theme” form (if needed)

#### 🔵 4. Coverage Matrix or Heatmap

Component: `ThemeOutcomeMatrix.tsx`

- Rows: Curriculum outcomes (grouped by domain)
- Columns: Themes (e.g., Fall, Friendship, Community Helpers)
- Cells:

  - ✔️ if theme addresses the outcome
  - ⚠️ blank if no coverage
  - Hover → show notes or activity count

Buttons:

- “🧭 Suggest gaps to address next”
- “🧩 View lesson examples for this outcome”

---

### 🔗 INTEGRATION NOTES

- Use consistent outcome labeling as in planner, dashboard, and audit views
- Optionally allow outcome linkage directly from activity planning interface
- Future: support **theme bundles** (e.g., saved thematic units with built-in mappings)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Map Outcome to Theme:**

```http
PATCH /api/themes/4/link-outcomes
{
  outcomeIds: [13, 21, 27]
}
```

Rendered Matrix Cell:

| Outcome | Fall | Winter | Animals |
| ------- | ---- | ------ | ------- |
| CO.13   | ✔️   | ❌     | ✔️      |
| CO.21   | ⚠️   | ✔️     | ✔️      |

Hover:

> **Winter → CO.21**
> “Linked via winter clothes vocabulary and storytelling.”

---

### 🚩 RISKS

- Must avoid turning this into checklist planning—support exploratory, creative inquiry with loose links
- Teachers may need help finding outcome connections—consider integrating AI suggesters
- Ensure bilingual usability: theme labels and outcome descriptors must support Fr/En toggling
