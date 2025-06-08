# Elementary Curriculum Planner (MVP)

> A lightweight open‑source web app for K‑6 teachers to map **Subjects → Milestones → Activities**, track progress, and keep everything in one place.

![CI](https://github.com/mamcisaac/teaching-engine2.0/actions/workflows/ci.yml/badge.svg)

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

## 🛠️ Setup Script

Run the bootstrap script once after cloning to install dependencies, generate
the Prisma client, apply migrations, and build all packages:

```bash
chmod +x ./scripts/codex-setup.sh
./scripts/codex-setup.sh
```

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

## 🌐 Environment Variables

Set `VITE_API_URL` in `client/.env` if the API is not running on
`http://localhost:3000/api`.

```env
VITE_API_URL=http://my-api-host/api
```

If unset, the client falls back to `http://localhost:3000/api`.

## 🗂 Project Structure

```text
client/   # React front-end
server/   # Express API
prisma/   # Prisma schema & migrations
```

## 🧪 Running Tests

After running `pnpm install`, you need to download the browsers and required
OS libraries for Playwright. Run `pnpm exec playwright install --with-deps`
(or simply execute `pnpm playwright:test` once, which triggers the same step
automatically) before running the end-to-end tests.

Create `server/.env.test` by copying `server/.env.test.example`:

```bash
cp server/.env.test.example server/.env.test
```

```bash
pnpm run test         # all tests
pnpm test --filter server
pnpm test --filter client
pnpm playwright:test # end-to-end tests
```

### Docker Image for Tests

Build the full test image (including Playwright browsers) with:

```bash
docker build -t curriculum-planner-test .
```

## 🤝 Contributing

Copy `server/.env.test.example` to `server/.env.test` before running tests.
This file stores your local test database URL and is gitignored to avoid
accidental commits.

## 📜 License

MIT © 2025 University of Prince Edward Island
