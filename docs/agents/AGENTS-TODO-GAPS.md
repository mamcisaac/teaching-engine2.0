> **Scope:** Close all Phase 0‑4 gaps and raise system quality to “Implementation Plan ++” level.
> **Owner:** AI Coding Agent
> **Deadline for PRs:** staged over _Sprint Δ_ (≈ 2 weeks), see individual tasks.
> **Branch naming:** `fix/<task‑id>-<slug>`.

---

## 1  Enrich Curriculum Data Models

| ID       | Title                                                 | Priority | ETA   |
| -------- | ----------------------------------------------------- | -------- | ----- |
| **C‑01** | _Add milestone.description + milestone.standardCodes_ | P1       | 0.5 d |

### Why

The plan expects rich objectives and curriculum‑standard cross‑walks; current schema lacks both.

### Steps

1. **DB migration** (`prisma/migrations/YYYYMMDD_add_milestone_description`):

   ```prisma
   model Milestone {
     id          Int      @id @default(autoincrement())
     ...
     description String?  @db.Text      // NEW — rich objective text
     standardCodes String[] @db.String  // NEW — array of e.g. “ELA1.4”, “PEI‑Math‑1.2”
   }
   ```

2. **Backend**

   - Extend DTO & zod schema (`/server/src/validation/milestone.ts`).
   - Update CRUD controller & service.
   - Add optional filter `?standards=ELA1.4` on `GET /milestones`.

3. **Frontend**

   - In _MilestoneForm_ add `<Textarea>` and a _StandardsTagInput_ (chips).
   - Show description in MilestoneCard hover / expand panel.

4. **Tests**

   - Unit test: description ≤ 10 000 chars accepted; array length ≤ 10.
   - E2E: create Milestone with 2 codes → retrieve → matches.

5. **Docs**: update README DB diagram.

### Success

✔ New fields exposed via API, editable in UI, and visible in cards.
✔ Existing data remains intact (migration is additive & optional).

---

## 2  Support Ordered Activities & Drag‑Drop Re‑sequencing

| ID       | Title                                        | Priority | ETA |
| -------- | -------------------------------------------- | -------- | --- |
| **C‑02** | _Introduce activity.orderIndex & UI reorder_ | P1       | 1 d |

1. **DB**: `orderIndex Int @default(0)` on `Activity`; composite index `(milestoneId, orderIndex)`.
2. **API**

   - New endpoint `PATCH /activities/reorder` accepting `{activityIds: number[]}` for a milestone.

3. **Front‑end**

   - Use `@dnd-kit/sortable` to enable vertical drag within the activity list.
   - Optimistic UI; rollback on 4xx.

4. **Tests**: Cypress drag → order persists after page reload.
5. **Success**: Teacher can drag activities to change sequence; curriculum planner reflects order.

---

## 3  Weekly Planner Enhancements

| ID        | Sub‑task                               | Priority | ETA   |
| --------- | -------------------------------------- | -------- | ----- |
| **WP‑01** | _Filter & preference UI_               | P1       | 1 d   |
| **WP‑02** | _Conflict detection (duration > slot)_ | P1       | 0.5 d |
| **WP‑03** | _Holiday / non‑instructional days_     | P2       | 1 d   |

### WP‑01  Filter Panel

- Add right‑sidebar with check‑boxes (“Hands‑on”, “Worksheet”, “Video”, “No‑Equipment”).
- `planningEngine` respects `filters` param when regenerating suggestions.
- Persist UI state in `localStorage`.

### WP‑02  Conflict Detection

- During drop, compute `activity.durationMins > slot.durationMins` → show red border + tooltip.
- On “AutoFill”, skip conflicting suggestions and log alert in Notification Center.

### WP‑03  Holiday Calendar

- Add `Holiday` table (`id, date, name`).
- Simple UI in _Settings > Calendar_ to add/remove dates.
- `planningEngine` treats holiday slots as blocked.

**Success**
✔ Teachers can filter, are warned of over‑long lessons, and system avoids scheduling on holidays.

---

## 4  Resource Module Upgrades

| ID       | Title                                 | Priority | ETA   |
| -------- | ------------------------------------- | -------- | ----- |
| **R‑01** | _Structured “Materials Needed” field_ | P1       | 0.5 d |
| **R‑02** | _Bulk download / print week packet_   | P2       | 0.5 d |

### R‑01  

- `Activity.materialsText String?`
- UI: comma‑separated chips input; autopopulates MaterialList even if no file uploaded.

### R‑02  

- New endpoint `GET /weeks/:id/resources.zip` – streams zip of all linked files.
- “Print All PDFs” button triggers server‑side concat via `pdf-lib`.

---

## 5  Notes: Prompts & Aggregated View

| ID       | Title                         | Priority | ETA    |
| -------- | ----------------------------- | -------- | ------ |
| **N‑01** | _Post‑completion note prompt_ | P1       | 0.25 d |
| **N‑02** | _Reflection dashboard_        | P2       | 0.75 d |

- After marking `Activity.completedAt`, modal: “Any reflections?” with tabs _(Private / Public)_.
- New route `/reflections` — list & filter by subject, date, keyword.

Success: ≥ 80 % of Playwright run passes with note modal visible after completion.

---

## 6  Emergency Sub Plan Intelligence

