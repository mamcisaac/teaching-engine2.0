# Elementary Curriculum Planner (MVP)

> A lightweight open‑source web app for K‑6 teachers to map **Subjects → Milestones → Activities**, track progress, and keep everything in one place.

![CI](https://github.com/openai/curriculum-planner/actions/workflows/ci.yml/badge.svg)

## ✨ Features (MVP)

- Add / edit / delete **Subjects**, **Milestones**, and **Activities**.
- Automatic % progress bars per milestone & subject.
- Single‑file **SQLite** persistence – runs anywhere.
- React 18 front‑end with instant hot‑reload.
- One‑command start (`pnpm run dev`) or `docker compose up`.

## 🏗️ Tech Stack

| Layer     | Tech                                     |
| --------- | ---------------------------------------- |
| Front‑end | React 18, Vite, Tailwind, TanStack Query |
| Back‑end  | Node 18, Express, TypeScript             |
| ORM / DB  | Prisma 5, SQLite                         |
| Testing   | Jest, Vitest, Playwright                 |
| DevOps    | GitHub Actions, Docker                   |

## 🚀 Quick Start (Local)

```bash
git clone https://github.com/openai/curriculum-planner.git
cd curriculum-planner
pnpm install
pnpm run dev # open http://localhost:5173
```

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

After running `pnpm install`, you need to download the browsers required by
Playwright. Run `pnpm exec playwright install` (or simply execute
`pnpm playwright:test` once, which triggers the same step automatically) before
running the end-to-end tests.

```bash
pnpm run test         # all tests
pnpm test --filter server
pnpm test --filter client
pnpm playwright:test # end-to-end tests
```

## 🤝 Contributing

Copy `server/.env.test.example` to `server/.env.test` before running tests.
This file stores your local test database URL and is gitignored to avoid
accidental commits.

## 📜 License

MIT © 2025 University of Prince Edward Island
