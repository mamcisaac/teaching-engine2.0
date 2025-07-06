module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Enforce real implementation patterns
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // Disallow common mocking libraries
          'jest-mock',
          'sinon',
          'proxyquire',
          'mock-fs',
          'nock'
        ],
        paths: [
          {
            name: '@jest/globals',
            importNames: ['jest'],
            message: 'Use real implementations instead of mocking'
          }
        ]
      }
    ],
    
    // Disallow jest.mock and vi.mock
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name="jest"][callee.property.name="mock"]',
        message: 'jest.mock is not allowed in real implementation tests'
      },
      {
        selector: 'CallExpression[callee.object.name="vi"][callee.property.name="mock"]',
        message: 'vi.mock is not allowed in real implementation tests'
      },
      {
        selector: 'CallExpression[callee.name="mock"]',
        message: 'Mocking is not allowed in real implementation tests'
      },
      {
        selector: 'CallExpression[callee.object.name="jest"][callee.property.name="spyOn"]',
        message: 'Spying is discouraged in real implementation tests'
      }
    ],
    
    // Enforce proper test structure
    'jest/prefer-expect-assertions': 'off', // Real tests may have varying assertion counts
    'jest/no-disabled-tests': 'error',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
    'jest/valid-expect-in-promise': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/prefer-to-be': 'warn',
    
    // TypeScript strictness
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true
    }],
    
    // Code quality
    'no-console': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Async/await best practices
    'require-await': 'error',
    'no-return-await': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    
    // Enforce descriptive test names - simplified for compatibility
    'jest/valid-title': 'error'
  },
  
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Test-specific rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        'max-lines-per-function': ['error', {
          max: 100,
          skipBlankLines: true,
          skipComments: true
        }]
      }
    }
  ]
};