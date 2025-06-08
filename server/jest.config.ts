import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@teaching-engine/database$': '<rootDir>/../packages/database/src/index.ts',
  },
  globalSetup: './tests/jest.setup.ts',
  transformIgnorePatterns: ['node_modules/(?!(@teaching-engine/database)/)'],
};

export default config;