| ID       | Title                                  | Priority | ETA    |
| -------- | -------------------------------------- | -------- | ------ |
| **S‑01** | _Fallback activity library_            | P2       | 0.75 d |
| **S‑02** | _Class‑info form & multi‑day selector_ | P2       | 0.5 d  |

- Seed JSON (`/server/seed/fallbackActivities.json`) by subject.
- Generator rule: if `activity.isSubFriendly === false` or none scheduled, inject fallback.
- UI: _Settings > Substitute Info_ form (procedures, allergies, etc.).
- Emergency button opens date‑picker (1‑3 days).

---

## 7  Backup / Export

| ID       | Title                           | Priority | ETA   |
| -------- | ------------------------------- | -------- | ----- |
| **B‑01** | _One‑click local backup (.zip)_ | P1       | 0.5 d |

- Server route `GET /backup` → zip `database.sqlite` + `/uploads/*` + `.env` (minus secrets).
- Front‑end button under _Settings > Data_.
- Success: Downloaded file restores app when unzipped into fresh install.

---

## 8  Authentication (Optional until Cloud)

| ID       | Title                 | Priority | ETA   |
| -------- | --------------------- | -------- | ----- |
| **A‑01** | _JWT auth, hashed pw_ | P3       | 1.5 d |

- Use `argon2` hashing.
- Login page, protected routes.
- Seed default user if none exists.
- Wrap with feature flag `ENABLE_AUTH=true`.

---

## 9  Newsletter 2.0 – **LLM‑Polished Drafts**

| ID        | Title                        | Priority | ETA |
| --------- | ---------------------------- | -------- | --- |
| **NL‑01** | _Integrate LLM rewrite step_ | **P1**   | 1 d |

### Why

Current template output is grammatically fine but bland. Plan calls for personable, publication‑ready prose.

### Implementation

1. **Service Layer** (`/server/src/services/newsletterLLM.ts`):

   - Accept raw template HTML/markdown + meta (tone, length).
   - Call OpenAI Chat Completion (`model="gpt-4o-mini"`, or env override).
   - Prompt:

     ```
     You are an elementary‑school newsletter editor...
     Rewrite the supplied draft for clarity, warmth, parent‑friendly tone...
     ```

   - Return polished markdown.

2. **Pipeline Changes**

   - `newsletterGenerator.ts` → after Handlebars render → call `newsletterLLM.rewrite()` → store both **rawDraft** & **polishedDraft**.
   - Expose `?version=polished|raw` param on `/api/newsletters/:id/:format`.

3. **Frontend**

   - NewsletterEditor: toggle switch “Show polished version”.
   - When generating, show progress bar (“Polishing with AI … may take 5‑10 s”).
   - If LLM quota/env‑var missing, gracefully fall back to raw draft and warn user.

4. **Testing**

   - Mock LLM call in unit tests; ensure pipeline continues on 429/500.
   - E2E: create newsletter, verify polished version differs from raw ≥ 20 % by Levenshtein distance.

5. **Security / Cost Controls**

   - `.env` key `OPENAI_API_KEY`.
   - Rate‑limit 3 calls / hour / user.
   - Log tokens used.

**Success**
✔ Polished newsletter button produces enriched prose with minimal teacher edits.
✔ Fallback path handles API failure.

---

## 10  Misc. Dev Ops & Docs

| ID       | Title                          | Priority | ETA    |
| -------- | ------------------------------ | -------- | ------ |
| **D‑01** | _Perf audit & lazy‑loading_    | P2       | 0.5 d  |
| **D‑02** | _Update User Guide + tooltips_ | P1       | 0.75 d |

### Acceptance Matrix

| Task  | Unit Tests | Integration | E2E | Docs |
| ----- | ---------- | ----------- | --- | ---- |
| C‑01  | ✔         |             |     | ✔   |
| C‑02  | ✔         | ✔          | ✔  | ✔   |
| WP‑01 | ✔         | ✔          | ✔  | ✔   |
| WP‑02 | ✔         | ✔          | ✔  | ✔   |
| WP‑03 | ✔         |             | ✔  | ✔   |
| R‑01  | ✔         |             | ✔  | ✔   |
| R‑02  | ✔         |             | ✔  | ✔   |
| N‑01  | ✔         |             | ✔  | ✔   |
| N‑02  | ✔         |             | ✔  | ✔   |
| S‑01  | ✔         |             | ✔  | ✔   |
| S‑02  | ✔         |             | ✔  | ✔   |
| B‑01  | ✔         |             | ✔  | ✔   |
| A‑01  | ✔         | ✔          | ✔  | ✔   |
| NL‑01 | ✔         | ✔          | ✔  | ✔   |
| D‑01  | n/a        |             |     | ✔   |
| D‑02  | n/a        |             |     | ✔   |

---

### Sprint Sequencing Advice

1. **Week 1**

   - C‑01, C‑02, WP‑01, WP‑02, R‑01, N‑01, NL‑01

2. **Week 2**

   - WP‑03, R‑02, N‑02, S‑01, S‑02, B‑01, D‑02

3. **Week 3 (stretch)**

   - A‑01, D‑01 + polish / bug‑fix cycle

---

> **Ready for execution.** > **Next action for agent:** create branch `docs/agents_fixes_todo`, commit this file, open PR tagged **#fix‑roadmap** for team review.

---
