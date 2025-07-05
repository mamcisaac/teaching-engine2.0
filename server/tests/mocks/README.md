# Test Mocks Directory - TDD Compliance Guide

## Overview

This directory contains mock implementations for dependencies that cannot be used in Node.js test environments. Following TDD principles, mocks should be minimal and only used when absolutely necessary.

## TDD Requirements

1. **Write failing tests FIRST** - Before any implementation
2. **Use real implementations** - Whenever possible
3. **Mock explicitly** - In individual test files, not globally
4. **Test real scenarios** - Integration tests should use real services

## Mocks That Should Be Kept

### Binary Format Parsers
- `canvas.mock.ts` - Canvas API not available in Node.js
- `pdfkit.mock.ts` - PDF generation library with native dependencies
- `pdf-parse.mock.ts` - PDF parsing requires binary handling
- `mammoth.mock.ts` - DOCX parsing requires binary handling

These are kept because they handle binary formats that require native dependencies not available in test environments.

### Mocks That Should Be Removed/Minimized

- `database.mock.ts` - Tests should use real test database
- `services.mock.ts` - Tests should use real service implementations
- `uuid.mock.ts` - Use real UUIDs in tests
- `logger.mock.ts` - Use real logger or explicit test mocks
- `openai.mock.ts` - Only mock when API key unavailable

## Best Practices

1. **Prefer Real Implementations**
   ```typescript
   // BAD - Global mock
   jest.mock('@teaching-engine/database');
   
   // GOOD - Real database in tests
   import { prisma } from '@teaching-engine/database';
   ```

2. **Explicit Test Mocks**
   ```typescript
   // In individual test files when needed
   jest.mock('openai', () => ({
     // Minimal mock for this specific test
   }));
   ```

3. **Integration Tests**
   - Use real databases
   - Make real API calls (with test accounts)
   - Test complete workflows

4. **Environment-Specific Mocking**
   ```typescript
   // Only mock in CI to prevent accidental charges
   if (process.env.CI === 'true') {
     jest.mock('openai');
   }
   ```

## Migration Guide

To update tests for TDD compliance:

1. Remove global mock imports
2. Use real test database connections
3. Mock only in specific test files as needed
4. Ensure tests work with real implementations
5. Add integration tests for external services