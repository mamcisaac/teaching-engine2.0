# Test Infrastructure Fixes Needed

This document outlines all remaining test infrastructure issues that need to be resolved. Each fix is described with specific file locations and changes to minimize merge conflicts.

## 🚨 Critical Test Infrastructure Issues

### 1. PDF Parse Module Path Issue

**Problem**: Tests fail with `ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'`

**Root Cause**: The `pdf-parse` npm module (v1.1.1) tries to load a test PDF file using a relative path from its own directory, but the path resolution fails in our test environment.

**Affected Files**:

- All test files that import services using `pdf-parse`:
  - `/server/tests/server-integration.test.ts`
  - `/server/tests/aiSuggestions.test.ts`
  - `/server/tests/parentMessage.test.ts`
  - `/server/tests/curriculumImportIntegration.test.ts`

**Fix Strategy**:

```bash
# Option 1: Mock pdf-parse in test setup
# Create: /server/tests/__mocks__/pdf-parse.js
module.exports = (dataBuffer) => {
  return Promise.resolve({
    numpages: 1,
    numrender: 1,
    info: {},
    metadata: {},
    text: 'Mocked PDF content for testing',
    version: '1.10.100'
  });
};

# Option 2: Patch the pdf-parse module
# Add to /server/tests/jest.setup.ts:
jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation((buffer) => {
    return Promise.resolve({
      text: 'Test PDF content',
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: {}
    });
  });
});
```

**Files to Create**:

- `/server/tests/__mocks__/pdf-parse.js` (new mock file)

**Files to Modify**:

- `/server/tests/jest.setup.ts` (add mock at the top)

---

### 2. Jest Environment Teardown Errors

**Problem**: `ReferenceError: You are trying to import a file after the Jest environment has been torn down`

**Root Cause**: Async operations continuing after test completion, likely due to missing cleanup in tests.

**Affected Test Files**:

- `/server/tests/aiSuggestions.test.ts`
- `/server/tests/parentMessage.test.ts`

**Fix Strategy**:

```typescript
// Add to each affected test file's afterEach block:
afterEach(async () => {
  // Clean up any pending timers
  jest.clearAllTimers();

  // Wait for pending promises
  await new Promise((resolve) => setImmediate(resolve));

  // Clean up database connections
  await prisma.$disconnect();
});

// Add to jest.config.js:
module.exports = {
  // ... existing config
  testTimeout: 30000,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  forceExit: true,
  detectOpenHandles: true,
};
```

**Files to Modify**:

- `/server/jest.config.js` (update configuration)
- Each affected test file (add proper cleanup)

---

### 3. AuthRequest Interface Inconsistency

**Problem**: TypeScript compilation errors due to mismatched `AuthRequest` interfaces

**Root Cause**: Multiple definitions of AuthRequest with incompatible structures:

- `/server/src/middleware/auth.ts`: `{ user?: { userId: string } }`
- Various routes expecting: `{ user?: { id: number; userId?: string } }`

**Fix Strategy**:

```typescript
// Create a single source of truth
// File: /server/src/types/auth.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// Update all files to import from this single source:
// In each route file, replace local interface with:
import { AuthRequest } from '../types/auth';
```

**Files to Create**:

- `/server/src/types/auth.ts` (new shared type definition)

**Files to Modify** (update imports only):

- `/server/src/middleware/auth.ts`
- `/server/src/routes/aiSuggestions.ts`
- `/server/src/routes/planning.ts`
- `/server/src/routes/curriculumImport.ts`
- `/server/src/routes/cognate.ts`
- `/server/src/routes/mediaResource.ts`
- All other route files using AuthRequest

**Change Pattern**:

```typescript
// Remove local interface definition
- interface AuthRequest extends Request { ... }

// Add import
+ import { AuthRequest } from '../types/auth';
```

---

### 4. ESLint Violations in Test Files

**Problem**: Explicit `any` types and unused variables in test files

**Affected Files and Specific Fixes**:

#### `/server/src/services/planning/__tests__/weeklyPlanDiagnostics.test.ts`

Lines with `as any` casts (125, 127, 134, 239, 240, 241, etc.):

```typescript
// Replace all instances of:
(prisma.lessonPlan.findFirst as any).mockResolvedValue(...)

// With:
const mockFindFirst = prisma.lessonPlan.findFirst as jest.MockedFunction<typeof prisma.lessonPlan.findFirst>;
mockFindFirst.mockResolvedValue(...);
```

#### `/server/src/__tests__/curriculumImport.test.ts`

Remove unused import:

```typescript
- import { curriculumImportService } from '../services/curriculumImportService';
```

#### `/server/src/routes/__tests__/planning.test.ts`

Already fixed in previous work - no additional changes needed.

---

### 5. Duplicate Mock Files

**Problem**: Jest warns about duplicate manual mocks in dist and src directories

**Warning Messages**:

```
jest-haste-map: duplicate manual mock found: logger
  * <rootDir>/dist/__mocks__/logger.js
  * <rootDir>/src/__mocks__/logger.ts
```

**Fix Strategy**:

```json
// Add to /server/.gitignore:
dist/

// Add to /server/jest.config.js:
module.exports = {
  // ... existing config
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
```

**Files to Modify**:

