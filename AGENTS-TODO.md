# Curriculum Planner MVP – TODO

> **Purpose of this file**
> This is the _single_ file you add to a brand‑new GitHub repository. A coding agent will read each task sequentially, check items off, and push code until the Minimum Viable Product (MVP) runs end‑to‑end. All information needed to complete the tasks (including a full README template) is embedded below, so the agent never has to ask “what goes in this file?”.

---

## Legend

| Emoji | Meaning                     |
| ----- | --------------------------- |
| 🆕    | create a new file / package |
| ✏️    | modify existing code        |
| ✅    | add tests                   |
| 🔧    | tooling / CI                |
| 📄    | documentation               |

---

## Phase 0 — Repository Scaffolding & Docs

1. 🆕 **Initialize repo & workspace layout**

   - `git init`, commit this **TODO.md**.
   - Add a root `.gitignore` (use `gitignore/node` + `.env`).

2. 🆕 **Monorepo structure (npm workspaces)**

   ```text
   .
   ├── client/   # React 18 + Vite + TS
3. 📄 \`\` — _create now using the template below_
   - Copy the **entire code block** titled **README TEMPLATE** verbatim into `/README.md`.
   - Replace the `<PROJECT_URL>` placeholder once the repo has a remote.
4. 📄 \`\` — MIT license (year 2025, author _University of Prince Edward Island_).
   - Root ESLint + Prettier **config files**:
     - `.eslintrc.json` (extends `eslint:recommended`, `plugin:@typescript-eslint/recommended`, and `prettier`). Example:
         "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],

     - `.prettierrc` with preferred rules (e.g., `{ "singleQuote": true, "printWidth": 100 }`).
     - `.eslintignore` ➜ `dist`, `build`, `coverage`, `*.config.js`.

   - **Scripts (root `package.json`)** – adjust `lint` to target TypeScript/JS globs so it _never_ errors when repo has no source yet:
       scripts: {
         dev: 'concurrently -k "npm:start --workspace=server" "npm:start --workspace=client"',
         build: 'npm run build --workspace=server && npm run build --workspace=client',
         test: 'npm run test --workspaces',
         lint: 'eslint "**/*.{ts,tsx,js,jsx}" --max-warnings 0 || true',
       },
     _Rationale:_ ESLint exits with code 2 when **zero** files match; the glob + `|| true` ensures Phase 0 passes even if no code exists yet. Once real source files are scaffolded (Phase 1+), the `--max-warnings 0` flag will make the command fail on actual lint violations but still tolerate an empty match set.
   - **Husky & lint‑staged** – `pre-commit` hook that runs `pnpm run lint` and `prettier --write` on staged files.
   - **Node version** in `.nvmrc`: `18`.
   - **Shared TypeScript configs** (`tsconfig.base.json` at root, extended by `client/tsconfig.json` & `server/tsconfig.json`).
   - Matrix: {node 18, node 20}
   - Steps: `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run build`, `pnpm run test`.
- 🆕 Install **Prisma** + SQLite.
- 🆕 `.env.offline` in `server/` to keep Prisma 100 % offline:
  ```env
  PRISMA_CLIENT_ENGINE_TYPE=wasm
  PRISMA_CLI_QUERY_ENGINE_TYPE=wasm
  PRISMA_NO_ENGINE_DOWNLOAD=1
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
  DATABASE_URL="file:./dev-test.sqlite"
  ```
- 🆕 Create `prisma/schema.prisma` with models:

- 🆕 `pnpm prisma migrate dev --name init`.
- 🆕 Seed script `scripts/seed.ts` inserts demo data (2 subjects → 1 milestone each → 1 activity). Add `npm run seed`.
- Folder `server/src`:

  - `index.ts` – start server (`PORT=3000`).
  - `routes/subject.ts`, `routes/milestone.ts`, `routes/activity.ts`.
  - CRUD endpoints: `GET/POST/PUT/DELETE` for each entity.
  - Global error & 404 handler, CORS enabled.

- ✅ Tests: install `jest`, `ts-jest`, `supertest`,
  `@types/jest`, `@types/supertest`, `ts-node`, and `dotenv`.
  Create `server/jest.config.ts`:

  ```ts
  import type { Config } from 'jest';

  const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
    globalSetup: './tests/jest.setup.ts',
  };
  export default config;
  ```

  Use Jest + supertest to cover the happy path and 404.
- `client/` via `pnpm create vite client --template react-ts`.
- Install Tailwind CSS & configure `tailwind.config.ts`.
- Axios instance at `client/src/api.ts` pointing to `http://localhost:3000/api`.

