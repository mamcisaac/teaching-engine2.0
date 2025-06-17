import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBackup, restoreBackup } from '../src/services/backupService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('backup service', () => {
  const dbPath = path.resolve('test-backup.sqlite');
  const uploads = path.join(__dirname, '../src/uploads');

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
    const buf = await createBackup();
    await fs.rm(dbPath, { force: true });
    await fs.rm(uploads, { recursive: true, force: true });
    await restoreBackup(buf);
    const fileExists = async (p: string) => !!(await fs.stat(p).catch(() => false));
    expect(await fileExists(dbPath)).toBe(true);
    expect(await fileExists(path.join(uploads, 'file.txt'))).toBe(true);
  }, 10000);
});
