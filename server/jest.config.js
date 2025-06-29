/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
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
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup-all-mocks.ts',
    '<rootDir>/tests/jest.setup.ts',
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__mocks__/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  maxWorkers: '50%',
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Auto-mock prisma for unit tests
  automock: false,
  unmockedModulePathPatterns: [
    'node_modules',
    '<rootDir>/src/services/.*\\.ts$',
    '<rootDir>/src/utils/.*\\.ts$',
  ],
};
