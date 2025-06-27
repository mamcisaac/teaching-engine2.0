import fs from 'fs/promises';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createBackup, restoreBackup } from '../../src/services/backupService';

describe('backup service', () => {
  const dbPath = path.resolve('test-backup.sqlite');
  // Use the same uploads path that the service uses: src/uploads
  const uploads = path.join(process.cwd(), 'server/src/uploads');

  beforeAll(async () => {
    process.env.DATABASE_URL = `file:${dbPath}`;
    await fs.writeFile(dbPath, 'data');
    await fs.mkdir(uploads, { recursive: true });
    await fs.writeFile(path.join(uploads, 'file.txt'), 'hi');
  });

  afterAll(async () => {
    await fs.rm(dbPath, { force: true });
    await fs.rm(uploads, { recursive: true, force: true });
  });

  it('creates and restores backup', async () => {
    console.log('Test uploads path:', uploads);
    console.log('Working directory:', process.cwd());

    const buf = await createBackup();
    console.log('Backup created, size:', buf.length);

    await fs.rm(dbPath, { force: true });
    await fs.rm(uploads, { recursive: true, force: true });

    await restoreBackup(buf);
    console.log('Backup restored');

    const fileExists = async (p: string) => !!(await fs.stat(p).catch(() => false));
    const dbExists = await fileExists(dbPath);
    const fileInUploadsExists = await fileExists(path.join(uploads, 'file.txt'));

    console.log('DB exists:', dbExists);
    console.log('File in uploads exists:', fileInUploadsExists);
    console.log('Expected file path:', path.join(uploads, 'file.txt'));

    expect(dbExists).toBe(true);
    expect(fileInUploadsExists).toBe(true);
  }, 10000);
});
