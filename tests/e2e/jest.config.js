module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js', '**/tests/e2e/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testTimeout: 900000, // 15 minutes for stress tests
  maxWorkers: 1, // Run tests sequentially for E2E stability
  verbose: true,
  collectCoverage: false, // E2E tests don't need coverage
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/e2e/reports',
      filename: 'e2e-test-report.html',
      openReport: false
    }]
  ]
};