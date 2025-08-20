/**
 * Unit Test Configuration
 * Fast, isolated tests with minimal setup
 */

// Set environment for unit tests
process.env.TEST_TYPE = 'unit';

// Import and export main configuration
const config = require('./jest.config.js');
module.exports = config;
