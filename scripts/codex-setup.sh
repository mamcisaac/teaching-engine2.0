#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Curriculum Planner – Setup script                                           #
# Robustly locates repo root, installs deps, runs migrations & build.         #
###############################################################################

printf '\n📦  Bootstrapping Curriculum Planner environment...\n' >&2

# 0. Locate repo root ----------------------------------------------------------
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

# 2. Handle existing node_modules ----------------------------------------------
if [[ -d node_modules ]] && [[ -f pnpm-lock.yaml ]]; then
  echo "🧹  Cleaning up existing node_modules to ensure clean install..." >&2
  rm -rf node_modules
  rm -rf client/node_modules server/node_modules prisma/node_modules scripts/node_modules 2>/dev/null || true
fi

# 3. Setup environment variables -----------------------------------------------
if [[ -f server/.env.offline ]]; then
  export $(grep -v '^#' server/.env.offline | xargs)
fi

export PRISMA_NO_ENGINE_DOWNLOAD=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# 4. Ensure pnpm exists --------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "🔧  Installing pnpm..." >&2
  # Disable corepack to avoid yarn repository issues
  corepack disable 2>/dev/null || true
  # Use standalone installer to avoid npm/corepack issues
  curl -fsSL https://get.pnpm.io/install.sh | sh - >/dev/null 2>&1
  export PATH="$HOME/.local/share/pnpm:$PATH"
  # Verify installation
  if ! command -v pnpm >/dev/null 2>&1; then
    # Fallback to npm if standalone installer fails
    COREPACK_ENABLE_STRICT=0 npm install -g pnpm@latest
  fi
fi

# 5. Install all dependencies --------------------------------------------------
echo "📦  Installing dependencies..." >&2
pnpm install --frozen-lockfile

# 6. Generate Prisma client ----------------------------------------------------
if [[ -d prisma ]]; then
  echo "🗄️  Generating Prisma client..." >&2
  cd prisma
  pnpm exec prisma generate
  cd ..
fi

# 7. Run database migrations ---------------------------------------------------
if [[ -d prisma ]]; then
  echo "🗄️  Running database migrations..." >&2
  cd prisma
  pnpm exec prisma migrate deploy || {
    echo "⚠️  No migrations to apply or database not accessible" >&2
  }
  cd ..
fi

# 8. Seed database (optional) --------------------------------------------------
if [[ -d server ]] && [[ -f scripts/seed.ts ]]; then
  echo "🌱  Seeding database..." >&2
  cd server
  pnpm exec tsx ../scripts/seed.ts || {
    echo "⚠️  Seed script failed (non-critical)" >&2
  }
  cd ..
fi

# 9. Build all packages --------------------------------------------------------
echo "🔨  Building packages..." >&2
pnpm run build

# 10. Final verification -------------------------------------------------------
if [[ ! -d server/dist ]]; then
  echo "⚠️  Server build output not found" >&2
fi

if [[ ! -d client/dist ]] && [[ ! -d client/build ]]; then
  echo "⚠️  Client build output not found" >&2
fi

echo -e "\n✅  Environment ready! Run 'pnpm run dev' or 'docker compose up'.\n" >&2

# Optional: Show next steps
echo "📝  Next steps:" >&2
echo "    - Development: pnpm run dev" >&2
echo "    - Production: docker compose up" >&2
echo "    - Run tests: pnpm test" >&2
