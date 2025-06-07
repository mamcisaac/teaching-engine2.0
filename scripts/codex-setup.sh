#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Curriculum Planner – Codex setup script                                     #
# Robustly locates repo root, installs deps, runs migrations & build.          #
###############################################################################

printf '\n📦  Bootstrapping Curriculum Planner environment...\n' >&2

# 0. Locate repo root (directory that contains package.json) -------------------
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR"
while [[ "$ROOT_DIR" != "/" && ! -f "$ROOT_DIR/package.json" ]]; do
  ROOT_DIR="$( dirname "$ROOT_DIR" )"
done
if [[ "$ROOT_DIR" == "/" ]]; then
  echo "ℹ️  No package.json detected – repo likely contains only documentation. Skipping dependency install & build steps." >&2
  exit 0
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
  pnpm --filter server exec prisma generate --schema=../prisma/schema.prisma
  pnpm --filter server exec prisma migrate deploy --schema=../prisma/schema.prisma
  pnpm --filter server run seed || true
fi

# 5. Build front‑end & back‑end ----------------------------------------------
pnpm run build

echo -e "\n✅ Environment ready! Run 'pnpm run dev' or 'docker compose up'." >&2

