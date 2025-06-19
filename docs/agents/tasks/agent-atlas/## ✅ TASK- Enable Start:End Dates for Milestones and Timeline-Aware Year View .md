## ✅ TASK: Enable Start/End Dates for Milestones and Timeline-Aware Year View

---

### 🔹 GOAL

Teachers must be able to define a **start and end date** for each milestone (unit), and the **Year-at-a-Glance view** must display them in correct chronological order based on actual dates.

---

### ✅ SUCCESS CRITERIA

- Milestone schema includes `startDate` and `endDate` (optional).
- API supports setting and retrieving these values.
- Date validation is enforced (start ≤ end).
- UI modal for editing/creating milestones includes date pickers.
- Milestones display in the Year view along a real calendar timeline (by week).
- Sort order in milestone dropdowns and dashboards respects `startDate`.

---

### 🔧 BACKEND TASKS

#### 🟢 1. Extend Prisma schema

Update `prisma/schema.prisma` → `Milestone` model:

```ts
startDate DateTime?
endDate   DateTime?
```

Run:

```bash
npx prisma migrate dev --name add_milestone_dates
npx prisma generate
```

#### 🟢 2. Update milestone routes

File: `server/src/routes/milestone.ts`

- Modify `POST /api/milestones` and `PUT /api/milestones/:id` to accept:

  ```ts
  startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
  endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
  ```

- Confirm that `GET` routes already return these fields.

#### 🟢 3. Add validation

File: `server/src/validation.ts`

- Update `milestoneCreateSchema` and `milestoneUpdateSchema`:

  ```ts
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ```

- Add a `.refine()` rule to ensure:

  ```ts
  new Date(startDate) <= new Date(endDate);
  ```

#### 🟢 4. Add server-side sorting

If `GET /api/milestones` doesn't sort:

```ts
orderBy: {
  startDate: 'asc';
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 5. Extend milestone modals

Files:

- `client/src/components/YearAtAGlanceComponent.tsx`

- `client/src/components/MilestoneList.tsx`

- Add two `<input type="date">` elements for `startDate` and `endDate`.

- Manage with React state.

- Submit in the form payload to `createMilestone` and `updateMilestone`.

#### 🔵 6. Update Year-at-a-Glance layout logic

File: `client/src/components/YearAtAGlanceComponent.tsx`

Replace placeholder month logic (e.g. `id % 10`) with real calendar timeline:

- Create a horizontal timeline view from Sept–June, split by weeks.

- Compute milestone positions and spans using:

  ```ts
  const start = new Date(milestone.startDate);
  const end = new Date(milestone.endDate);
  const weekIndex = getWeekIndexFromSchoolYear(start);
  const span = getWeekSpan(start, end);
  ```

- Render each milestone as a bar/block across the correct weeks.

#### 🔵 7. Add fallback for legacy milestones

- If `startDate` or `endDate` is missing, display in an “Unscheduled” zone.
- On milestone list views, sort milestones: `undefined` dates → bottom.

---

### 🔗 INTEGRATION NOTES

- Milestones without dates must not break UI.
- This change is backward-compatible.
- Later systems (e.g. auto-fill planner) will use these dates for logic.
- Use subject colors consistently in timeline rendering.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

```js
// Create milestone: "Winter Unit"
POST /api/milestones
{
  title: "Winter Unit",
  startDate: "2026-01-15",
  endDate: "2026-02-05",
  ...
}

// Expect GET response:
{
  title: "Winter Unit",
  startDate: "2026-01-15T00:00:00.000Z",
  endDate: "2026-02-05T00:00:00.000Z",
  ...
}
```

**Visual test:** In Year-at-a-Glance, "Winter Unit" spans 3 weeks starting January 15.

---

### 🚩 RISKS

- Do not hardcode month labels. Base everything on `startDate`/`endDate`.
- Ensure sorting, visual layout, and logic tolerate `null` values.
