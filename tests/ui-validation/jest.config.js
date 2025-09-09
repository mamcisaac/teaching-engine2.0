module.exports = {
  testEnvironment: './support/puppeteer-env.js',
  testTimeout: 30000,
  testMatch: ['**/tests/ui-validation/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/support/setup.js'],
  rootDir: '.',
  verbose: true,
  bail: false,
  collectCoverageFrom: [
    'smoke/**/*.js',
    'features/**/*.js',
    '!**/node_modules/**'
  ]
};