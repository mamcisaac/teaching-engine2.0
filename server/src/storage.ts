import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Express } from 'express';

const bucket = process.env.AWS_BUCKET_NAME;
const useS3 = bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
let s3: S3Client | null = null;
if (useS3) {
  s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
}

export async function storeFile(file: Express.Multer.File): Promise<string> {
  const filename = `${Date.now()}-${file.originalname}`;
  if (useS3 && s3) {
    await s3.send(new PutObjectCommand({ Bucket: bucket!, Key: filename, Body: file.buffer }));
    return `https://${bucket}.s3.amazonaws.com/${filename}`;
  }
  const dest = path.join(__dirname, '../uploads', filename);
  await fs.writeFile(dest, file.buffer);
  return `/uploads/${filename}`;
}
