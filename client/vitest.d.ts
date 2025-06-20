/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// This file provides type declarations for Vitest's global APIs
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Vitest's expect with jest-dom matchers
declare module 'vitest' {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {}
}

// Extend the global namespace with Vitest's globals
declare const vi: (typeof import('vitest'))['vi'];
declare const describe: (typeof import('vitest'))['describe'];
declare const it: (typeof import('vitest'))['it'];
declare const expect: (typeof import('vitest'))['expect'];
declare const beforeEach: (typeof import('vitest'))['beforeEach'];
declare const afterEach: (typeof import('vitest'))['afterEach'];
declare const beforeAll: (typeof import('vitest'))['beforeAll'];
// Add any other Vitest globals you need
