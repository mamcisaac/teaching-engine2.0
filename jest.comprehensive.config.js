/** @type {import('jest').Config} */
export default {
  displayName: 'Comprehensive Test Suite',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/server/src', '<rootDir>/server/tests'],
  
  // Test patterns for comprehensive testing
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/etfo*.test.ts',
    '**/tests/**/curriculum*.test.ts',
    '**/tests/**/reportGenerator*.test.ts',
  ],
  
  // Exclude legacy and disabled tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '.*\\.disabled$',
    '.*\\.skip$',
    'messenger-agent',
    'contactExtractor',
    'yearPlan',
    'newsletter',
    'milestone',
    'activity',
  ],
  
  // Coverage configuration for ETFO features
  collectCoverage: true,
  collectCoverageFrom: [
    'server/src/**/*.ts',
    '!server/src/**/*.d.ts',
    '!server/src/**/__mocks__/**',
    '!server/src/**/__tests__/**',
    // Focus on ETFO-related services and routes
    'server/src/routes/etfo*.ts',
    'server/src/routes/curriculum*.ts',
    'server/src/routes/long-range-plans.ts',
    'server/src/routes/unit-plans.ts',
    'server/src/routes/daybook-entries.ts',
    'server/src/services/curriculumImportService.ts',
    'server/src/services/reportGeneratorService.ts',
    'server/src/services/aiDraftService.ts',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for ETFO features
    'server/src/routes/etfo*.ts': {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    'server/src/services/curriculumImportService.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'server/src/services/reportGeneratorService.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'cobertura', // For CI/CD integration
  ],
  
  coverageDirectory: 'coverage',
  
  // Performance and timeout settings
  testTimeout: 45000, // 45 seconds for integration tests
  maxWorkers: '50%',
  
  // Setup and teardown
  globalSetup: '<rootDir>/server/tests/global-setup.ts',
  globalTeardown: '<rootDir>/server/tests/global-teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/server/jest.setup.js',
    '<rootDir>/server/tests/setup-all-mocks.ts',
    '<rootDir>/server/tests/jest.setup.ts',
  ],
  
  // Reporting
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'comprehensive-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Teaching Engine 2.0 - Comprehensive Test Report',
      logoImgPath: undefined,
      includeFailureMsg: true,
      enableMergeData: true,
      dataDirPath: './test-reports/data',
      inlineSource: false,
    }],
    ['jest-junit', {
      outputDirectory: './test-reports',
      outputName: 'junit-comprehensive.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
      addFileAttribute: true,
      includeShortConsoleOutput: true,
    }],
    ['jest-sonar', {
      outputDirectory: './test-reports',
      outputName: 'sonar-report.xml',
      reportedFilePath: 'relative',
    }],
  ],
  
  // Advanced options
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Module handling
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  
  // Globals for TypeScript/ESM
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: 'server/tsconfig.test.json',
      },
    ],
  },
  
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // Test categorization
  testResultsProcessor: './server/tests/test-categorizer.js',
  
  // Snapshot testing
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};