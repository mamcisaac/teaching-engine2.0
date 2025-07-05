/**
 * Real File Operations Test Setup
 * Configures tests to use actual file system operations instead of mocks
 * 
 * This setup:
 * - Enables real file parsing when USE_REAL_FILE_PARSERS=true
 * - Configures temporary directories for file operations
 * - Sets up cleanup procedures
 * - Provides utilities for real file testing
 */

import { jest } from '@jest/globals';
import { FileSystemTestUtils } from '../utils/FileSystemTestUtils';

// Global test configuration
const USE_REAL_FILES = process.env.USE_REAL_FILE_OPERATIONS === 'true';
const USE_REAL_PARSERS = process.env.USE_REAL_FILE_PARSERS === 'true';

if (USE_REAL_FILES || USE_REAL_PARSERS) {
  console.log('🔧 Configuring real file operations for tests');
  
  // Don't mock file system operations when using real files
  jest.unmock('fs');
  jest.unmock('fs/promises');
  jest.unmock('path');
  jest.unmock('os');
  
  // Don't mock file parsing libraries when testing real parsing
  if (USE_REAL_PARSERS) {
    jest.unmock('pdf-parse');
    jest.unmock('mammoth');
    jest.unmock('csv-parse/sync');
  }
}

/**
 * Global setup for real file operations
 */
export class RealFileOperationsSetup {
  private static initialized = false;
  private static tempDirs: string[] = [];

  /**
   * Initialize real file operations setup
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('📁 Initializing real file operations test environment');

    // Set up global cleanup on process exit
    process.on('beforeExit', this.globalCleanup.bind(this));
    process.on('SIGINT', this.globalCleanup.bind(this));
    process.on('SIGTERM', this.globalCleanup.bind(this));

    this.initialized = true;
  }

  /**
   * Clean up all created temporary files and directories
   */
  static async globalCleanup(): Promise<void> {
    console.log('🧹 Cleaning up real file operations test environment');
    
    try {
      await FileSystemTestUtils.cleanupAll();
    } catch (error) {
      console.warn('Warning: Failed to clean up some test files:', error);
    }
  }

  /**
   * Check if real file operations are enabled
   */
  static isRealFileOperationsEnabled(): boolean {
    return USE_REAL_FILES;
  }

  /**
   * Check if real file parsers are enabled
   */
  static isRealFileParsersEnabled(): boolean {
    return USE_REAL_PARSERS;
  }

  /**
   * Get configuration for test environment
   */
  static getConfig(): {
    useRealFiles: boolean;
    useRealParsers: boolean;
    tempDir: string;
  } {
    return {
      useRealFiles: USE_REAL_FILES,
      useRealParsers: USE_REAL_PARSERS,
      tempDir: process.env.TEST_TEMP_DIR || '/tmp/teaching-engine-tests',
    };
  }
}

/**
 * Jest setup function for real file operations
 */
export async function setupRealFileOperations(): Promise<void> {
  await RealFileOperationsSetup.initialize();
}

/**
 * Jest teardown function for real file operations
 */
export async function teardownRealFileOperations(): Promise<void> {
  await RealFileOperationsSetup.globalCleanup();
}

// Auto-initialize if running in real file mode
if (USE_REAL_FILES || USE_REAL_PARSERS) {
  setupRealFileOperations().catch(console.error);
}

/**
 * Test helper to conditionally skip tests when real files are not available
 */
export function skipIfNoRealFiles(testName: string): boolean {
  if (!USE_REAL_FILES) {
    console.log(`⏭️  Skipping ${testName} - real file operations not enabled`);
    return true;
  }
  return false;
}

/**
 * Test helper to conditionally skip tests when real parsers are not available
 */
export function skipIfNoRealParsers(testName: string): boolean {
  if (!USE_REAL_PARSERS) {
    console.log(`⏭️  Skipping ${testName} - real file parsers not enabled`);
    return true;
  }
  return false;
}

/**
 * Conditional test runner for real file operations
 */
export const describeRealFiles = USE_REAL_FILES ? describe : describe.skip;
export const itRealFiles = USE_REAL_FILES ? it : it.skip;

/**
 * Conditional test runner for real file parsers
 */
export const describeRealParsers = USE_REAL_PARSERS ? describe : describe.skip;
export const itRealParsers = USE_REAL_PARSERS ? it : it.skip;

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  // File size limits for testing
  MAX_TEST_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  LARGE_FILE_SIZE: 10 * 1024 * 1024,     // 10MB
  SMALL_FILE_SIZE: 1024,                  // 1KB
  
  // Timeout settings
  FILE_OPERATION_TIMEOUT: 5000,          // 5 seconds
  LARGE_FILE_TIMEOUT: 30000,             // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 100,                      // 100ms
  
  // Cleanup settings
  CLEANUP_TIMEOUT: 10000,                // 10 seconds
  FORCE_CLEANUP: true,
};

export default RealFileOperationsSetup;