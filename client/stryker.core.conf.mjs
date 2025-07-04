/**
 * Stryker Configuration for Client Core Business Logic
 * This configuration focuses on the most critical frontend business logic components
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  
  // Focus on core business logic modules only
  mutate: [
    // Core business logic hooks
    'src/hooks/useETFOPlanning.ts',
    'src/hooks/useETFOLessonPlanForm.ts',
    'src/hooks/useUnitPlanForm.ts',
    'src/hooks/useAutoSave.tsx',
    'src/hooks/useAIPlanningAssistant.tsx',
    'src/hooks/useDebounce.ts',
    'src/hooks/useForm.ts',
    'src/hooks/useModal.ts',
    'src/hooks/useWorkflowState.tsx',
    
    // Core services
    'src/services/authService.ts',
    'src/services/lessonPlanService.ts',
    'src/services/unitPlanService.ts',
    'src/services/requestBatcher.ts',
    'src/services/offlineStorage.ts',
    'src/services/analytics/exportService.ts',
    
    // API layer
    'src/api/core/client.ts',
    'src/api/core/utils.ts',
    'src/api/domains/auth/api.ts',
    'src/api/domains/planning/api.ts',
    'src/api/domains/curriculum/api.ts',
    'src/api/domains/calendar/api.ts',
    
    // Stores (Zustand state management)
    'src/stores/lessonPlanStore.ts',
    'src/stores/unitPlanStore.ts',
    'src/stores/daybookStore.ts',
    'src/stores/basePlanningStore.ts',
    'src/stores/weeklyPlannerStore.ts',
    
    // Core utility functions
    'src/utils/formValidation.ts',
    'src/utils/errorHandler.ts',
    'src/utils/sanitization.ts',
    'src/utils/analyticsExport.ts',
    'src/lib/api.ts',
    'src/lib/utils.ts',
    
    // Core contexts
    'src/contexts/AuthContext.tsx',
    'src/contexts/LanguageContext.tsx',
    'src/contexts/OnboardingContext.tsx',
    'src/contexts/NotificationContext.tsx',
    'src/contexts/HelpContext.tsx',
    
    // Critical planning components
    'src/components/planning/ExpectationSelector.tsx',
    'src/components/planning/PlanningWizard.tsx',
    'src/components/planning/AISuggestionPanel.tsx',
    'src/components/planning/CurriculumImportWizard.tsx',
    'src/components/planning/RecentPlans.tsx',
    
    // Form components with business logic
    'src/components/forms/LessonPlanForm.tsx',
    'src/components/forms/UnitPlanForm.tsx',
    'src/components/forms/CurriculumSetupWizard.tsx',
    'src/components/forms/FormsDataAgent.tsx',
    
    // AI components
    'src/components/ai/AILessonPlanPanel.tsx',
    'src/components/ai/AIUnitPlanPanel.tsx',
    'src/components/ai/GPTPlanningAgent.tsx',
    
    // Core UI components with logic
    'src/components/ui/AutoSaveIndicator.tsx',
    'src/components/ui/MobileOptimizedForm.tsx',
    
    // Exclude non-critical files
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/test-utils/**',
    '!src/setupTests.ts',
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/content/**',
    '!src/data/**',
    '!src/features/**',
    '!src/styles/**'
  ],
  
  // Test configuration optimized for React components
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
    testFiles: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.unit.test.{ts,tsx}',
      'src/**/*.component.test.{ts,tsx}',
      'src/hooks/__tests__/*.test.{ts,tsx}',
      'src/services/__tests__/*.test.{ts,tsx}',
      'src/contexts/__tests__/*.test.{ts,tsx}',
      'src/utils/__tests__/*.test.{ts,tsx}',
      'src/components/__tests__/*.test.{ts,tsx}',
      'src/components/forms/__tests__/*.test.{ts,tsx}',
      'src/components/planning/__tests__/*.test.{ts,tsx}',
      'src/components/ai/__tests__/*.test.{ts,tsx}'
    ],
    excludeTestFiles: [
      'src/**/*.integration.test.{ts,tsx}',
      'src/**/*.e2e.test.{ts,tsx}',
      'src/**/*.pact.test.{ts,tsx}',
      'src/**/*.contract.test.{ts,tsx}',
      'src/**/*.stories.{ts,tsx}'
    ]
  },
  
  // TypeScript configuration
  tsconfigFile: 'tsconfig.json',
  checkers: ['typescript'],
  
  // Strict thresholds for core business logic
  thresholds: {
    high: 85,
    low: 75,
    break: 65
  },
  
  // Performance settings optimized for React components
  timeoutMS: 60000,
  timeoutFactor: 2.5,
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
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter'
  ],
  
  // Focused mutation operators for React components
  mutator: {
    plugins: ['javascript'],
    excludedMutations: [
      'StringLiteral',       // Avoid breaking UI text
      'ObjectLiteral',       // Avoid breaking component props
      'ArrayDeclaration',    // Avoid breaking array initialization
      'ConditionalExpression' // Keep ternary operators for JSX readability
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
      'MethodExpression',
      'ArrowFunction'
    ]
  },
  
  // Dashboard configuration
  dashboard: {
    project: 'github.com/teaching-engine2.0/client-core',
    version: 'main'
  }
};