/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Mock all external dependencies for unit tests
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^@teaching-engine/database$': '<rootDir>/src/__mocks__/@teaching-engine/database.ts',
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src', '<rootDir>/tests/unit'],
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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/setup-unit-mocks.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/tests/unit/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/tests/integration/',
    '/tests/e2e/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  maxWorkers: '50%',
  testTimeout: 5000, // Shorter timeout for unit tests
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
