/**
 * Integration Test Configuration
 * Database and API integration tests
 */

// Set environment for integration tests
process.env.TEST_TYPE = 'integration';

// Import and export main configuration
import config from './jest.config.js';
export default config;
