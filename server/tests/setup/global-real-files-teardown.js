/**
 * Global teardown for real file operations testing
 */

const fs = require('fs/promises');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Starting global real file operations cleanup');
  
  // Clean up test temp directory
  const tempDir = process.env.TEST_TEMP_DIR || '/tmp/teaching-engine-real-files-test';
  
  try {
    // Remove test directory and all contents
    await fs.rmdir(tempDir, { recursive: true });
    console.log('🗑️  Cleaned up test temp directory:', tempDir);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('⚠️  Warning: Could not clean up temp directory:', error.message);
    }
  }
  
  // Clean up any remaining temporary files in system temp
  try {
    const systemTemp = require('os').tmpdir();
    const entries = await fs.readdir(systemTemp);
    
    const testFiles = entries.filter(entry => 
      entry.startsWith('teaching-engine-test-') ||
      entry.startsWith('jest-real-files-')
    );
    
    for (const file of testFiles) {
      try {
        const fullPath = path.join(systemTemp, file);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await fs.rmdir(fullPath, { recursive: true });
        } else {
          await fs.unlink(fullPath);
        }
        
        console.log('🗑️  Cleaned up orphaned test file:', file);
      } catch (cleanupError) {
        // Ignore cleanup errors for individual files
        console.warn('⚠️  Could not clean up:', file, cleanupError.message);
      }
    }
    
    if (testFiles.length > 0) {
      console.log(`🧹 Cleaned up ${testFiles.length} orphaned test files`);
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not scan for orphaned files:', error.message);
  }
  
  console.log('✅ Global real file operations cleanup complete');
};