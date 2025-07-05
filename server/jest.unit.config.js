/**
 * Unit Test Configuration
 * Fast, isolated tests with minimal setup
 */

// Set environment for unit tests
process.env.TEST_TYPE = 'unit';

// Import and export main configuration
import config from './jest.config.js';
export default config;
