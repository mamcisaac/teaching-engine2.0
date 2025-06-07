# Curriculum Planner MVP – TODO

> **Scope of this list**
> *Phase 0 → Phase 3 bring the project to a fully-running, locally stored single-teacher planner that lets a user create Subjects → Milestones → Activities and persist them in SQLite through a simple React UI.*
> Later phases (Weekly planner automation, resource packs, newsletters, sub-plan generator, etc.) are stubbed but **intentionally postponed** until the core is solid and tested.

---

## Legend

| Emoji | Meaning                     |
| ----- | --------------------------- |
| 🆕    | create a new file / package |
| ✏️    | modify existing code        |
| ✅     | add tests                   |
| 🔧    | tooling / CI                |

---

## Phase 0 – Repo & Tooling (Scaffolding)

* [ ] 🆕 **`/README.md`** – 2-minute project overview + local run steps.
* [ ] 🆕 **Monorepo skeleton**

  * `/server` (Node 18 + Express + TypeScript)
  * `/client` (React 18 + Vite + TypeScript)
  * Root `package.json` using **npm workspaces**.
* [ ] 🔧 **Lint, format, commit hooks**

  * ESLint + Prettier configs shared by both workspaces.
  * Husky + lint-staged to run `eslint --fix` on commit.
* [ ] 🔧 **Task runner scripts**

  ```bash
  # root
  npm run dev        # concurrently dev-server & dev-client
  npm run build      # full production build
  npm run test       # full test suite
  ```
* [ ] 🔧 **CI** – GitHub Actions that install, lint, build, and test on `push` + PR.

---

## Phase 1 – Backend (API + DB)

### 1.1 Domain & persistence

* [ ] 🆕 Add **SQLite** file‐based DB in `/server/db/database.sqlite`.
* [ ] 🆕 **Prisma ORM** setup with three models:

  ```prisma
  model Subject   { id Int @id @default(autoincrement())  name String  milestones Milestone[]  }
  model Milestone { id Int @id @default(autoincrement())  title String  subjectId Int  subject Subject @relation(fields:[subjectId],references:[id])  activities Activity[]  targetDate DateTime?  estHours Int? }
  model Activity  { id Int @id @default(autoincrement())  title String  milestoneId Int  milestone Milestone @relation(fields:[milestoneId],references:[id])  durationMins Int?  privateNote String?  publicNote String? }
  ```
* [ ] 🆕 Seed script that inserts **demo data** (2 subjects, each with 1 milestone & 1 activity).

### 1.2 REST API

* [ ] 🆕 Express boilerplate in `/server/src/index.ts`.
* [ ] 🆕 CRUD routes (JSON):

  * `GET /api/subjects`, `POST /api/subjects`, `PUT /api/subjects/:id`, `DELETE …`
  * same pattern for milestones and activities.
* [ ] ✅ Unit tests with **Jest** + **supertest** for all endpoints (happy path + simple 404).
* [ ] 🆕 Basic CORS & error-handling middleware.

---

## Phase 2 – Frontend (UI MVP)

### 2.1 Foundation

* [ ] 🆕 Vite React template → `/client`.
* [ ] 🆕 **Global style**: Tailwind CSS.
* [ ] ✏️ Add Axios client (`/client/src/api.ts`) pointed at `http://localhost:3000/api`.

### 2.2 Pages & components

| Route             | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `/`               | redirect → `/subjects`                            |
| `/subjects`       | list subjects + “Add Subject” modal               |
| `/subjects/:id`   | show milestones for subject, plus “Add Milestone” |
| `/milestones/:id` | list activities, plus “Add Activity”              |

* [ ] 🆕 **SubjectList** component
* [ ] 🆕 **MilestoneList** component showing `% complete` (activities done / total).
* [ ] 🆕 **ActivityList** with editable private/public notes fields.
* [ ] 🆕 **Basic form modals** (headless UI or shadcn/ui) for create/update.
* [ ] 🆕 Toast notifications on CRUD success/error.

### 2.3 State & data access

* [ ] 🆕 React Query (TanStack) for caching server calls.
* [ ] 🆕 Simple `useAuthlessApi` – no login yet, but isolates future auth.

### 2.4 Front-end tests

* [ ] ✅ Component tests with **Vitest + React Testing Library** for each list component.
* [ ] ✅ E2E smoke test with **Playwright**: create subject → milestone → activity; verify DB row exists.

---

## Phase 3 – Glue & Quality Gate

* [ ] ✏️ **Hook up “Mark Activity Done”**

  * toggle checkbox → PATCH `/activities/:id` (`completedAt` datetime column added via migration).
* [ ] ✅ Add jest test to ensure progress % updates correctly.
* [ ] 🆕 **Simple progress bar** on Subject & Milestone cards (client-side calc).
* [ ] 🆕 **Dockerfile** at root to run full stack for testers:

  ```Dockerfile
  FROM node:18
  WORKDIR /app
  COPY . .
  RUN npm i
  RUN npm run build
  CMD ["npm","run","start"]
  ```
* [ ] 🔧 **Release script** – `npm version && git tag` + GitHub Release on main.

> **Exit criteria for MVP**
>
> 1. `docker compose up` starts server & client.
> 2. Teacher can create / view / edit / delete Subjects → Milestones → Activities.
> 3. Can mark an Activity done and see progress bars update.
> 4. All unit, component, and e2e tests pass in CI.

---

## Phase 4 – Next Iteration Backlog (defer until MVP passes QA)

* Weekly planner engine & timetable UI.
* Resource checklist & file uploads.
* Progress alerts & pacing guides.
* Newsletter generator (public notes + images).
* Emergency sub-plan generator.
* Auth & multi-user support.
* Cloud backup / sync.

*(Create a separate issue board once Phase 0-3 are merged.)*

---

### Helpful Commands Cheat-Sheet (for the agent)

```bash
# bootstrap
npm i -g pnpm            # or stick with npm
pnpm install             # root – installs workspaces

# run dev
pnpm run dev             # concurrently: server on 3000, client on 5173

# prisma
pnpm --filter server prisma migrate dev --name init
pnpm --filter server prisma studio   # DB inspector

# tests
pnpm run test            # all workspaces
pnpm --filter server test
pnpm --filter client test
```

---

Happy coding — ship the core, test it hard, then circle back for the “smart” features!
