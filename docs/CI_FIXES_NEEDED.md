# CI Fixes Needed

## Current Status

The CI pipeline has been partially fixed but still has failing tests due to missing test data files.

### ✅ Fixed Issues

1. **ESLint Errors** - All resolved in PR #224

   - Fixed `any` type usage in server test files
   - Removed unused imports and variables
   - Fixed all TypeScript strict mode violations

2. **TypeScript Compilation Errors** - All resolved in PR #224
   - Fixed `req.userId` → `req.user!.userId` across all route files
   - Fixed `req.user?.id` → `req.user?.userId` in curriculumImport.ts
   - Added proper type conversions with `parseInt()`

### ❌ Remaining Issues

#### 1. Missing Test Data File

**Error**: `ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'`

**Affected Tests**:

- `server/tests/email-service.test.ts`
- `server/tests/aiPerformanceBenchmarks.test.ts`
- `server/tests/smartMaterialsIntegration.test.ts`

**Root Cause**: The pdf-parse module is trying to load a test PDF file that doesn't exist in the repository.

**Fix Options**:

1. Add the missing test PDF file to `test/data/05-versions-space.pdf`
2. Mock the pdf-parse module in tests to avoid needing the actual file
3. Remove or skip tests that depend on this file

#### 2. TypeScript Error in TimetableSetupWizard

**File**: `client/src/components/TimetableSetupWizard.tsx`
**Lines**: 83, 105, 186
**Error**: `Cannot find name 'setSelectedTemplate'`

**Fix**: Add the missing state setter or remove the references to it.

#### 3. Jest Duplicate Mock Warnings

**Warning**: Duplicate manual mocks found for:

- `logger` (in both `dist/__mocks__` and `src/__mocks__`)
- `llmService` (in both `dist/services/__mocks__` and `src/services/__mocks__`)

**Fix**: Remove the compiled versions from `dist/` or add `dist/` to `.gitignore`

## Recommended Actions

### Immediate Fixes (for CI to pass)

1. **Add missing PDF test file**:

   ```bash
   mkdir -p test/data
   # Add a sample PDF file or create a minimal one
   ```

2. **Or mock pdf-parse in test setup**:

   ```javascript
   // In server/tests/setup.js or similar
   jest.mock('pdf-parse', () => {
     return jest.fn().mockResolvedValue({
       text: 'Mocked PDF content',
       numpages: 1,
       info: {},
     });
   });
   ```

3. **Fix TimetableSetupWizard.tsx**:
   ```typescript
   // Add missing state
   const [selectedTemplate, setSelectedTemplate] = useState(null);
   ```

### Long-term Improvements

1. **Add pre-commit hooks** to catch TypeScript errors before commit
2. **Ensure test data files** are committed to the repository
3. **Add CI step** to verify all required test files exist
4. **Document test data requirements** in README or CONTRIBUTING guide

## Files Modified in PR #224

Successfully fixed ESLint/TypeScript errors in:

- `server/src/services/planning/__tests__/weeklyPlanDiagnostics.test.ts`
- `server/src/services/planning/weeklyPlanDiagnostics.ts`
- `server/tests/aiPerformanceBenchmarks.test.ts`
- `server/tests/smartMaterialsIntegration.test.ts`
- `server/src/routes/aiSuggestions.ts`
- `server/src/routes/assessment.ts`
- `server/src/routes/cognate.ts`
- `server/src/routes/curriculumImport.ts`
- `server/src/routes/mediaResource.ts`
- `server/src/routes/oralRoutine.ts`
- `server/src/routes/smartGoal.ts`
- `server/src/routes/thematicUnit.ts`

## Test Infrastructure Status

- Unit tests for ActivitySuggestions and ActivityLibrary components added
- Tests properly mock fetch and TanStack Query
- Import paths corrected to reference existing components
- TypeScript compilation passes for all test files
