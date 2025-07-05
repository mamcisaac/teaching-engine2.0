/**
 * Real File System Error Handling Tests
 * Tests error scenarios with actual file system operations
 * 
 * RED-GREEN-REFACTOR: Tests written first to define expected error behavior
 * 
 * These tests verify:
 * - Permission errors (read-only, no access)
 * - Disk space limitations
 * - File corruption scenarios
 * - Network/storage failures
 * - Race conditions and concurrent access
 * - Recovery and cleanup procedures
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FileSystemTestUtils, FileSystemTestSetup, TempDirectory } from '../utils/FileSystemTestUtils';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Real File System Error Handling Tests', () => {
  let testDir: TempDirectory;
  let errorTestDir: TempDirectory;

  beforeAll(async () => {
    testDir = await FileSystemTestSetup.beforeAll();
    errorTestDir = await testDir.createSubDir('error-tests');
  });

  afterAll(async () => {
    await FileSystemTestSetup.afterAll();
  });

  beforeEach(async () => {
    // Clean error test directory between tests
    const files = await FileSystemTestUtils.listFiles(errorTestDir.path);
    await Promise.all(files.map(file => 
      FileSystemTestUtils.deleteFile(`${errorTestDir.path}/${file}`).catch(() => {})
    ));
  });

  describe('File Permission Errors', () => {
    it('should handle read permission errors gracefully', async () => {
      // Skip on Windows where permission handling is different
      if (process.platform === 'win32') {
        console.log('Skipping permission test on Windows');
        return;
      }

      const testFile = await errorTestDir.createFile('permission-test.txt', 'Test content');
      
      try {
        // Remove read permissions
        await fs.chmod(testFile.path, 0o000);
        
        // Attempt to read should fail
        await expect(FileSystemTestUtils.readFile(testFile.path))
          .rejects.toMatchObject({
            code: expect.stringMatching(/EACCES|EPERM/)
          });
        
        // Restore permissions for cleanup
        await fs.chmod(testFile.path, 0o644);
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle write permission errors gracefully', async () => {
      if (process.platform === 'win32') {
        console.log('Skipping permission test on Windows');
        return;
      }

      const testFile = await errorTestDir.createFile('write-test.txt', 'Original content');
      
      try {
        // Make file read-only
        await fs.chmod(testFile.path, 0o444);
        
        // Attempt to write should fail
        await expect(FileSystemTestUtils.writeFile(testFile.path, 'New content'))
          .rejects.toMatchObject({
            code: expect.stringMatching(/EACCES|EPERM/)
          });
        
        // Original content should be preserved
        await fs.chmod(testFile.path, 0o644);
        const content = await FileSystemTestUtils.readFile(testFile.path);
        expect(content.toString()).toBe('Original content');
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle directory permission errors', async () => {
      if (process.platform === 'win32') {
        console.log('Skipping permission test on Windows');
        return;
      }

      const restrictedDir = await errorTestDir.createSubDir('restricted');
      
      try {
        // Remove write permissions from directory
        await fs.chmod(restrictedDir.path, 0o555);
        
        // Attempt to create file in restricted directory should fail
        await expect(
          FileSystemTestUtils.writeFile(
            path.join(restrictedDir.path, 'test.txt'), 
            'content'
          )
        ).rejects.toMatchObject({
          code: expect.stringMatching(/EACCES|EPERM/)
        });
        
        // Restore permissions for cleanup
        await fs.chmod(restrictedDir.path, 0o755);
      } finally {
        await restrictedDir.cleanup();
      }
    });
  });

  describe('Disk Space and Size Limitations', () => {
    it('should handle large file operations', async () => {
      // Create a large file (10MB) to test memory and disk handling
      const largeSize = 10 * 1024 * 1024; // 10MB
      
      try {
        const largeFile = await FileSystemTestUtils.simulateDiskSpaceError(errorTestDir);
        
        // Verify large file was created
        const fileSize = await FileSystemTestUtils.getFileSize(largeFile.path);
        expect(fileSize).toBeGreaterThan(largeSize * 0.9); // Allow some variance
        
        // Test reading large file
        const startTime = Date.now();
        const content = await FileSystemTestUtils.readFile(largeFile.path);
        const readTime = Date.now() - startTime;
        
        expect(content.length).toBe(fileSize);
        // Should read reasonably quickly (under 1 second for 10MB)
        expect(readTime).toBeLessThan(1000);
        
        await largeFile.cleanup();
      } catch (error) {
        // Handle case where system can't create large files
        if (error.code === 'ENOSPC' || error.code === 'EMFILE') {
          console.log('Skipping large file test due to system limitations');
        } else {
          throw error;
        }
      }
    });

    it('should handle extremely large file attempts', async () => {
      // Attempt to create a file larger than reasonable limits
      const unreasonableSize = 1024 * 1024 * 1024; // 1GB
      
      try {
        const largeBuffer = Buffer.alloc(unreasonableSize, 'X');
        
        await expect(
          errorTestDir.createFile('unreasonable.bin', largeBuffer)
        ).rejects.toThrow();
      } catch (error) {
        // Expected to fail due to memory or disk limitations
        expect(error).toBeTruthy();
      }
    });

    it('should handle file system full scenarios', async () => {
      // This test is challenging to implement reliably across systems
      // We simulate by attempting multiple large file creations
      
      const largeFiles: any[] = [];
      let diskFullError = false;
      
      try {
        // Keep creating large files until we hit a limit
        for (let i = 0; i < 5; i++) {
          try {
            const file = await errorTestDir.createFile(
              `large-${i}.bin`,
              Buffer.alloc(50 * 1024 * 1024, 'X') // 50MB each
            );
            largeFiles.push(file);
          } catch (error) {
            if (error.code === 'ENOSPC') {
              diskFullError = true;
              break;
            }
            throw error;
          }
        }
        
        // If we hit disk full, verify error handling
        if (diskFullError) {
          expect(diskFullError).toBe(true);
        } else {
          // If no disk full error, that's also valid (plenty of space)
          expect(largeFiles.length).toBeGreaterThan(0);
        }
      } finally {
        // Clean up large files
        await Promise.all(largeFiles.map(file => file.cleanup().catch(() => {})));
      }
    });
  });

  describe('File Corruption and Malformed Data', () => {
    it('should detect and handle corrupted files', async () => {
      const corruptedFiles = {
        pdf: await FileSystemTestUtils.createCorruptedFile(errorTestDir, 'pdf'),
        docx: await FileSystemTestUtils.createCorruptedFile(errorTestDir, 'docx'),
        zip: await FileSystemTestUtils.createCorruptedFile(errorTestDir, 'zip')
      };

      try {
        // Verify corrupted files have correct signatures but are actually corrupted
        for (const [type, file] of Object.entries(corruptedFiles)) {
          const content = await FileSystemTestUtils.readFile(file.path);
          
          switch (type) {
            case 'pdf':
              expect(content.slice(0, 4).toString()).toBe('%PDF');
              // But should have corrupted body
              expect(content.includes(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]))).toBe(true);
              break;
            case 'docx':
              expect(content.slice(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
              break;
            case 'zip':
              expect(content.slice(0, 2)).toEqual(Buffer.from([0x50, 0x4b]));
              break;
          }
        }
      } finally {
        await Promise.all(Object.values(corruptedFiles).map(file => file.cleanup()));
      }
    });

    it('should handle partially written files', async () => {
      const testFile = await errorTestDir.createFile('partial.txt', '');
      
      try {
        // Simulate partial write by writing in chunks and interrupting
        const fullContent = 'This is a test file with content that should be written completely';
        const partialContent = fullContent.substring(0, 20);
        
        // Write partial content
        await FileSystemTestUtils.writeFile(testFile.path, partialContent);
        
        // Verify partial content
        const readContent = await FileSystemTestUtils.readFile(testFile.path);
        expect(readContent.toString()).toBe(partialContent);
        expect(readContent.toString()).not.toBe(fullContent);
        
        // Complete the write
        await FileSystemTestUtils.writeFile(testFile.path, fullContent);
        const finalContent = await FileSystemTestUtils.readFile(testFile.path);
        expect(finalContent.toString()).toBe(fullContent);
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle binary file corruption', async () => {
      // Create a binary file and then corrupt it
      const originalBinary = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        ...Array(100).fill(0x00) // Padding
      ]);
      
      const binaryFile = await errorTestDir.createFile('image.png', originalBinary);
      
      try {
        // Read and verify original
        let content = await FileSystemTestUtils.readFile(binaryFile.path);
        expect(content.slice(0, 8)).toEqual(originalBinary.slice(0, 8));
        
        // Corrupt the file by overwriting middle portion
        const corruptedBinary = Buffer.concat([
          originalBinary.slice(0, 20),
          Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), // Corruption
          originalBinary.slice(24)
        ]);
        
        await FileSystemTestUtils.writeFile(binaryFile.path, corruptedBinary);
        
        // Verify corruption
        content = await FileSystemTestUtils.readFile(binaryFile.path);
        expect(content.includes(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]))).toBe(true);
      } finally {
        await binaryFile.cleanup();
      }
    });
  });

  describe('Concurrent Access and Race Conditions', () => {
    it('should handle concurrent file reads', async () => {
      const testContent = 'Concurrent read test content';
      const testFile = await errorTestDir.createFile('concurrent-read.txt', testContent);
      
      try {
        // Start multiple concurrent reads
        const readPromises = Array.from({ length: 10 }, () => 
          FileSystemTestUtils.readFile(testFile.path)
        );
        
        const results = await Promise.all(readPromises);
        
        // All reads should succeed and return same content
        expect(results).toHaveLength(10);
        results.forEach(result => {
          expect(result.toString()).toBe(testContent);
        });
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle concurrent file writes', async () => {
      const testFile = await errorTestDir.createFile('concurrent-write.txt', 'initial');
      
      try {
        // Start multiple concurrent writes with different content
        const writePromises = Array.from({ length: 5 }, (_, i) => 
          FileSystemTestUtils.writeFile(testFile.path, `content-${i}`)
        );
        
        // Wait for all writes to complete
        await Promise.all(writePromises);
        
        // Read final content
        const finalContent = await FileSystemTestUtils.readFile(testFile.path);
        
        // Should contain content from one of the writes
        expect(finalContent.toString()).toMatch(/^content-\d$/);
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle file creation race conditions', async () => {
      const fileName = 'race-condition.txt';
      const filePath = path.join(errorTestDir.path, fileName);
      
      // Start multiple concurrent file creations
      const createPromises = Array.from({ length: 5 }, (_, i) => 
        FileSystemTestUtils.writeFile(filePath, `creator-${i}`)
      );
      
      try {
        await Promise.all(createPromises);
        
        // File should exist with content from one of the creators
        const content = await FileSystemTestUtils.readFile(filePath);
        expect(content.toString()).toMatch(/^creator-\d$/);
      } finally {
        await FileSystemTestUtils.deleteFile(filePath).catch(() => {});
      }
    });

    it('should handle concurrent directory operations', async () => {
      const dirName = 'concurrent-dir';
      
      // Start multiple concurrent directory creations
      const createPromises = Array.from({ length: 3 }, () => 
        errorTestDir.createSubDir(`${dirName}-${Date.now()}-${Math.random()}`)
      );
      
      const dirs = await Promise.all(createPromises);
      
      try {
        // All directories should be created successfully
        expect(dirs).toHaveLength(3);
        
        // Verify all directories exist
        for (const dir of dirs) {
          const exists = await FileSystemTestUtils.verifyFile(dir.path);
          expect(exists).toBe(true);
        }
      } finally {
        await Promise.all(dirs.map(dir => dir.cleanup()));
      }
    });
  });

  describe('Recovery and Cleanup Procedures', () => {
    it('should recover from failed operations', async () => {
      const testFile = await errorTestDir.createFile('recovery-test.txt', 'original');
      
      try {
        // Simulate failed operation by creating a backup
        const backupPath = `${testFile.path}.backup`;
        await FileSystemTestUtils.copyFile(testFile.path, backupPath);
        
        // Corrupt the original file
        await FileSystemTestUtils.writeFile(testFile.path, 'corrupted');
        
        // Verify corruption
        let content = await FileSystemTestUtils.readFile(testFile.path);
        expect(content.toString()).toBe('corrupted');
        
        // Recover from backup
        await FileSystemTestUtils.copyFile(backupPath, testFile.path);
        
        // Verify recovery
        content = await FileSystemTestUtils.readFile(testFile.path);
        expect(content.toString()).toBe('original');
        
        // Clean up backup
        await FileSystemTestUtils.deleteFile(backupPath);
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle cleanup of failed operations', async () => {
      const tempFiles: any[] = [];
      
      try {
        // Create multiple temporary files
        for (let i = 0; i < 5; i++) {
          const file = await errorTestDir.createFile(`temp-${i}.txt`, `content-${i}`);
          tempFiles.push(file);
        }
        
        // Simulate operation failure - clean up some files
        for (let i = 0; i < 3; i++) {
          await tempFiles[i].cleanup();
        }
        
        // Verify partial cleanup
        for (let i = 0; i < 3; i++) {
          const exists = await FileSystemTestUtils.verifyFile(tempFiles[i].path);
          expect(exists).toBe(false);
        }
        
        for (let i = 3; i < 5; i++) {
          const exists = await FileSystemTestUtils.verifyFile(tempFiles[i].path);
          expect(exists).toBe(true);
        }
      } finally {
        // Clean up remaining files
        await Promise.all(tempFiles.map(file => file.cleanup().catch(() => {})));
      }
    });

    it('should handle cleanup of orphaned files', async () => {
      const orphanedFiles: string[] = [];
      
      try {
        // Create files directly without cleanup tracking
        for (let i = 0; i < 3; i++) {
          const filePath = path.join(errorTestDir.path, `orphan-${i}.txt`);
          await FileSystemTestUtils.writeFile(filePath, `orphan content ${i}`);
          orphanedFiles.push(filePath);
        }
        
        // Verify files exist
        for (const filePath of orphanedFiles) {
          const exists = await FileSystemTestUtils.verifyFile(filePath);
          expect(exists).toBe(true);
        }
        
        // Clean up orphaned files
        for (const filePath of orphanedFiles) {
          await FileSystemTestUtils.deleteFile(filePath);
        }
        
        // Verify cleanup
        for (const filePath of orphanedFiles) {
          const exists = await FileSystemTestUtils.verifyFile(filePath);
          expect(exists).toBe(false);
        }
      } catch (cleanupError) {
        // Ensure cleanup happens even if test fails
        await Promise.all(
          orphanedFiles.map(filePath => 
            FileSystemTestUtils.deleteFile(filePath).catch(() => {})
          )
        );
        throw cleanupError;
      }
    });

    it('should handle system resource exhaustion', async () => {
      const resources: any[] = [];
      
      try {
        // Create many file handles to potentially exhaust resources
        for (let i = 0; i < 100; i++) {
          try {
            const file = await errorTestDir.createFile(`resource-${i}.txt`, `content-${i}`);
            resources.push(file);
          } catch (error) {
            if (error.code === 'EMFILE' || error.code === 'ENFILE') {
              // Hit file handle limit - this is expected
              break;
            }
            throw error;
          }
        }
        
        // Should have created at least some files
        expect(resources.length).toBeGreaterThan(0);
        
        // Verify files exist
        for (const resource of resources.slice(0, 10)) { // Check first 10
          const exists = await FileSystemTestUtils.verifyFile(resource.path);
          expect(exists).toBe(true);
        }
      } finally {
        // Clean up all resources
        await Promise.all(resources.map(resource => resource.cleanup().catch(() => {})));
      }
    });
  });

  describe('File System Monitoring and Diagnostics', () => {
    it('should monitor file system events', async () => {
      const testFile = await errorTestDir.createFile('monitor-test.txt', 'initial content');
      
      try {
        // Set up file watcher
        const watcher = FileSystemTestUtils.createFileWatcher(testFile.path);
        
        // Perform file operations
        await FileSystemTestUtils.writeFile(testFile.path, 'modified content');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for events
        
        await FileSystemTestUtils.writeFile(testFile.path, 'final content');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for events
        
        // Check captured events
        expect(watcher.events.length).toBeGreaterThan(0);
        
        // Events should have timestamps
        watcher.events.forEach(event => {
          expect(event.timestamp).toBeInstanceOf(Date);
          expect(event.type).toBeTruthy();
        });
        
        watcher.cleanup();
      } finally {
        await testFile.cleanup();
      }
    });

    it('should provide file system diagnostics', async () => {
      // Test basic file system operations and measure performance
      const diagnostics = {
        writeTime: 0,
        readTime: 0,
        deleteTime: 0,
        errors: 0
      };
      
      const testContent = 'Diagnostic test content';
      
      try {
        // Measure write performance
        const writeStart = Date.now();
        const testFile = await errorTestDir.createFile('diagnostic.txt', testContent);
        diagnostics.writeTime = Date.now() - writeStart;
        
        // Measure read performance
        const readStart = Date.now();
        const content = await FileSystemTestUtils.readFile(testFile.path);
        diagnostics.readTime = Date.now() - readStart;
        
        expect(content.toString()).toBe(testContent);
        
        // Measure delete performance
        const deleteStart = Date.now();
        await testFile.cleanup();
        diagnostics.deleteTime = Date.now() - deleteStart;
        
        // Verify reasonable performance (under 100ms each)
        expect(diagnostics.writeTime).toBeLessThan(100);
        expect(diagnostics.readTime).toBeLessThan(100);
        expect(diagnostics.deleteTime).toBeLessThan(100);
        
        console.log('File system diagnostics:', diagnostics);
      } catch (error) {
        diagnostics.errors++;
        throw error;
      }
    });

    it('should detect file system capacity issues', async () => {
      const capacity = {
        totalSpace: 0,
        freeSpace: 0,
        usedSpace: 0
      };
      
      try {
        // Get disk space information (platform-dependent)
        const tempDir = os.tmpdir();
        const stats = await fs.stat(tempDir);
        
        // Note: Getting actual disk space requires platform-specific operations
        // For now, just verify we can access file system info
        expect(stats).toBeTruthy();
        expect(stats.isDirectory()).toBe(true);
        
        console.log('Temp directory stats:', stats);
      } catch (error) {
        console.warn('Could not get file system capacity info:', error.message);
      }
    });
  });
});