- `SubjectCard`, `MilestoneCard` (with % progress), `ActivityRow`.
- Modal forms (shadcn/ui **Dialog**).
- Toast context (shadcn/ui **Sonner**).

- TanStack Query (`@tanstack/react-query`) for server caching.
- Local state only for open/close modals.
- Vitest + React Testing Library for components.
- Playwright E2E: create subject → milestone → activity, then mark activity done and assert progress.
   - `Dockerfile` (multi‑stage Node 18 builder → slim runtime).
   - `docker-compose.yml` (one service — web).

> **Exit Criteria** _User can clone repo, run one command (**`** or **`**), and manage Subjects → Milestones → Activities with progress tracking – no auth, no cloud sync._
- Weekly timetable generator with drag‑and‑drop.
- Resource uploads & file store (S3 or local FS).
- Email newsletter/parent hand‑out generator (publicNotes → Markdown → PDF).
- Sub‑plan auto‑generation when teacher is absent.
- Multi‑teacher accounts & role‑based access.
- Cloud sync & offline‑first (Service Worker + IndexedDB).
| Phase                             | One‑liner **definition of done**                                                 | Verification steps                                                                                                                                                               | Automated?                 |
| --------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **0 — Repo Scaffolding & Docs**   | Repo boots with docs & tooling; `pnpm install` yields _no_ lint errors.          | 1. `pnpm install` <br>2. `pnpm run lint` returns 0 <br>3. CI matrix (Node 18/20) passes.                                                                                         | ✅ CI runs `lint`, `build` |
| **4 — Post‑MVP Backlog**          | _Not started until stakeholder sign‑off._                                        | Create GitHub Issues only.                                                                                                                                                       | –                          |


| Layer     | Tech                                     |
| --------- | ---------------------------------------- |
| Back‑end  | Node 18, Express, TypeScript             |
| ORM / DB  | Prisma 5, SQLite                         |
| Testing   | Jest, Vitest, Playwright                 |
| DevOps    | GitHub Actions, Docker                   |


```

export PRISMA_CLIENT_ENGINE_TYPE=wasm
export PRISMA_CLI_QUERY_ENGINE_TYPE=wasm
export $(grep -v '^#' server/.env.offline | xargs)
  pnpm --filter server exec prisma generate --schema=../prisma/schema.prisma
  pnpm --filter server exec prisma migrate deploy --schema=../prisma/schema.prisma
pnpm --filter server exec prisma generate --schema=../prisma/schema.prisma
pnpm --filter server exec prisma migrate deploy --schema=../prisma/schema.prisma
_The script assumes the default SQLite database. Override `DATABASE_URL` before running if you point Prisma to a different database._
     ```

     *Tip for early commits:* If the repo truly has **no** `pnpm-lock.yaml` yet, replace the step with `pnpm install --no-frozen-lockfile`, then commit the generated lockfile so subsequent CI runs can switch back to `--frozen-lockfile`.  The definition‑of‑done for Phase 0 now requires that lockfile to be present. (Node 18/20) passes. | ✅ CI runs `lint`, `build` |
     \| **1 — Backend API** | All CRUD endpoints return correct JSON & DB persists data. | 1. `pnpm --filter server test` passes (Jest). <br>2. `curl -X POST /api/subjects …` then `GET /api/subjects` returns new row. | ✅ Jest + supertest |
     \| **2 — Frontend UI** | Teacher can create Subject → Milestone → Activity in browser w/o console errors. | 1. `pnpm --filter client dev` opens UI. <br>2. Manual flow: add entities & verify list refresh. <br>3. `pnpm --filter client test` passes. <br>4. `pnpm playwright test` passes. | ✅ Vitest, Playwright |
     \| **3 — MVP Polish & Distribution** | Progress bars update; Docker image runs full stack. | 1. Manual: mark Activity done → bars update. <br>2. `docker compose up --build -d` then hit UI/API. <br>3. CI publishes release artifact (Docker image or tarball). | ✅ CI build + smoke test |
     \| **4 — Post‑MVP Backlog** | *Not started until stakeholder sign‑off.* | Create GitHub Issues only. | – |

> **Tip for reviewers:** run `pnpm dlx @caporal/servecoverage` after Jest/Vitest to visually inspect coverage and ensure critical paths are exercised.

---

## Phase 1 — Backend API (Express + Prisma)

1. 🆕 **Prisma setup**

   * Add `prisma/schema.prisma` with `Subject`, `Milestone`, `Activity` models.
   * `pnpm --filter server exec prisma migrate dev --name init` generates SQLite DB.
   * Seed script (`server/prisma/seed.ts`) inserts demo data.

