/**
 * Environment setup for real file operations testing
 */

// Enable real file operations
process.env.USE_REAL_FILE_OPERATIONS = 'true';
process.env.USE_REAL_FILE_PARSERS = 'true';

// Configure test directories
process.env.TEST_TEMP_DIR = '/tmp/teaching-engine-real-files-test';

// Configure timeouts
process.env.JEST_TIMEOUT = '30000';

// Disable file system mocks
process.env.DISABLE_FS_MOCKS = 'true';

// Configure logging
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

console.log('🔧 Real file operations environment configured');
console.log('📁 Temp directory:', process.env.TEST_TEMP_DIR);
console.log('⏱️  Timeout:', process.env.JEST_TIMEOUT + 'ms');
console.log('🔍 File parsers:', process.env.USE_REAL_FILE_PARSERS);
console.log('💾 File operations:', process.env.USE_REAL_FILE_OPERATIONS);