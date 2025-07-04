/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  
  // Mutation configuration
  mutate: [
    // Core business logic modules
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/stores/**/*.{ts,tsx}',
    'src/api/**/*.{ts,tsx}',
    
    // Exclude test files, stories, and configuration
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/test-utils/**',
    '!src/mocks/**',
    '!src/setupTests.ts',
    '!src/vite-env.d.ts',
    '!src/main.tsx',
    '!src/App.tsx'
  ],
  
  // Test configuration
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
    testFiles: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.unit.test.{ts,tsx}',
      'src/**/*.component.test.{ts,tsx}'
    ],
    excludeTestFiles: [
      'src/**/*.integration.test.{ts,tsx}',
      'src/**/*.e2e.test.{ts,tsx}',
      'src/**/*.pact.test.{ts,tsx}',
      'src/**/*.contract.test.{ts,tsx}'
    ]
  },
  
  // TypeScript configuration
  tsconfigFile: 'tsconfig.json',
  checkers: ['typescript'],
  
  // Thresholds for mutation score
  thresholds: {
    high: 80,
    low: 65,
    break: 50
  },
  
  // Performance settings
  timeoutMS: 30000,
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
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter'
  ],
  
  // Mutation operators
  mutator: {
    plugins: ['javascript'],
    excludedMutations: [
      'StringLiteral',  // Exclude string mutations for UI text
      'ObjectLiteral',  // Avoid breaking component props
      'ArrayDeclaration' // Avoid breaking array initialization
    ]
  },
  
  // Dashboard configuration (if using Stryker dashboard)
  dashboard: {
    project: 'github.com/teaching-engine2.0/client',
    version: 'main'
  }
};