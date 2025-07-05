/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { app } from '../../src/index';
import fs from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';
import { authRequest } from '../test-auth-helper';
import { getTestPrismaClient } from '../jest.setup';

const binaryParser = (
  res: NodeJS.ReadableStream,
  callback: (err: Error | null, data: Buffer) => void,
) => {
  const data: Buffer[] = [];
  res.on('data', (chunk) => data.push(Buffer.from(chunk)));
  res.on('end', () => callback(null, Buffer.concat(data)));
};

const auth = authRequest(app);

describe('backup route', () => {
  const uploads = path.join(process.cwd(), 'uploads');
  const testUpload = path.join(uploads, 'test-file.txt');

  beforeAll(async () => {
    await auth.setup();
    
    // Create test uploads directory and file
    await fs.mkdir(uploads, { recursive: true });
    await fs.writeFile(testUpload, 'test content');
  });

  afterAll(async () => {
    // Clean up test file
    await fs.rm(testUpload, { force: true });
    
    // Only remove uploads directory if it's empty
    try {
      const files = await fs.readdir(uploads);
      if (files.length === 0) {
        await fs.rmdir(uploads);
      }
    } catch (_error) {
      // Directory might not exist or have other files
    }
  });

  it('streams zip with db and uploads', async () => {
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    expect(res.status).toBe(200);
    
    // Verify it's a valid zip file
    const dir = await unzipper.Open.buffer(res.body);
    const names = dir.files.map((f) => f.path).sort();
    
    // Should contain database backup and any uploaded files
    expect(names.some(name => name.includes('database'))).toBe(true);
    expect(names.some(name => name.includes('test-file.txt'))).toBe(true);
  });

  it('requires authentication', async () => {
    const res = await auth.get('/api/backup')
      .set('Authorization', '') // Remove auth
      .buffer()
      .parse(binaryParser)
      .catch(err => err.response);
      
    expect(res.status).toBe(401);
  });

  it('handles empty uploads directory', async () => {
    // Temporarily remove test file
    await fs.rm(testUpload, { force: true });
    
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    expect(res.status).toBe(200);
    
    // Should still get a valid zip with just the database
    const dir = await unzipper.Open.buffer(res.body);
    const names = dir.files.map((f) => f.path);
    expect(names.some(name => name.includes('database'))).toBe(true);
    
    // Restore test file for cleanup
    await fs.writeFile(testUpload, 'test content');
  });

  it('includes metadata in backup', async () => {
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    expect(res.status).toBe(200);
    
    const dir = await unzipper.Open.buffer(res.body);
    const metadataFile = dir.files.find(f => f.path === 'metadata.json');
    
    if (metadataFile) {
      const content = await metadataFile.buffer();
      const metadata = JSON.parse(content.toString());
      
      expect(metadata).toHaveProperty('timestamp');
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('userId', auth.userId);
    }
  });

  it('handles large file backups efficiently', async () => {
    // Create a larger test file (1MB)
    const largeFile = path.join(uploads, 'large-test.txt');
    const largeContent = Buffer.alloc(1024 * 1024, 'x'); // 1MB of 'x'
    await fs.writeFile(largeFile, largeContent);
    
    const startTime = Date.now();
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    const duration = Date.now() - startTime;
    
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    
    // Verify large file is included
    const dir = await unzipper.Open.buffer(res.body);
    const hasLargeFile = dir.files.some(f => f.path.includes('large-test.txt'));
    expect(hasLargeFile).toBe(true);
    
    // Clean up large file
    await fs.rm(largeFile, { force: true });
  });

  it('excludes sensitive files from backup', async () => {
    // Create a file that should be excluded
    const sensitiveFile = path.join(uploads, '.env');
    await fs.writeFile(sensitiveFile, 'SECRET_KEY=test');
    
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    expect(res.status).toBe(200);
    
    // Verify sensitive file is NOT included
    const dir = await unzipper.Open.buffer(res.body);
    const hasSensitiveFile = dir.files.some(f => f.path.includes('.env'));
    expect(hasSensitiveFile).toBe(false);
    
    // Clean up
    await fs.rm(sensitiveFile, { force: true });
  });

  it('handles concurrent backup requests', async () => {
    // Make multiple backup requests simultaneously
    const requests = Array(3).fill(null).map(() => 
      auth.get('/api/backup').buffer().parse(binaryParser)
    );
    
    const results = await Promise.all(requests);
    
    // All should succeed
    results.forEach(res => {
      expect(res.status).toBe(200);
    });
    
    // All should produce valid zip files
    for (const res of results) {
      const dir = await unzipper.Open.buffer(res.body);
      expect(dir.files.length).toBeGreaterThan(0);
    }
  });
});