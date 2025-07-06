# Strict Linting Guide

## Overview

This project enforces strict ESLint rules to maintain high code quality standards. The strict linting configuration is designed to catch potential issues early and enforce consistent coding patterns across the codebase.

## Quick Start

### Running Strict Linting

```bash
# Check all files with strict rules
pnpm lint:strict

# Auto-fix issues where possible
pnpm lint:strict:fix

# Run standard linting (less strict, for legacy code)
pnpm lint
```

## Configuration Files

- **`.eslintrc.json`** - Standard ESLint configuration (used in CI)
- **`.eslintrc.strict.json`** - Strict ESLint configuration (enforced locally)

## Key Strict Rules

### TypeScript Rules

1. **No Explicit Any** (`@typescript-eslint/no-explicit-any`)
   - ❌ `const data: any = fetchData();`
   - ✅ `const data: UserData = fetchData();`

2. **Explicit Return Types** (`@typescript-eslint/explicit-function-return-type`)
   - ❌ `function calculate(a: number, b: number) { return a + b; }`
   - ✅ `function calculate(a: number, b: number): number { return a + b; }`

3. **Strict Boolean Expressions** (`@typescript-eslint/strict-boolean-expressions`)
   - ❌ `if (user) { ... }`
   - ✅ `if (user !== null && user !== undefined) { ... }`

4. **No Non-Null Assertions** (`@typescript-eslint/no-non-null-assertion`)
   - ❌ `const name = user!.name;`
   - ✅ `const name = user?.name ?? 'Unknown';`

5. **Consistent Type Imports** (`@typescript-eslint/consistent-type-imports`)
   - ❌ `import { User } from './types';`
   - ✅ `import type { User } from './types';`

### React Rules

1. **Exhaustive Deps** (`react-hooks/exhaustive-deps`)
   - All dependencies must be included in hook dependency arrays

2. **No Useless Fragments** (`react/jsx-no-useless-fragment`)
   - ❌ `<>{children}</>`
   - ✅ `{children}`

3. **Self-Closing Components** (`react/self-closing-comp`)
   - ❌ `<Component></Component>`
   - ✅ `<Component />`

4. **JSX Boolean Value** (`react/jsx-boolean-value`)
   - ❌ `<Component disabled={true} />`
   - ✅ `<Component disabled />`

### Import Rules

1. **Import Order** (`import/order`)
   - Groups: builtin → external → internal → parent → sibling → index
   - Alphabetically sorted within groups

2. **No Default Exports** (`import/no-default-export`)
   - ❌ `export default MyComponent;`
   - ✅ `export { MyComponent };`
   - Exceptions: config files, index files, test files

### General Rules

1. **No Console** (`no-console`)
   - Use structured logging instead
   - Exception: logger files

2. **Strict Equality** (`eqeqeq`)
   - ❌ `if (a == b)`
   - ✅ `if (a === b)`

3. **Prefer Const** (`prefer-const`)
   - ❌ `let value = 5;`
   - ✅ `const value = 5;`

4. **No Param Reassign** (`no-param-reassign`)
   - ❌ `function update(obj) { obj.value = 5; }`
   - ✅ `function update(obj) { return { ...obj, value: 5 }; }`

## Pre-Commit Hook

The project automatically runs strict linting before every commit. To bypass (not recommended):

```bash
git commit --no-verify
```

## CI/CD Integration

- **Local Development**: Strict rules enforced via pre-commit hooks
- **Pull Requests**: Strict linting workflow runs on all PRs
- **Main Branch**: Both standard and strict linting are monitored

## Migration Strategy

### For New Code
- All new files must pass strict linting
- Use `pnpm lint:strict:fix` to auto-fix issues

### For Legacy Code
1. Run `pnpm lint:strict` to see all issues
2. Fix critical issues first (type safety, null checks)
3. Gradually update files to meet strict standards
4. Files can temporarily remain in standard linting until refactored

## Common Fixes

### TypeScript Issues

```typescript
// Issue: Implicit any
// ❌ Bad
function process(data) { ... }

// ✅ Good
function process(data: ProcessData): void { ... }

// Issue: Unsafe member access
// ❌ Bad
const value = response.data.user.name;

// ✅ Good
const value = response?.data?.user?.name ?? 'Unknown';
```

### React Issues

```tsx
// Issue: Missing dependencies
// ❌ Bad
useEffect(() => {
  fetchData(userId);
}, []); // userId missing

// ✅ Good
useEffect(() => {
  fetchData(userId);
}, [userId]);

// Issue: Unnecessary fragments
// ❌ Bad
return <>{isLoading ? <Spinner /> : <Content />}</>;

// ✅ Good
return isLoading ? <Spinner /> : <Content />;
```

### Import Issues

```typescript
// Issue: Unordered imports
// ❌ Bad
import { Component } from './Component';
import React from 'react';
import { api } from '@/services/api';

// ✅ Good
import React from 'react';

import { api } from '@/services/api';

import { Component } from './Component';
```

## Troubleshooting

### "Cannot find module" errors
- Ensure TypeScript paths are configured correctly
- Run `pnpm db:generate` if Prisma types are missing

### Performance issues
- Use `--cache` flag for faster subsequent runs
- Consider running on changed files only during development

### False positives
- Some rules may need adjustment for specific use cases
- Discuss with team before disabling rules
- Use inline comments sparingly: `// eslint-disable-next-line rule-name`

## Benefits

1. **Type Safety**: Catches runtime errors at compile time
2. **Consistency**: Enforces uniform coding style
3. **Maintainability**: Makes code easier to understand and modify
4. **Best Practices**: Encourages modern JavaScript/TypeScript patterns
5. **Early Detection**: Finds bugs before they reach production

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [Import Plugin](https://github.com/import-js/eslint-plugin-import)