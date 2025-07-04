/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  
  // Mutation configuration
  mutate: [
    // Core business logic modules
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
    'src/middleware/**/*.ts',
    'src/routes/**/*.ts',
    
    // Exclude test files, mocks, and configuration
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
    '!src/test-utils/**',
    '!src/templates/**',
    '!src/data/**',
    '!src/backups/**',
    '!src/jobs/**',
    '!src/monitoring/**',
    '!src/storage.ts',
    '!src/logger.ts',
    '!src/prisma.ts',
    '!src/validation.ts',
    '!src/app.ts',
    '!src/index.ts'
  ],
  
  // Test configuration
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    config: {
      testEnvironment: 'node',
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapping: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          isolatedModules: true
        }]
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setup-all-mocks.ts'],
      testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.unit.test.ts',
        '**/__tests__/**/*.tdd.test.ts'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '\\.pact\\.test\\.',
        '\\.integration\\.test\\.',
        '\\.e2e\\.test\\.',
        '\\.performance\\.test\\.',
        'security\\.test\\.'
      ],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/types/**',
        '!src/test-utils/**'
      ],
      maxWorkers: 2,
      workerIdleMemoryLimit: '1GB'
    }
  },
  
  // TypeScript configuration
  tsconfigFile: 'tsconfig.json',
  checkers: ['typescript'],
  
  // Thresholds for mutation score
  thresholds: {
    high: 85,
    low: 70,
    break: 60
  },
  
  // Performance settings
  timeoutMS: 60000,
  timeoutFactor: 2,
  maxConcurrentTestRunners: 2,
  
  // Reporting
  htmlReporter: {
    baseDir: 'reports/mutation'
  },
  
  // Logging
  logLevel: 'info',
  fileLogLevel: 'debug',
  
  // Plugin configuration
  plugins: [
    '@stryker-mutator/javascript-mutator',
    '@stryker-mutator/jest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter'
  ],
  
  // Mutation operators
  mutator: {
    plugins: ['javascript'],
    excludedMutations: [
      'StringLiteral',  // Exclude string mutations to avoid breaking logs/messages
      'BooleanLiteral', // Focus on logic mutations
      'ObjectLiteral'   // Avoid breaking configuration objects
    ]
  },
  
  // Dashboard configuration (if using Stryker dashboard)
  dashboard: {
    project: 'github.com/teaching-engine2.0/server',
    version: 'main'
  }
};