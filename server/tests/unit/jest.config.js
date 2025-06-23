/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/../../src/$1',
    '^tests/(.*)$': '<rootDir>/../$1',
  },
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: '<rootDir>/../../tsconfig.test.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/../setup-all-mocks.ts'],
  testMatch: ['**/*.unit.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  maxWorkers: 1,
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Skip database setup for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
};
