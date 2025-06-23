import { app } from '../../src/index';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import unzipper from 'unzipper';
import { authRequest } from './test-auth-helper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const dbPath = path.resolve('test-route.sqlite');
  const uploads = path.join(__dirname, '../src/uploads');

  beforeAll(async () => {
    await auth.setup();
    process.env.DATABASE_URL = `file:${dbPath}`;
    await fs.writeFile(dbPath, 'data');
    await fs.mkdir(uploads, { recursive: true });
    await fs.writeFile(path.join(uploads, 'file.txt'), 'hi');
  });

  afterAll(async () => {
    await fs.rm(dbPath, { force: true });
    await fs.rm(uploads, { recursive: true, force: true });
  });

  it('streams zip with db and uploads', async () => {
    const res = await auth.get('/api/backup').buffer().parse(binaryParser);
    expect(res.status).toBe(200);
    const dir = await unzipper.Open.buffer(res.body);
    const names = dir.files.map((f) => f.path).sort();
    expect(names).toEqual(['database.sqlite', 'uploads/file.txt']);
  });
});
