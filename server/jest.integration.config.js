/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Don't mock for integration tests
    '^openai$': '<rootDir>/src/__mocks__/openai.js', // Still mock external APIs
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/tests/integration'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup-all-mocks.ts', // Load mocks for external APIs
    '<rootDir>/tests/jest.integration.setup.ts', // Integration test database setup (no reset between tests)
  ],
  testMatch: ['**/tests/integration/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/tests/unit/',
    '/tests/e2e/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  maxWorkers: 1, // Run integration tests sequentially
  testTimeout: 30000, // Longer timeout for integration tests
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
