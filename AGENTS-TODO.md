# Curriculum Planner MVP – TODO

> **Purpose of this file**
> This is the *single* file you add to a brand‑new GitHub repository.  A coding agent will read each task sequentially, check items off, and push code until the Minimum Viable Product (MVP) runs end‑to‑end.  All information needed to complete the tasks (including a full README template) is embedded below, so the agent never has to ask “what goes in this file?”.

---

## Legend

| Emoji | Meaning                     |
| ----- | --------------------------- |
| 🆕    | create a new file / package |
| ✏️    | modify existing code        |
| ✅     | add tests                   |
| 🔧    | tooling / CI                |
| 📄    | documentation               |

---

## Phase 0 — Repository Scaffolding & Docs

1. 🆕 **Initialize repo & workspace layout**

   * `git init`, commit this **TODO.md**.
   * Add a root `.gitignore` (use `gitignore/node` + `.env`).

2. 🆕 **Monorepo structure (npm workspaces)**

   ```text
   .
   ├── client/   # React 18 + Vite + TS
   ├── server/   # Node 18 + Express + TS
   ├── prisma/   # Prisma schema & migrations
   └── scripts/  # one‑off dev scripts
   ```

3. 📄 **`README.md`** — *create now using the template below*

   * Copy the **entire code block** titled **README TEMPLATE** verbatim into `/README.md`.
   * Replace the `<PROJECT_URL>` placeholder once the repo has a remote.

4. 📄 **`LICENSE`** — MIT license (year 2025, author *University of Prince Edward Island*).

5. 🔧 **Tooling**

   * Root ESLint + Prettier configs shared via `overrides`.
   * Husky + lint‑staged: run `eslint --fix` & `prettier --write` on staged files.
   * Root scripts:

     ```json5
     {
       "scripts": {
         "dev": "concurrently -k \"npm:start --workspace=server\" \"npm:start --workspace=client\"",
         "build": "npm run build --workspace=server && npm run build --workspace=client",
         "test": "npm run test --workspaces"
       }
     }
     ```

6. 🔧 **CI** — `.github/workflows/ci.yml`:

   * Matrix: {node 18, node 20}
   * Steps: `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run build`, `pnpm run test`.

---

## Phase 1 — Backend API

### 1.1 Persistence

* 🆕 Install **Prisma** + SQLite.
* 🆕 Create `prisma/schema.prisma` with models:

  ```prisma
  model Subject   {
    id          Int         @id @default(autoincrement())
    name        String
    milestones  Milestone[]
    createdAt   DateTime    @default(now())
  }
  model Milestone {
    id          Int         @id @default(autoincrement())
    title       String
    subjectId   Int
    subject     Subject     @relation(fields:[subjectId],references:[id])
    activities  Activity[]
    targetDate  DateTime?
    estHours    Int?
  }
  model Activity  {
    id          Int         @id @default(autoincrement())
    title       String
    milestoneId Int
    milestone   Milestone   @relation(fields:[milestoneId],references:[id])
    durationMins Int?
    privateNote  String?
    publicNote   String?
    completedAt  DateTime?
  }
  ```
* 🆕 `pnpm prisma migrate dev --name init`.
* 🆕 Seed script `scripts/seed.ts` inserts demo data (2 subjects → 1 milestone each → 1 activity). Add `npm run seed`.

### 1.2 REST API (Express + TypeScript)

* Folder `server/src`:

  * `index.ts` – start server (`PORT=3000`).
  * `routes/subject.ts`, `routes/milestone.ts`, `routes/activity.ts`.
  * CRUD endpoints: `GET/POST/PUT/DELETE` for each entity.
  * Global error & 404 handler, CORS enabled.
* ✅ Tests: Jest + supertest (happy path & 404).

---

## Phase 2 — Frontend (React UI)

### 2.1 Setup

* `client/` via `pnpm create vite client --template react-ts`.
* Install Tailwind CSS & configure `tailwind.config.ts`.
* Axios instance at `client/src/api.ts` pointing to `http://localhost:3000/api`.

