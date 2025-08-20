/**
 * Stryker Configuration for Core Business Logic
 * This configuration focuses on the most critical business logic components
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  
  // Focus on core business logic modules only
  mutate: [
    // Core service classes
    'src/services/base/BaseService.ts',
    'src/services/curriculum/CurriculumImportOrchestrator.ts',
    'src/services/curriculum/validators/CurriculumValidator.ts',
    'src/services/curriculum/transformers/CurriculumTransformer.ts',
    'src/services/curriculum/parsers/ParserFactory.ts',
    'src/services/curriculum/parsers/CSVParser.ts',
    'src/services/curriculum/parsers/PDFParser.ts',
    
    // Template services
    'src/services/templates/TemplateOrchestrator.ts',
    'src/services/templates/engines/HandlebarsEngine.ts',
    'src/services/templates/providers/LessonTemplateProvider.ts',
    
    // Refactored services
    'src/services/refactored/authService.ts',
    'src/services/refactored/aiPlanningAssistant.ts',
    'src/services/refactored/curriculumImportService.ts',
    
    // Critical utilities
    'src/utils/validation.ts',
    'src/utils/database.ts',
    'src/utils/dates.ts',
    'src/utils/performance.ts',
    'src/utils/privacy.ts',
    
    // Core middleware
    'src/middleware/auth/strategies.ts',
    'src/middleware/auth/jwt.ts',
    'src/middleware/auth/password.ts',
    'src/middleware/core/validation.ts',
    'src/middleware/core/security.ts',
    'src/middleware/rateLimiter.ts',
    
    // Route handlers
    'src/routes/base/BaseRouteHandler.ts',
    'src/routes/base/validation.ts',
    'src/routes/base/middleware.ts',
    
    // Exclude non-critical files
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  
  // Test configuration optimized for core modules
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
        '**/__tests__/**/*.unit.test.ts',
        '**/__tests__/**/*.tdd.test.ts',
        '**/src/services/**/*.test.ts',
        '**/src/utils/**/*.test.ts',
        '**/src/middleware/**/*.test.ts',
        '**/src/routes/**/*.test.ts'
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
        'src/services/**/*.ts',
        'src/utils/**/*.ts',
        'src/middleware/**/*.ts',
        'src/routes/base/*.ts',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts'
      ],
      maxWorkers: 1,
      workerIdleMemoryLimit: '512MB'
    }
  },
  
  // TypeScript configuration
  tsconfigFile: 'tsconfig.json',
  checkers: ['typescript'],
  
  // Strict thresholds for core business logic
  thresholds: {
    high: 90,
    low: 80,
    break: 70
  },
  
  // Performance settings for core logic
  timeoutMS: 120000,
  timeoutFactor: 3,
  maxConcurrentTestRunners: 1,
  
  // Reporting
  htmlReporter: {
    baseDir: 'reports/mutation/core'
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
  
  // Focused mutation operators for business logic
  mutator: {
    plugins: ['javascript'],
    excludedMutations: [
      'StringLiteral',     // Avoid breaking error messages
      'ObjectLiteral',     // Avoid breaking configuration
      'ConditionalExpression' // Keep ternary operators for readability
    ],
    includedMutations: [
      'ArithmeticOperator',
      'LogicalOperator',
      'ComparisonOperator',
      'BooleanLiteral',
      'AssignmentOperator',
      'UnaryOperator',
      'UpdateOperator',
      'BlockStatement',
      'MethodExpression'
    ]
  },
  
  // Dashboard configuration
  dashboard: {
    project: 'github.com/teaching-engine2.0/server-core',
    version: 'main'
  }
};