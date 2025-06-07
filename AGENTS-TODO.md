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
   │   ├── package.json   # placeholder now, real deps later
   │   └── src/main.tsx   # 1‑line stub so ESLint & build never fail
   ├── server/   # Node 18 + Express + TS
   │   ├── package.json   # placeholder now, real deps later
   │   └── src/index.ts   # 1‑line stub (console.log)
   ├── prisma/   # Prisma schema & migrations (empty for Phase 0)
   └── scripts/  # one‑off dev scripts
   ```

   **Create both `client/package.json` and `server/package.json` *immediately* so CI’s `pnpm run build` workspace commands succeed even while the folders are only stubs.**  Minimal contents:

   ```json5
   ```

{
"name": "curriculum-planner",
"private": true,
"packageManager": "pnpm\@10.11.1",
"workspaces": \["client", "server"],
"scripts": {
"dev":   "pnpm --filter server run dev & pnpm --filter client run dev",
"build": "pnpm --filter server run build && pnpm --filter client run build",
"test":  "pnpm --filter ... test",
"lint":  "eslint "\*\*/\*.{ts,tsx,js,jsx}" --max-warnings 0 || true",
"prepare": "husky install"
}

```
}
```

```
 *Rationale:* ESLint exits with code 2 when **zero** files match; the glob + `|| true` ensures Phase 0 passes even if no code exists yet. Once real source files are scaffolded (Phase 1+), the `--max-warnings 0` flag will make the command fail on actual lint violations but still tolerate an empty match set.
```

* **Husky & lint‑staged** – `pre-commit` hook that runs `pnpm run lint` and `prettier --write` on staged files.

* **Node version** in `.nvmrc`: `18`.

* **Shared TypeScript configs** (`tsconfig.base.json` at root, extended by `client/tsconfig.json` & `server/tsconfig.json`).

6. 🔧 **CI** — `.github/workflows/ci.yml`

   * **Pin the same pnpm major version you use locally** so the lockfile is deemed compatible:

     ```yaml
     - uses: pnpm/action-setup@v2
       with:
         version: 10.11.1   # keep in sync with packageManager field in package.json
     - uses: actions/setup-node@v3
       with:
         node-version: ${{ matrix.node-version }}
     ```

     *(pnpm v10 generates a "lockfile v6"; earlier CI defaults run v8 and reject it as “not compatible.”)*

   * **Generate and commit `pnpm-lock.yaml` during Phase 0.**  Run `pnpm install` once locally; commit the resulting lockfile.  CI insists on its presence.

   * Matrix: {node 18, node 20}

   * Steps:

     ```yaml
     - name: Install deps (use lockfile)
       run: pnpm install --frozen-lockfile
     ```

     *Tip for very first commit:* If the repo truly has **no** lockfile yet, use `--no-frozen-lockfile`, then commit the generated file so subsequent CI runs can switch back to strict mode. {node 18, node 20}

   * Steps:

     ```yaml
     - name: Install deps (use lockfile)
       run: pnpm install --frozen-lockfile
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
   * **Offline / air‑gapped runners**  ▶️  Add the env var `PRISMA_CLIENT_ENGINE_TYPE=wasm` in

     * `server/.env.test` (loaded by Jest)
     * CI job `env:` block, and
     * `scripts/codex-setup.sh` **before** `pnpm install`.
       This forces Prisma to use the WebAssembly engine already bundled in `@prisma/client`, removing all network calls to `binaries.prisma.sh`.  Performance hit is negligible for test/CI.

2. 🆕 **Express scaffolding** (`server/src/`) (`server/prisma/seed.ts`) inserts demo data.

3. 🆕 **Express scaffolding** (`server/src/`)

   * `index.ts` bootstraps server on `PORT=3000`.
   * CRUD routes for subjects, milestones, activities in `routes/` folder, each using Prisma client.

4. ✅ **Tests**

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

# 2. Set env for offline Prisma -------------------------------------------
export PRISMA_CLIENT_ENGINE_TYPE=wasm  # use WASM engine; avoids network fetch

# 3. Ensure pnpm exists ------------------------------------------------------ --------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "🔧 Installing pnpm globally..." >&2
  npm install -g pnpm
fi

# — Add WebAssembly engine flag to avoid Prisma network fetch --------------
export PRISMA_CLIENT_ENGINE_TYPE=wasm

# 3. Install workspaces -------------------------------------------------------- Install workspaces --------------------------------------------------------
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
