import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename_storage = fileURLToPath(import.meta.url);
const __dirname_storage = path.dirname(__filename_storage);

// use any to avoid requiring aws-sdk types when not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let s3Client: unknown = null;
const bucket = process.env.AWS_BUCKET_NAME;
if (bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client } = require('@aws-sdk/client-s3');
  s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
}

const localDir = path.join(__dirname_storage, '../uploads');

/**
 * Save a file to either local disk or S3 depending on env config.
 * @param filename output file name
 * @param buffer file contents
 * @returns public URL to the stored file
 */
export async function saveFile(filename: string, buffer: Buffer): Promise<string> {
  if (s3Client && bucket) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const key = `${Date.now()}-${filename}`;
    await (s3Client as { send: (command: unknown) => Promise<unknown> }).send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer }),
    );
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  await fs.mkdir(localDir, { recursive: true });
  const filePath = path.join(localDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}
