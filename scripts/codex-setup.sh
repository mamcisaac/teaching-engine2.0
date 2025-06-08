#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Curriculum Planner – Fast Setup Script                                      #
# Minimal setup for quick development startup                                 #
###############################################################################

printf '\n📦  Fast-bootstrapping Curriculum Planner...\n' >&2

# 0. Locate repo root
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if [[ ! -f package.json ]]; then
  echo "❌  package.json not found in $ROOT_DIR – aborting." >&2
  exit 1
fi

# 1. Quick Node check (no installation)
if ! command -v node >/dev/null 2>&1; then
  echo "❌  Node.js is required. Please install it first." >&2
  exit 1
fi

# 2. Setup environment variables
if [[ -f server/.env.offline ]]; then
  export $(grep -v '^#' server/.env.offline | xargs)
fi

export PRISMA_NO_ENGINE_DOWNLOAD=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# 3. Quick pnpm check/install
if ! command -v pnpm >/dev/null 2>&1; then
  echo "🔧  Quick pnpm install..." >&2
  npm install -g pnpm@latest --silent
fi

# 4. Smart dependency installation (only if needed)
if [[ ! -d node_modules ]] || [[ ! -f node_modules/.modules.yaml ]]; then
  echo "📦  Installing dependencies (first run)..." >&2
  pnpm install --frozen-lockfile
else
  echo "✅  Dependencies already installed" >&2
fi

# 5. Generate Prisma client (only if needed)
if [[ -d packages/database/prisma ]] && [[ ! -d node_modules/.prisma/client ]]; then
  echo "🗄️  Generating Prisma client..." >&2
  cd packages/database/prisma
  pnpm exec prisma generate
  cd ..
fi

# 6. Optional operations via flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --full)
      echo "🔨  Running full setup..." >&2
      
      # Install Playwright (time-consuming)
      echo "🎭  Installing Playwright..." >&2
      pnpm exec playwright install --with-deps
      
      # Run migrations
      if [[ -d packages/database/prisma ]]; then
        echo "🗄️  Running migrations..." >&2
        cd packages/database/prisma
        pnpm exec prisma migrate deploy || true
        cd ..
      fi
      
      # Seed database
      if [[ -f scripts/seed.ts ]]; then
        echo "🌱  Seeding database..." >&2
        cd server
        pnpm exec tsx ../scripts/seed.ts || true
        cd ..
      fi
      
      # Build all
      echo "🔨  Building all packages..." >&2
      pnpm run build
      ;;
    --build)
      echo "🔨  Building packages..." >&2
      pnpm run build
      ;;
    --migrate)
      if [[ -d packages/database/prisma ]]; then
        echo "🗄️  Running migrations..." >&2
        cd packages/database/prisma
        pnpm exec prisma migrate deploy || true
        cd ..
      fi
      ;;
    --docker)
      # Docker check/install (only when explicitly requested)
      if ! command -v docker >/dev/null 2>&1; then
        echo "⚠️  Docker not found. Install it manually if needed." >&2
      else
        echo "✅  Docker is available" >&2
      fi
      ;;
    *)
      echo "Unknown option: $1" >&2
      ;;
  esac
  shift
done

echo -e "\n✅  Quick setup complete! Ready for development.\n" >&2

# Show available commands
echo "📝  Available commands:" >&2
echo "    - pnpm run dev          # Start development" >&2
echo "    - scripts/codex-setup.sh --full     # Run complete setup" >&2
echo "    - scripts/codex-setup.sh --build    # Build packages" >&2
echo "    - scripts/codex-setup.sh --migrate  # Run DB migrations" >&2
echo "    - scripts/codex-setup.sh --docker   # Check Docker availability" >&2
