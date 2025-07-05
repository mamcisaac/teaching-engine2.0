/**
 * Global setup for real file operations testing
 */

const fs = require('fs/promises');
const path = require('path');
const os = require('os');

module.exports = async () => {
  console.log('🚀 Setting up global real file operations test environment');
  
  // Create test temp directory
  const tempDir = process.env.TEST_TEMP_DIR || path.join(os.tmpdir(), 'teaching-engine-real-files-test');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    console.log('📁 Created test temp directory:', tempDir);
  } catch (error) {
    console.warn('⚠️  Warning: Could not create temp directory:', error.message);
  }
  
  // Set global test timeout
  jest.setTimeout(30000);
  
  console.log('✅ Global real file operations setup complete');
};