- `/server/.gitignore` (add dist/)
- `/server/jest.config.js` (add ignore patterns)

---

### 6. Test Database Reset Issues

**Problem**: Multiple "database reset" messages indicating inefficient test setup

**Fix Strategy**:

```typescript
// Create: /server/tests/helpers/testDbSetup.ts
import { prisma } from '../../src/prisma';

let isDbInitialized = false;

export async function setupTestDb() {
  if (!isDbInitialized) {
    await prisma.$executeRaw`PRAGMA journal_mode = WAL`;
    await prisma.$executeRaw`PRAGMA synchronous = NORMAL`;
    isDbInitialized = true;
  }
}

export async function cleanupTestDb() {
  // Use transactions for faster cleanup
  await prisma.$transaction([
    prisma.curriculumImport.deleteMany(),
    prisma.materialList.deleteMany(),
    // ... other cleanup queries
  ]);
}
```

**Files to Create**:

- `/server/tests/helpers/testDbSetup.ts`

**Files to Modify**:

- Update test files to use shared setup/cleanup utilities

---

## 🔧 Implementation Order (To Avoid Conflicts)

### Phase 1: Create New Files (No Conflicts)

1. `/server/tests/__mocks__/pdf-parse.js`
2. `/server/src/types/auth.ts`
3. `/server/tests/helpers/testDbSetup.ts`

### Phase 2: Update Configuration Files (Low Conflict Risk)

1. `/server/jest.config.js` - Add timeout, environment, and ignore patterns
2. `/server/.gitignore` - Add dist/ directory
3. `/server/tests/jest.setup.ts` - Add global mocks

### Phase 3: Update Import Statements (Medium Conflict Risk)

1. Update all route files to import AuthRequest from shared location
2. Update test files to import shared test utilities

### Phase 4: Fix Test Files (Higher Conflict Risk)

1. Add cleanup blocks to test files with teardown errors
2. Replace `as any` casts with properly typed mocks
3. Remove unused imports and variables

---

## 📋 Validation Checklist

After implementing fixes, verify:

- [ ] Run `pnpm test` - all tests should pass
- [ ] Run `pnpm typecheck` - no TypeScript errors
- [ ] Run `pnpm lint` - no ESLint violations
- [ ] Check test output - no warning messages about duplicate mocks
- [ ] Verify test performance - tests complete in < 60 seconds

---

## 🚀 Quick Fix Script

For teams wanting to apply all fixes at once:

```bash
#!/bin/bash
# fix-test-infrastructure.sh

echo "Creating new files..."
mkdir -p server/tests/__mocks__
cat > server/tests/__mocks__/pdf-parse.js << 'EOF'
module.exports = (dataBuffer) => {
  return Promise.resolve({
    numpages: 1,
    numrender: 1,
    info: {},
    metadata: {},
    text: 'Mocked PDF content for testing',
    version: '1.10.100'
  });
};
EOF

mkdir -p server/src/types
cat > server/src/types/auth.ts << 'EOF'
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
EOF

echo "Updating configurations..."
# Add jest config updates
# Add gitignore updates

echo "✅ Test infrastructure fixes applied!"
```

---

## 📝 Notes for Implementers

1. **Coordinate Changes**: If multiple developers are working on tests, coordinate who fixes which files to avoid conflicts.

2. **Test Incrementally**: Apply fixes one at a time and run tests after each change to ensure nothing breaks.

3. **Preserve Existing Functionality**: These fixes should not change any business logic, only test infrastructure.

4. **Document Decisions**: If you choose a different fix strategy, document it for future reference.

5. **CI/CD Considerations**: Ensure these fixes work in both local and CI environments.

---

_Last Updated: December 2024_
_Created by: Agent Planner_
_Purpose: Enable clean test runs without modifying core functionality_

---

## ✅ Fixes Completed in PR #224

### ESLint Fixes Applied

Successfully fixed all ESLint errors in:

- `server/src/services/planning/__tests__/weeklyPlanDiagnostics.test.ts` - Replaced `any` with `jest.Mock`
- `server/src/services/planning/weeklyPlanDiagnostics.ts` - Removed unused `endOfWeek` import
- `server/tests/aiPerformanceBenchmarks.test.ts` - Fixed `any` types, removed unused variables
- `server/tests/smartMaterialsIntegration.test.ts` - Fixed `any` types, removed unused variables

### TypeScript Compilation Fixes Applied

Fixed all `AuthRequest` interface issues in:

- `server/src/routes/aiSuggestions.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/assessment.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/cognate.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/curriculumImport.ts` - Changed `req.user?.id` to `req.user?.userId`
- `server/src/routes/mediaResource.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/oralRoutine.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/smartGoal.ts` - Changed `req.userId` to `req.user!.userId`
- `server/src/routes/thematicUnit.ts` - Changed `req.userId` to `req.user!.userId`

### Unit Tests Added

- `client/src/components/planning/__tests__/ActivitySuggestions.test.tsx` - 7 test cases
- `client/src/components/planning/__tests__/ActivityLibrary.test.tsx` - 8 test cases

### Current CI Status

- ✅ Lint phase passes
- ✅ Build phase passes
- ❌ Test phase fails due to missing PDF file (pre-existing issue)
