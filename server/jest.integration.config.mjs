/**
 * Jest Configuration for Integration Tests Only
 * This bypasses all mocking and uses real implementations
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000,
  maxWorkers: 1, // Run sequentially for database access
  
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'ES2022',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      },
    ],
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma/client)/)'
  ],
  
  setupFilesAfterEnv: [
    '<rootDir>/tests/integration-test-setup.ts',
  ],
  
  // No global setup/teardown for simpler testing
  globalSetup: undefined,
  globalTeardown: undefined,
  
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  forceExit: true,
};