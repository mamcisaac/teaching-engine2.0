#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Curriculum Planner – Codex setup script                                     #
# Robustly locates repo root, installs deps, runs migrations & build.         #
###############################################################################

printf '\n📦  Bootstrapping Curriculum Planner environment...\n' >&2

# 0. Locate repo root ----------------------------------------------------------
# Works even if this script is copied to /tmp by Codex or CI
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if [[ ! -f package.json ]]; then
  echo "❌  package.json not found in $ROOT_DIR – aborting." >&2
  exit 1
fi

# 1. Ensure Node ≥18 -----------------------------------------------------------
if ! command -v node >/dev/null 2>&1 \
  || [[ "$(node -v | tr -d 'v' | cut -d. -f1)" -lt 18 ]]; then
  echo "❌  Node 18+ is required. Install from https://nodejs.org/ and re-run." >&2
  exit 1
fi

# 2. Offline Prisma / WASM engine ---------------------------------------------
export PRISMA_CLIENT_ENGINE_TYPE=wasm
export PRISMA_CLI_QUERY_ENGINE_TYPE=wasm
export PRISMA_NO_ENGINE_DOWNLOAD=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# 3. Ensure pnpm exists --------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "🔧  Installing pnpm globally..." >&2
  npm install -g pnpm
fi

# 4. Install workspaces --------------------------------------------------------
pnpm install --frozen-lockfile

# 5. Generate Prisma client & apply migrations --------------------------------
if [[ -d server ]]; then
  pnpm --filter server exec prisma generate --wasm --schema=../prisma/schema.prisma
  pnpm --filter server exec prisma migrate deploy --wasm --schema=../prisma/schema.prisma
  pnpm --filter server run seed || true
fi

# 6. Build front-end & back-end ----------------------------------------------
pnpm run build

echo -e "\n✅  Environment ready! Run 'pnpm run dev' or 'docker compose up'.\n" >&2
