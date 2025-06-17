import fs from 'fs';
import path from 'path';

/**
 * Global teardown that runs once after all test suites
 * This ensures proper cleanup of test resources
 */
export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  const testTempDir = path.join(process.cwd(), 'tests', 'temp');
  
  // Final cleanup of test databases
  if (fs.existsSync(testTempDir)) {
    try {
      // Wait a bit to ensure all database connections are closed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const files = fs.readdirSync(testTempDir);
      let cleanedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('test_') && file.endsWith('.db')) {
          const filePath = path.join(testTempDir, file);
          try {
            fs.unlinkSync(filePath);
            // Also remove WAL and SHM files
            const walPath = `${filePath}-wal`;
            const shmPath = `${filePath}-shm`;
            if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
            if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
            cleanedCount++;
          } catch (error) {
            console.warn(`Failed to delete test database: ${file}`, error);
          }
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} test database(s)`);
      }
      
      // Try to remove the temp directory if it's empty
      try {
        const remainingFiles = fs.readdirSync(testTempDir);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(testTempDir);
        }
      } catch (error) {
        // Directory might not be empty or accessible, that's okay
      }
    } catch (error) {
      console.warn('Error during test database cleanup:', error);
    }
  }
  
  // Reset any modified environment variables
  if (process.env.NODE_ENV === 'test') {
    delete process.env.NODE_ENV;
  }
  
  console.log('✅ Global test teardown complete');
}