2. 🆕 **Express scaffolding** (`server/src/`)

   * `index.ts` bootstraps server on `PORT=3000`.
   * CRUD routes for subjects, milestones, activities in `routes/` folder, each using Prisma client.

3. ✅ **Tests**

   * Jest + supertest. Cover happy‑path and 404 for each entity.

---

## Phase 2 — Frontend UI (React + Vite)

1. 🆕 **Vite React app** (`client/`)

   * Install React 18, React Router, Tailwind, TanStack Query.
   * Pages: `/subjects`, `/subjects/:id`, `/milestones/:id`.

2. 🆕 **Components**

   * `SubjectList`, `MilestoneList`, `ActivityList` with modal forms.
   * Progress bars per card (client‑side calc for now).

3. 🆕 **API layer**

   * `src/api.ts` wraps Axios calls to `/api/*` with React Query hooks.

4. ✅ **Tests**

   * Vitest + RTL for components.
   * Playwright e2e: create subject→milestone→activity.

---

## Phase 3 — MVP Polish & Distribution

1. ✏️ **Mark Activity done**

   * Add `completedAt` field (Prisma migration) and checkbox UI.
   * Progress bars auto‑update.

2. 🆕 **Docker**

   * Multi‑stage Dockerfile builds server & client, copies static bundle.
   * `docker compose.yml` runs API + client.

3. 🔧 **Release workflow**

   * GitHub Action publishes Docker image on tag.

---

## Phase 4 — Post‑MVP Backlog (defer)

* Weekly planner automation
* Resource uploads
* Progress alerts
* Newsletter generator
* Emergency sub‑plan creator
* Auth & multi‑user
* Cloud backup

---

## Phase Validation Checklist

| Phase | Definition‑of‑Done                                                               | Verification                   |
| ----- | -------------------------------------------------------------------------------- | ------------------------------ |
| 0     | Repo scaffolds, `pnpm run lint && pnpm run build` pass in CI matrix (Node 18/20) | GitHub Actions green           |
| 1     | All CRUD endpoints persist & return data                                         | Jest + supertest pass          |
| 2     | UI creates entities without console errors                                       | Vitest + Playwright pass       |
| 3     | Progress bars work; Docker image runs                                            | Manual smoke test + CI release |

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

## Codex Environment Setup Script

> Save this script as `scripts/codex-setup.sh` (Linux/macOS) and mark it executable via `chmod +x scripts/codex-setup.sh`. Codex will execute this once to prepare dependencies and build artifacts.

### Bash (Linux/macOS)

```bash
#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Curriculum Planner – Codex setup script                                     #
# Robustly locates repo root, installs deps, runs migrations & build.         #
###############################################################################

printf '
📦  Bootstrapping Curriculum Planner environment...
' >&2

# 0. Locate repo root (directory that contains package.json) ------------------
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR"
while [[ "$ROOT_DIR" != "/" && ! -f "$ROOT_DIR/package.json" ]]; do
  ROOT_DIR="$( dirname "$ROOT_DIR" )"
done
if [[ "$ROOT_DIR" == "/" ]]; then
  echo "ℹ️  No package.json detected – repo likely contains only documentation. Skipping dependency install & build steps." >&2
  exit 0
fi
fi
cd "$ROOT_DIR"

# 1. Ensure Node ≥18 -----------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | tr -d 'v' | cut -d. -f1)" -lt 18 ]]; then
  echo "❌ Node 18+ is required. Install from https://nodejs.org/ and re‑run." >&2
  exit 1
fi

# 2. Ensure pnpm exists --------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "🔧 Installing pnpm globally..." >&2
  npm install -g pnpm
fi

# 3. Install workspaces --------------------------------------------------------
pnpm install --frozen-lockfile

# 4. Generate Prisma client & apply migrations --------------------------------
if [[ -d server ]]; then
  pnpm --filter server exec prisma generate
  pnpm --filter server exec prisma migrate deploy
  pnpm --filter server run seed || true
fi

# 5. Build front‑end & back‑end ----------------------------------------------
pnpm run build

echo -e "
✅ Environment ready! Run 'pnpm run dev' or 'docker compose up'." >&2
```

### PowerShell (Windows) (optional)

(Windows) (optional)

```powershell
Set-StrictMode -Version Latest
Write-Output "Bootstrapping Curriculum Planner..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  npm install -g pnpm
}

pnpm install --frozen-lockfile
pnpm --filter server exec prisma generate
pnpm --filter server exec prisma migrate deploy
try { pnpm --filter server run seed } catch {}

pnpm run build
Write-Output "Done."
```

### Usage

```bash
./scripts/codex-setup.sh
```

*The script assumes the default SQLite database. Override `DATABASE_URL` before running if you point Prisma to a different database.*
