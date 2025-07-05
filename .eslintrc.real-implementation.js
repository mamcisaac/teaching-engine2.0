// ESLint configuration for Real Implementation Testing Standards
module.exports = {
  extends: ['./.eslintrc.js'],
  
  overrides: [
    {
      // Real Implementation Testing Rules for Test Files
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
      excludedFiles: ['**/*.mock.ts', '**/*.stub.ts'],
      
      rules: {
        // CRITICAL: Prevent inappropriate mocking
        'no-mock-in-integration': 'error',
        'require-real-implementation': 'error',
        'no-shallow-mocks': 'error',
        
        // MANDATORY: Test quality enforcement
        'test-naming-convention': 'error',
        'require-performance-monitoring': 'warn',
        'require-database-cleanup': 'error',
        'no-hardcoded-test-data': 'warn',
        'require-realistic-test-data': 'error',
        
        // FORBIDDEN: Anti-patterns
        'no-simple-mock-objects': 'error',
        'no-jest-mock-services': 'error',
        'require-database-verification': 'warn',
        
        // RECOMMENDED: Best practices
        'prefer-real-implementations': 'warn',
        'require-test-isolation': 'error',
        'limit-test-execution-time': 'warn'
      },
      
      env: {
        jest: true,
        node: true
      },
      
      globals: {
        testUtils: 'readonly',
        performanceTestUtils: 'readonly',
        TestDatabaseManager: 'readonly'
      }
    },
    
    {
      // Integration test specific rules
      files: ['**/*.integration.test.ts', '**/integration/**/*.test.ts'],
      
      rules: {
        // STRICT: No mocking allowed in integration tests
        'no-jest-mock': 'error',
        'no-mock-return-value': 'error',
        'require-real-database': 'error',
        'require-real-services': 'error',
        
        // PERFORMANCE: Execution time limits
        'max-test-execution-time': ['error', { maxTime: 5000 }],
        'require-performance-assertions': 'error'
      }
    },
    
    {
      // Unit test specific rules (more lenient on mocking)
      files: ['**/*.unit.test.ts', '**/unit/**/*.test.ts'],
      
      rules: {
        // ALLOWED: Limited mocking for external dependencies
        'no-jest-mock': 'off',
        'allow-external-service-mocks': 'warn',
        
        // REQUIRED: Still need real implementations for core logic
        'require-real-business-logic': 'error',
        'limit-mock-scope': 'warn'
      }
    }
  ],
  
  // Custom rule definitions
  plugins: ['real-implementation-testing'],
  
  settings: {
    'real-implementation-testing': {
      // Configuration for custom rules
      allowedMockPatterns: [
        // External services that can be mocked
        '^.*EmailService$',
        '^.*PaymentProvider$',
        '^.*ExternalAPI.*$',
        '^.*OpenAI.*$' // Allow AI service mocking in unit tests
      ],
      
      requiredTestPatterns: {
        realImplementation: /Real Implementation/,
        performanceMonitoring: /performanceManager|measureTestPerformance/,
        databaseCleanup: /afterEach.*cleanup|rollbackTransaction/
      },
      
      performanceThresholds: {
        unitTest: 1000,        // 1 second
        integrationTest: 5000, // 5 seconds
        e2eTest: 30000        // 30 seconds
      }
    }
  }
};