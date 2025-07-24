import fs from 'fs/promises';
import path from 'path';

// use any to avoid requiring aws-sdk types when not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let s3Client: unknown = null;
const bucket = process.env.AWS_BUCKET_NAME;

const localDir = path.join(__dirname, '../uploads');

// Initialize S3 client lazily
async function getS3Client() {
  if (!s3Client && bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = await import('@aws-sdk/client-s3');
    s3Client = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
  }
  return s3Client;
}

/**
 * Save a file to either local disk or S3 depending on env config.
 * @param filename output file name
 * @param buffer file contents
 * @returns public URL to the stored file
 */
export async function saveFile(filename: string, buffer: Buffer): Promise<string> {
  const client = await getS3Client();
  if (client !== null && client !== undefined && bucket) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const key = `${Date.now()}-${filename}`;
    await (client as { send: (command: unknown) => Promise<unknown> }).send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer }),
    );
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  await fs.mkdir(localDir, { recursive: true });
  const filePath = path.join(localDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}
