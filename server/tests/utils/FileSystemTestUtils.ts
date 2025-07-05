/**
 * File System Test Utilities
 * Real file operations using temporary directories for comprehensive testing
 * 
 * Purpose: Replace file system mocking with actual file operations
 * Benefits:
 * - Test real file I/O behavior
 * - Catch file permission and disk space issues
 * - Test actual file format validation
 * - Verify file cleanup and security
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

export interface TempFile {
  path: string;
  content: Buffer | string;
  cleanup: () => Promise<void>;
}

export interface TempDirectory {
  path: string;
  cleanup: () => Promise<void>;
  createFile: (name: string, content: Buffer | string) => Promise<TempFile>;
  createSubDir: (name: string) => Promise<TempDirectory>;
}

export class FileSystemTestUtils {
  private static readonly TEST_PREFIX = 'teaching-engine-test-';
  private static createdPaths: Set<string> = new Set();

  /**
   * Create a temporary directory for testing
   */
  static async createTempDir(name?: string): Promise<TempDirectory> {
    const dirName = name ? `${this.TEST_PREFIX}${name}-${randomUUID()}` : `${this.TEST_PREFIX}${randomUUID()}`;
    const tempPath = path.join(os.tmpdir(), dirName);
    
    await fs.mkdir(tempPath, { recursive: true });
    this.createdPaths.add(tempPath);

    const cleanup = async () => {
      try {
        await fs.rmdir(tempPath, { recursive: true });
        this.createdPaths.delete(tempPath);
      } catch (error) {
        // Cleanup failures shouldn't break tests
        console.warn(`Failed to cleanup temp directory ${tempPath}:`, error);
      }
    };

    const createFile = async (name: string, content: Buffer | string): Promise<TempFile> => {
      const filePath = path.join(tempPath, name);
      const buffer = content instanceof Buffer ? content : Buffer.from(content, 'utf-8');
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, buffer);
      
      return {
        path: filePath,
        content: buffer,
        cleanup: async () => {
          try {
            await fs.unlink(filePath);
          } catch (error) {
            // File might already be deleted
            console.warn(`Failed to cleanup file ${filePath}:`, error);
          }
        }
      };
    };

    const createSubDir = async (name: string): Promise<TempDirectory> => {
      const subDirPath = path.join(tempPath, name);
      await fs.mkdir(subDirPath, { recursive: true });
      
      const subCleanup = async () => {
        try {
          await fs.rmdir(subDirPath, { recursive: true });
        } catch (error) {
          console.warn(`Failed to cleanup subdirectory ${subDirPath}:`, error);
        }
      };

      return {
        path: subDirPath,
        cleanup: subCleanup,
        createFile: async (fileName: string, content: Buffer | string) => {
          return createFile(path.join(name, fileName), content);
        },
        createSubDir: async (subName: string) => {
          return createSubDir(path.join(name, subName));
        }
      };
    };

    return {
      path: tempPath,
      cleanup,
      createFile,
      createSubDir
    };
  }

  /**
   * Create a temporary file
   */
  static async createTempFile(
    content: Buffer | string,
    options?: {
      name?: string;
      extension?: string;
      directory?: string;
    }
  ): Promise<TempFile> {
    const fileName = options?.name || `test-file-${randomUUID()}`;
    const extension = options?.extension || '.tmp';
    const fullName = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
    
    const directory = options?.directory || os.tmpdir();
    const filePath = path.join(directory, fullName);
    
    const buffer = content instanceof Buffer ? content : Buffer.from(content, 'utf-8');
    await fs.writeFile(filePath, buffer);
    
    this.createdPaths.add(filePath);

    return {
      path: filePath,
      content: buffer,
      cleanup: async () => {
        try {
          await fs.unlink(filePath);
          this.createdPaths.delete(filePath);
        } catch (error) {
          console.warn(`Failed to cleanup file ${filePath}:`, error);
        }
      }
    };
  }

  /**
   * Create test files with various formats
   */
  static async createTestFiles(directory: TempDirectory): Promise<{
    csv: TempFile;
    json: TempFile;
    pdf: TempFile;
    docx: TempFile;
    txt: TempFile;
    malicious: TempFile;
    large: TempFile;
    empty: TempFile;
  }> {
    // Valid CSV content
    const csvContent = `Code,Description,Type,Strand,Grade,Subject
A1.1,Students will demonstrate understanding of numbers,specific,Number Sense,1,Mathematics
A1.2,Students will solve addition problems,specific,Number Sense,1,Mathematics
A.1,Overall expectations for number sense,overall,Number Sense,1,Mathematics`;

    // Valid JSON content
    const jsonContent = JSON.stringify({
      subject: "Mathematics",
      grade: 1,
      expectations: [
        {
          code: "A1.1",
          description: "Students will demonstrate understanding of numbers",
          type: "specific",
          strand: "Number Sense"
        },
        {
          code: "A1.2", 
          description: "Students will solve addition problems",
          type: "specific",
          strand: "Number Sense"
        }
      ]
    }, null, 2);

    // Simple PDF-like content (not real PDF but has PDF header)
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
    const pdfContent = Buffer.concat([pdfHeader, Buffer.from('\nFake PDF content for testing\n')]);

    // Simple DOCX-like content (ZIP signature)
    const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // ZIP signature
    const docxContent = Buffer.concat([docxHeader, Buffer.from('Fake DOCX content for testing')]);

    // Text content
    const txtContent = 'Simple text file content for testing';

    // Malicious content (script in CSV)
    const maliciousContent = `Name,Script
Test,"<script>alert('xss')</script>"
User,"'; DROP TABLE users; --"`;

    // Large file content (1MB)
    const largeContent = Buffer.alloc(1024 * 1024, 'A');

    // Empty file
    const emptyContent = Buffer.alloc(0);

    return {
      csv: await directory.createFile('test.csv', csvContent),
      json: await directory.createFile('test.json', jsonContent),
      pdf: await directory.createFile('test.pdf', pdfContent),
      docx: await directory.createFile('test.docx', docxContent),
      txt: await directory.createFile('test.txt', txtContent),
      malicious: await directory.createFile('malicious.csv', maliciousContent),
      large: await directory.createFile('large.txt', largeContent),
      empty: await directory.createFile('empty.txt', emptyContent)
    };
  }

  /**
   * Create files with permission issues for error testing
   */
  static async createPermissionTestFiles(directory: TempDirectory): Promise<{
    readonly: TempFile;
    noRead: TempFile;
    noWrite: TempFile;
  }> {
    const content = 'Test content for permission testing';
    
    const readonly = await directory.createFile('readonly.txt', content);
    const noRead = await directory.createFile('noread.txt', content);
    const noWrite = await directory.createFile('nowrite.txt', content);

    // Set permissions (Unix-like systems only)
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(readonly.path, 0o444); // Read-only
        await fs.chmod(noRead.path, 0o000);   // No permissions
        await fs.chmod(noWrite.path, 0o444);  // Read-only (can't write)
      } catch (error) {
        console.warn('Failed to set test file permissions:', error);
      }
    }

    return { readonly, noRead, noWrite };
  }

  /**
   * Create directory structure for testing
   */
  static async createDirectoryStructure(baseDir: TempDirectory): Promise<{
    uploads: TempDirectory;
    processed: TempDirectory;
    templates: TempDirectory;
    exports: TempDirectory;
  }> {
    return {
      uploads: await baseDir.createSubDir('uploads'),
      processed: await baseDir.createSubDir('processed'),
      templates: await baseDir.createSubDir('templates'),
      exports: await baseDir.createSubDir('exports')
    };
  }

  /**
   * Verify file exists and has expected content
   */
  static async verifyFile(filePath: string, expectedContent?: Buffer | string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return false;
      }

      if (expectedContent) {
        const actualContent = await fs.readFile(filePath);
        const expected = expectedContent instanceof Buffer 
          ? expectedContent 
          : Buffer.from(expectedContent, 'utf-8');
        
        return actualContent.equals(expected);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   */
  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Read file with error handling
   */
  static async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  /**
   * Write file with error handling
   */
  static async writeFile(filePath: string, content: Buffer | string): Promise<void> {
    const buffer = content instanceof Buffer ? content : Buffer.from(content, 'utf-8');
    await fs.writeFile(filePath, buffer);
  }

  /**
   * Copy file
   */
  static async copyFile(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  /**
   * Move file
   */
  static async moveFile(source: string, destination: string): Promise<void> {
    await fs.rename(source, destination);
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  /**
   * List files in directory
   */
  static async listFiles(directoryPath: string): Promise<string[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries.filter(entry => entry.isFile()).map(entry => entry.name);
  }

  /**
   * Clean up all created files and directories
   */
  static async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.createdPaths).map(async (path) => {
      try {
        const stats = await fs.stat(path);
        if (stats.isDirectory()) {
          await fs.rmdir(path, { recursive: true });
        } else {
          await fs.unlink(path);
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${path}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
    this.createdPaths.clear();
  }

  /**
   * Simulate disk space errors by creating a very large file
   */
  static async simulateDiskSpaceError(directory: TempDirectory): Promise<TempFile> {
    // Create a 100MB file to potentially trigger disk space issues in tests
    const largeContent = Buffer.alloc(100 * 1024 * 1024, 'X');
    return directory.createFile('disk-space-test.bin', largeContent);
  }

  /**
   * Create corrupted file for testing error handling
   */
  static async createCorruptedFile(directory: TempDirectory, type: 'pdf' | 'docx' | 'zip'): Promise<TempFile> {
    let corruptedContent: Buffer;
    let filename: string;

    switch (type) {
      case 'pdf':
        // PDF with correct header but corrupted body
        corruptedContent = Buffer.concat([
          Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF header
          Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), // Corrupted data
        ]);
        filename = 'corrupted.pdf';
        break;
      case 'docx':
        // DOCX with ZIP header but corrupted ZIP data
        corruptedContent = Buffer.concat([
          Buffer.from([0x50, 0x4b, 0x03, 0x04]), // ZIP header
          Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), // Corrupted data
        ]);
        filename = 'corrupted.docx';
        break;
      case 'zip':
        // Corrupted ZIP file
        corruptedContent = Buffer.concat([
          Buffer.from([0x50, 0x4b]), // Partial ZIP header
          Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), // Corrupted data
        ]);
        filename = 'corrupted.zip';
        break;
    }

    return directory.createFile(filename, corruptedContent);
  }

  /**
   * Monitor file system operations (for testing)
   */
  static createFileWatcher(filePath: string): {
    events: Array<{ type: string; timestamp: Date }>;
    cleanup: () => void;
  } {
    const events: Array<{ type: string; timestamp: Date }> = [];
    
    const watcher = fs.watch(filePath, (eventType) => {
      events.push({ type: eventType, timestamp: new Date() });
    });

    return {
      events,
      cleanup: () => watcher.close()
    };
  }
}

/**
 * Jest setup and teardown helpers
 */
export class FileSystemTestSetup {
  private static testDir: TempDirectory | null = null;

  /**
   * Setup before all tests
   */
  static async beforeAll(): Promise<TempDirectory> {
    this.testDir = await FileSystemTestUtils.createTempDir('jest-suite');
    return this.testDir;
  }

  /**
   * Cleanup after all tests
   */
  static async afterAll(): Promise<void> {
    if (this.testDir) {
      await this.testDir.cleanup();
      this.testDir = null;
    }
    await FileSystemTestUtils.cleanupAll();
  }

  /**
   * Get the test directory
   */
  static getTestDir(): TempDirectory {
    if (!this.testDir) {
      throw new Error('Test directory not initialized. Call beforeAll() first.');
    }
    return this.testDir;
  }
}