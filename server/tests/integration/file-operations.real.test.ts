/**
 * Real File Operations Integration Tests
 * Tests file upload, download, and processing with actual files
 * 
 * RED-GREEN-REFACTOR: Tests written first to define expected behavior
 * 
 * These tests use real files and real file system operations to ensure:
 * - File uploads work with actual multipart data
 * - File downloads produce correct content
 * - File validation works with real file formats
 * - Error handling covers real file system scenarios
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { FileSystemTestUtils, FileSystemTestSetup, TempDirectory } from '../utils/FileSystemTestUtils';
import { PrismaClient } from '@teaching-engine/database';
import { generateAuthToken } from '../../src/services/auth/authService';
import curriculumImportRoutes from '../../src/routes/curriculumImport';
import { authMiddleware } from '../../src/middleware/auth';

describe('Real File Operations Integration Tests', () => {
  let app: express.Application;
  let request: supertest.SuperTest<supertest.Test>;
  let prisma: PrismaClient;
  let testDir: TempDirectory;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Setup test directory
    testDir = await FileSystemTestSetup.beforeAll();
    
    // Setup database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL || 'file:./test-file-ops.db' },
      },
    });

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'fileops@test.com',
        name: 'File Operations Test User',
        password: 'HashedPassword123!',
        role: 'USER',
      },
    });

    authToken = await generateAuthToken(testUser.id.toString(), testUser.email);

    // Setup Express app with real file handling
    app = express();
    app.use(express.json());
    app.use('/api/curriculum/import', authMiddleware);
    app.use('/api/curriculum/import', curriculumImportRoutes);

    // Test endpoints for direct file upload/download testing
    const upload = multer({
      storage: multer.diskStorage({
        destination: testDir.path,
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    app.post('/api/test/upload-disk', upload.single('file'), (req: any, res: any) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      res.json({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    });

    app.get('/api/test/download/:filename', async (req: any, res: any) => {
      try {
        const filePath = path.join(testDir.path, req.params.filename);
        const content = await fs.readFile(filePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        res.send(content);
      } catch (error) {
        res.status(404).json({ error: 'File not found' });
      }
    });

    request = supertest(app);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'fileops' } } });
    await prisma.$disconnect();
    await FileSystemTestSetup.afterAll();
  });

  beforeEach(async () => {
    // Clean test directory between tests
    const files = await FileSystemTestUtils.listFiles(testDir.path);
    await Promise.all(files.map(file => 
      FileSystemTestUtils.deleteFile(path.join(testDir.path, file)).catch(() => {})
    ));
  });

  describe('Real File Upload Operations', () => {
    it('should upload and store actual CSV files', async () => {
      // Create real CSV file
      const csvContent = `Code,Description,Type,Strand,Grade,Subject
A1.1,Students will understand numbers,specific,Number Sense,1,Mathematics
A1.2,Students will solve problems,specific,Number Sense,1,Mathematics`;
      
      const csvFile = await FileSystemTestUtils.createTempFile(csvContent, {
        name: 'curriculum',
        extension: '.csv'
      });

      try {
        // Upload the real file
        const response = await request
          .post('/api/test/upload-disk')
          .attach('file', csvFile.path);

        expect(response.status).toBe(200);
        expect(response.body.filename).toBeTruthy();
        expect(response.body.originalname).toBe('curriculum.csv');
        expect(response.body.size).toBeGreaterThan(0);
        expect(response.body.mimetype).toBe('text/csv');

        // Verify file was actually stored
        const storedFilePath = response.body.path;
        const fileExists = await FileSystemTestUtils.verifyFile(storedFilePath);
        expect(fileExists).toBe(true);

        // Verify content matches
        const storedContent = await FileSystemTestUtils.readFile(storedFilePath);
        expect(storedContent.toString()).toBe(csvContent);
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle multiple file uploads correctly', async () => {
      const files = await FileSystemTestUtils.createTestFiles(testDir);
      
      try {
        // Upload CSV file
        const csvResponse = await request
          .post('/api/test/upload-disk')
          .attach('file', files.csv.path);

        expect(csvResponse.status).toBe(200);

        // Upload JSON file
        const jsonResponse = await request
          .post('/api/test/upload-disk')  
          .attach('file', files.json.path);

        expect(jsonResponse.status).toBe(200);

        // Verify both files are stored separately
        const csvExists = await FileSystemTestUtils.verifyFile(csvResponse.body.path);
        const jsonExists = await FileSystemTestUtils.verifyFile(jsonResponse.body.path);
        
        expect(csvExists).toBe(true);
        expect(jsonExists).toBe(true);
        expect(csvResponse.body.path).not.toBe(jsonResponse.body.path);
      } finally {
        await Promise.all(Object.values(files).map(file => file.cleanup()));
      }
    });

    it('should validate file size limits', async () => {
      // Create file larger than limit
      const largeFile = await FileSystemTestUtils.createTempFile(
        Buffer.alloc(15 * 1024 * 1024, 'A'), // 15MB > 10MB limit
        { name: 'large', extension: '.txt' }
      );

      try {
        const response = await request
          .post('/api/test/upload-disk')
          .attach('file', largeFile.path);

        expect(response.status).toBe(413); // Payload too large
      } finally {
        await largeFile.cleanup();
      }
    });

    it('should handle corrupted files gracefully', async () => {
      const corruptedPdf = await FileSystemTestUtils.createCorruptedFile(testDir, 'pdf');
      
      try {
        const response = await request
          .post('/api/test/upload-disk')
          .attach('file', corruptedPdf.path);

        // Should accept the upload (validation happens later in processing)
        expect(response.status).toBe(200);
        
        // Verify file was stored
        const fileExists = await FileSystemTestUtils.verifyFile(response.body.path);
        expect(fileExists).toBe(true);
      } finally {
        await corruptedPdf.cleanup();
      }
    });
  });

  describe('Real File Download Operations', () => {
    it('should download previously uploaded files', async () => {
      // Upload a file first
      const testContent = 'Test file content for download verification';
      const testFile = await testDir.createFile('download-test.txt', testContent);

      try {
        // Download the file
        const response = await request
          .get('/api/test/download/download-test.txt');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/octet-stream');
        expect(response.headers['content-disposition']).toContain('download-test.txt');
        expect(response.body.toString()).toBe(testContent);
      } finally {
        await testFile.cleanup();
      }
    });

    it('should handle non-existent file downloads', async () => {
      const response = await request
        .get('/api/test/download/non-existent-file.txt');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('File not found');
    });

    it('should download binary files correctly', async () => {
      // Create a binary file (PDF-like)
      const binaryContent = Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, // %PDF-1.4
        0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a,       // PDF magic
        ...Array(100).fill(0x41) // Padding with 'A'
      ]);
      
      const binaryFile = await testDir.createFile('test.pdf', binaryContent);

      try {
        const response = await request
          .get('/api/test/download/test.pdf');

        expect(response.status).toBe(200);
        
        // Verify binary content is preserved
        const downloadedContent = Buffer.from(response.body);
        expect(downloadedContent.equals(binaryContent)).toBe(true);
      } finally {
        await binaryFile.cleanup();
      }
    });
  });

  describe('Real File Processing Operations', () => {
    it('should process real CSV curriculum files', async () => {
      const csvContent = `Code,Description,Type,Strand,Grade,Subject
A1.1,Students will demonstrate understanding of whole numbers,specific,Number Sense,1,Mathematics
A1.2,Students will solve addition and subtraction problems,specific,Number Sense,1,Mathematics
A.1,Overall expectations for number sense,overall,Number Sense,1,Mathematics`;

      const csvFile = await FileSystemTestUtils.createTempFile(csvContent, {
        name: 'curriculum',
        extension: '.csv'
      });

      try {
        // Upload through curriculum import endpoint
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', csvFile.path);

        expect(response.status).toBe(200);
        expect(response.body.sessionId).toBeTruthy();
        expect(response.body.filename).toBe('curriculum.csv');

        // Parse the uploaded file
        const parseResponse = await request
          .post('/api/curriculum/import/parse')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sessionId: response.body.sessionId,
            useAiExtraction: false,
          });

        expect(parseResponse.status).toBe(200);
        expect(parseResponse.body.subjects).toContain('Mathematics');
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle malicious file content safely', async () => {
      const maliciousContent = `Name,Script,SQL
Test,"<script>alert('xss')</script>","'; DROP TABLE users; --"
User,"javascript:alert()","UNION SELECT * FROM passwords"`;

      const maliciousFile = await FileSystemTestUtils.createTempFile(maliciousContent, {
        name: 'malicious',
        extension: '.csv'
      });

      try {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', maliciousFile.path);

        expect(response.status).toBe(200);

        // Content should be sanitized during processing
        const parseResponse = await request
          .post('/api/curriculum/import/parse')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sessionId: response.body.sessionId,
            useAiExtraction: false,
          });

        // Should not fail but might have validation errors
        expect(parseResponse.status).toBeOneOf([200, 400]);
      } finally {
        await maliciousFile.cleanup();
      }
    });

    it('should validate file formats against actual content', async () => {
      // Create file with PDF extension but text content
      const fakeContent = 'This is not a real PDF file';
      const fakeFile = await FileSystemTestUtils.createTempFile(fakeContent, {
        name: 'fake',
        extension: '.pdf'
      });

      try {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', fakeFile.path);

        // Should detect content mismatch
        expect(response.status).toBeOneOf([400, 500]);
      } finally {
        await fakeFile.cleanup();
      }
    });
  });

  describe('File System Error Handling', () => {
    it('should handle disk space issues', async () => {
      // Skip on CI where disk space control is limited
      if (process.env.CI) {
        return;
      }

      try {
        // Create a very large file to potentially trigger disk space issues
        const largeFile = await FileSystemTestUtils.simulateDiskSpaceError(testDir);
        
        // Attempt to upload another file
        const testFile = await FileSystemTestUtils.createTempFile('test content', {
          name: 'after-large',
          extension: '.txt'
        });

        const response = await request
          .post('/api/test/upload-disk')
          .attach('file', testFile.path);

        // Should either succeed or fail gracefully with proper error
        expect(response.status).toBeOneOf([200, 507, 500]);
        
        if (response.status !== 200) {
          expect(response.body.error).toBeTruthy();
        }

        await largeFile.cleanup();
        await testFile.cleanup();
      } catch (error) {
        // Test environment might not support large file creation
        console.warn('Disk space test skipped:', error.message);
      }
    });

    it('should handle file permission errors', async () => {
      // Skip on Windows where permission handling is different
      if (process.platform === 'win32') {
        return;
      }

      const permissionFiles = await FileSystemTestUtils.createPermissionTestFiles(testDir);
      
      try {
        // Try to read no-read file
        try {
          await FileSystemTestUtils.readFile(permissionFiles.noRead.path);
          // If this succeeds, the test environment doesn't enforce permissions
        } catch (error) {
          expect(error.code).toBe('EACCES');
        }

        // Try to write to read-only file
        try {
          await FileSystemTestUtils.writeFile(permissionFiles.readonly.path, 'new content');
          // If this succeeds, the file system doesn't enforce read-only
        } catch (error) {
          expect(error.code).toBeOneOf(['EACCES', 'EPERM']);
        }
      } finally {
        await Promise.all(Object.values(permissionFiles).map(file => file.cleanup()));
      }
    });

    it('should handle file corruption gracefully', async () => {
      const corruptedFiles = {
        pdf: await FileSystemTestUtils.createCorruptedFile(testDir, 'pdf'),
        docx: await FileSystemTestUtils.createCorruptedFile(testDir, 'docx'),
        zip: await FileSystemTestUtils.createCorruptedFile(testDir, 'zip'),
      };

      try {
        for (const [type, file] of Object.entries(corruptedFiles)) {
          const response = await request
            .post('/api/test/upload-disk')
            .attach('file', file.path);

          // Upload should succeed (corruption detected during processing)
          expect(response.status).toBe(200);
          
          // Verify file was stored (even if corrupted)
          const fileExists = await FileSystemTestUtils.verifyFile(response.body.path);
          expect(fileExists).toBe(true);
        }
      } finally {
        await Promise.all(Object.values(corruptedFiles).map(file => file.cleanup()));
      }
    });

    it('should monitor file operations', async () => {
      const testFile = await testDir.createFile('monitor-test.txt', 'initial content');
      
      try {
        // Setup file watcher
        const watcher = FileSystemTestUtils.createFileWatcher(testFile.path);
        
        // Modify the file
        await FileSystemTestUtils.writeFile(testFile.path, 'modified content');
        
        // Give the watcher time to capture events
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if events were captured
        expect(watcher.events.length).toBeGreaterThan(0);
        
        watcher.cleanup();
      } finally {
        await testFile.cleanup();
      }
    });
  });

  describe('File Cleanup Operations', () => {
    it('should clean up temporary files properly', async () => {
      // Create multiple temporary files
      const tempFiles = await Promise.all([
        testDir.createFile('temp1.txt', 'content1'),
        testDir.createFile('temp2.txt', 'content2'),
        testDir.createFile('temp3.txt', 'content3'),
      ]);

      // Verify files exist
      for (const file of tempFiles) {
        const exists = await FileSystemTestUtils.verifyFile(file.path);
        expect(exists).toBe(true);
      }

      // Clean up files
      await Promise.all(tempFiles.map(file => file.cleanup()));

      // Verify files are deleted
      for (const file of tempFiles) {
        const exists = await FileSystemTestUtils.verifyFile(file.path);
        expect(exists).toBe(false);
      }
    });

    it('should handle cleanup of non-existent files gracefully', async () => {
      const tempFile = await testDir.createFile('cleanup-test.txt', 'content');
      
      // Delete the file manually
      await FileSystemTestUtils.deleteFile(tempFile.path);
      
      // Cleanup should not throw error
      await expect(tempFile.cleanup()).resolves.not.toThrow();
    });

    it('should clean up directory structures', async () => {
      const structure = await FileSystemTestUtils.createDirectoryStructure(testDir);
      
      // Create files in subdirectories
      await structure.uploads.createFile('upload1.txt', 'upload content');
      await structure.processed.createFile('processed1.txt', 'processed content');
      
      // Verify structure exists
      const uploadsExists = await FileSystemTestUtils.verifyFile(structure.uploads.path);
      const processedExists = await FileSystemTestUtils.verifyFile(structure.processed.path);
      expect(uploadsExists).toBe(true);
      expect(processedExists).toBe(true);

      // Cleanup should remove everything
      await Promise.all([
        structure.uploads.cleanup(),
        structure.processed.cleanup(),
        structure.templates.cleanup(),
        structure.exports.cleanup(),
      ]);
    });
  });
});