### 2.2 Routing & Components

| Route             | Component       | Purpose                      |
| ----------------- | --------------- | ---------------------------- |
| `/`               | Redirect        | to `/subjects`               |
| `/subjects`       | `SubjectList`   | list / create subjects       |
| `/subjects/:id`   | `MilestoneList` | milestones for given subject |
| `/milestones/:id` | `ActivityList`  | activities under milestone   |

Components needed:

* `SubjectCard`, `MilestoneCard` (with % progress), `ActivityRow`.
* Modal forms (shadcn/ui **Dialog**).
* Toast context (shadcn/ui **Sonner**).

### 2.3 State

* TanStack Query (`@tanstack/react-query`) for server caching.
* Local state only for open/close modals.

### 2.4 Testing

* Vitest + React Testing Library for components.
* Playwright E2E: create subject → milestone → activity, then mark activity done and assert progress.

---

## Phase 3 — MVP Polish & Distribution

1. ✏️ Add `completedAt` toggle (PATCH `/activities/:id/toggle`).
2. 🆕 Subject & Milestone progress bars (computed client‑side 🎨).
3. 🆕 **Docker**

   * `Dockerfile` (multi‑stage Node 18 builder → slim runtime).
   * `docker-compose.yml` (one service — web).
4. 🔧 Release script: `pnpm dlx changelogithub` on `main` merge.
5. ✅ All CI checks must pass; smoke test passes in `docker compose up`.

> **Exit Criteria**
> *User can clone repo, run one command (`pnpm run dev` or `docker compose up`), and manage Subjects → Milestones → Activities with progress tracking – no auth, no cloud sync.*

---

## Phase 4 — Post‑MVP Backlog (create GitHub Issues, do **not** start coding until green‑lit)

* Weekly timetable generator with drag‑and‑drop.
* Resource uploads & file store (S3 or local FS).
* Email newsletter/parent hand‑out generator (publicNotes → Markdown → PDF).
* Sub‑plan auto‑generation when teacher is absent.
* Multi‑teacher accounts & role‑based access.
* Cloud sync & offline‑first (Service Worker + IndexedDB).

---

## README TEMPLATE (copy to `/README.md` **now**)

````markdown
# Elementary Curriculum Planner (MVP)

> A lightweight open‑source web app for K‑6 teachers to map **Subjects → Milestones → Activities**, track progress, and keep everything in one place.

![CI](https://github.com/<PROJECT_URL>/actions/workflows/ci.yml/badge.svg)

## ✨ Features (MVP)
- Add / edit / delete **Subjects**, **Milestones**, and **Activities**.
- Automatic % progress bars per milestone & subject.
- Single‑file **SQLite** persistence – runs anywhere.
- React 18 front‑end with instant hot‑reload.
- One‑command start (`pnpm run dev`) or `docker compose up`.

## 🏗️ Tech Stack
| Layer | Tech |
|-------|------|
| Front‑end | React 18, Vite, Tailwind, TanStack Query |
| Back‑end | Node 18, Express, TypeScript |
| ORM / DB | Prisma 5, SQLite |
| Testing | Jest, Vitest, Playwright |
| DevOps | GitHub Actions, Docker |

## 🚀 Quick Start (Local)
```bash
git clone https://github.com/<PROJECT_URL>.git
cd curriculum-planner
pnpm install
pnpm run dev # open http://localhost:5173
````

## 🐳 Quick Start (Docker)

```bash
docker compose up --build
# open http://localhost:3000 (API) and http://localhost:5173 (UI)
```

## 🗂 Project Structure

```text
client/   # React front-end
server/   # Express API
prisma/   # Prisma schema & migrations
```

## 🧪 Running Tests

```bash
pnpm run test         # all tests
pnpm test --filter server
pnpm test --filter client
```

## 📜 License

MIT © 2025 University of Prince Edward Island

```
```
