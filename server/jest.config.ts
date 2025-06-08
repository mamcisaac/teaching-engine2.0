import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@prisma/client$': '<rootDir>/../node_modules/.prisma/client',
  },
  globalSetup: './tests/jest.setup.ts',
  transformIgnorePatterns: ['node_modules/(?!(@prisma/client)/)'],
  // Increase default timeout for tests and hooks (including beforeAll/afterAll)
  testTimeout: 20000,
};

export default config;
