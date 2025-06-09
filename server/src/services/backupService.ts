import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import cron from 'node-cron';

let s3: S3Client | null = null;
const bucket = process.env.BACKUP_BUCKET;
if (process.env.BACKUP_PROVIDER === 's3' && bucket) {
  s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
}

function getDbPath() {
  const url = process.env.DATABASE_URL || '';
  const match = url.match(/file:(.*)/);
  if (!match) {
    throw new Error('DATABASE_URL must be sqlite');
  }
  return path.resolve(process.cwd(), match[1]);
}

function getUploadsPath() {
  return path.join(__dirname, '../uploads');
}

/** Create zip archive containing database and uploads */
export async function createBackup(): Promise<Buffer> {
  const archive = archiver('zip');
  const chunks: Buffer[] = [];
  archive.on('data', (d: Buffer) => chunks.push(d));
  const db = getDbPath();
  archive.file(db, { name: path.basename(db) });
  const uploads = getUploadsPath();
  if (fs.existsSync(uploads)) {
    archive.directory(uploads, 'uploads');
  }
  await archive.finalize();
  return Buffer.concat(chunks);
}

/** Restore database and uploads from provided zip buffer */
export async function restoreBackup(data: Buffer): Promise<void> {
  const dir = await unzipper.Open.buffer(data);
  const db = getDbPath();
  for (const entry of dir.files) {
    const dest =
      entry.path === path.basename(db)
        ? db
        : path.join(getUploadsPath(), entry.path.replace(/^uploads\/?/, ''));
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await new Promise<void>((res, rej) => {
      entry.stream().pipe(fs.createWriteStream(dest)).on('finish', res).on('error', rej);
    });
  }
}

/** Save backup buffer to configured provider */
export async function saveBackup(data: Buffer): Promise<string> {
  const key = `backup-${Date.now()}.zip`;
  if (s3 && bucket) {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data }));
    return `s3://${bucket}/${key}`;
  }
  const backupDir = path.join(__dirname, '../backups');
  await fs.promises.mkdir(backupDir, { recursive: true });
  const file = path.join(backupDir, key);
  await fs.promises.writeFile(file, data);
  return file;
}

/** Load backup buffer from provider */
export async function loadBackup(key: string): Promise<Buffer> {
  if (s3 && bucket && key.startsWith('s3://')) {
    const realKey = key.slice(`s3://${bucket}/`.length);
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: realKey }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = res.Body as any as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
  return fs.promises.readFile(key);
}

/** Create backup and store using provider */
export async function runBackupJob(): Promise<string> {
  const data = await createBackup();
  return saveBackup(data);
}

/** Schedule automatic backups using cron */
export function scheduleBackups() {
  const cronExpr = process.env.BACKUP_CRON || '0 2 * * *';
  cron.schedule(cronExpr, runBackupJob);
}
