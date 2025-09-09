#!/bin/bash

set -e

echo "========================================="
echo "COMPLETE TEST SEQUENCE RUNNER"
echo "========================================="

# Environment setup
export NODE_ENV=test
export TEST_SECRET=test-secret-token
export JWT_SECRET=test-jwt-secret
export API_BASE_URL=http://localhost:3000
export UI_BASE_URL=http://localhost:5173

echo ""
echo "Phase 0: Environment Check"
echo "---------------------------"
echo "NODE_ENV=$NODE_ENV"
echo "API_BASE_URL=$API_BASE_URL"
echo "UI_BASE_URL=$UI_BASE_URL"

echo ""
echo "Phase 1: Infrastructure Verification"
echo "------------------------------------"
./verify-test-infra.sh

if [ $? -ne 0 ]; then
  echo "❌ Infrastructure verification failed"
  echo "Please ensure servers are running with NODE_ENV=test"
  exit 1
fi

echo ""
echo "Phase 2: Smoke Tests (Read-Only)"
echo "---------------------------------"
npm run test:ui:smoke

if [ $? -ne 0 ]; then
  echo "⚠️  Smoke tests failed"
  echo "Fix smoke tests before running full suite"
  exit 1
fi

echo ""
echo "Phase 3: Full Read-Only Tests"
echo "------------------------------"
npm run test:ui

echo ""
echo "Phase 4: Write Tests (Optional)"
echo "-------------------------------"
if [ "$1" = "--with-writes" ]; then
  echo "Setting up test database copy..."
  if [ -f "./scripts/setup-test-db.sh" ]; then
    ./scripts/setup-test-db.sh
  fi
  
  echo "Running write tests..."
  WRITE_TESTS=true npm run test:ui:full
else
  echo "Skipping write tests (use --with-writes to enable)"
fi

echo ""
echo "========================================="
echo "TEST SEQUENCE COMPLETE"
echo "========================================="
echo ""
echo "✅ What success looks like:"
echo "  - Smoke tests pass (auth, dataset, navigation)"
echo "  - Feature tests fail only on UI issues (not auth)"
echo "  - Jest exits cleanly (no warnings)"
echo ""
echo "📊 Results Summary:"
echo "  - Infrastructure: ✅ Verified"
echo "  - Smoke Tests: Check output above"
echo "  - Full Tests: Check output above"
echo "  - Write Tests: $([ "$1" = "--with-writes" ] && echo "Check output above" || echo "Skipped")"
echo ""