/**
 * S3-Compatible Storage Service Implementation
 * Handles file storage operations with AWS S3 or S3-compatible services
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { 
  IStorageService, 
  StorageResult, 
  FileInfo, 
  UploadOptions,
  StorageConfig 
} from './IStorageService';

// Type guard for AWS SDK errors
interface AwsError {
  name?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}

function isAwsNotFoundError(error: unknown): error is AwsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (
      (error as AwsError).name === 'NotFound' ||
      (error as AwsError).name === 'NoSuchKey' ||
      (error as AwsError).$metadata?.httpStatusCode === 404
    )
  );
}

export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucket: string;
  private baseUrl: string;

  constructor(config: StorageConfig) {
    if (!config.s3) {
      throw new Error('S3 storage configuration is required');
    }
    
    this.bucket = config.s3.bucket;
    this.baseUrl = config.s3.baseUrl;

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint && { 
        endpoint: config.s3.endpoint,
        forcePathStyle: true // Required for most S3-compatible services
      })
    });
  }

  private generateSafeFilename(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    
    const filename = `${timestamp}_${randomStr}_${baseName}${extension}`;
    return folder ? `${folder}/${filename}` : filename;
  }

  private getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
    const key = options?.filename || this.generateSafeFilename(originalName, options?.folder);
    
    const putCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: options?.metadata,
      ...(options?.isPublic && { ACL: 'public-read' })
    });

    await this.s3Client.send(putCommand);

    return {
      path: key,
      url: this.getPublicUrl(key),
      size: buffer.length,
      metadata: options?.metadata
    };
  }

  async uploadFile(
    filePath: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
    const fs = await import('fs');
    const { promisify } = await import('util');
    const readFile = promisify(fs.readFile);
    
    const buffer = await readFile(filePath);
    const originalName = path.basename(filePath);
    
    // Try to determine MIME type from extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    };
    const mimeType = mimeTypeMap[ext] || 'application/octet-stream';
    
    return this.uploadBuffer(buffer, originalName, mimeType, options);
  }

  async getFileInfo(key: string): Promise<FileInfo | null> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(headCommand);

      return {
        path: key,
        url: this.getPublicUrl(key),
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata
      };
    } catch (error: unknown) {
      if (isAwsNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3Client as any, getCommand as any, {
        expiresIn
      });

      return signedUrl;
    } catch (error: unknown) {
      // Fallback to public URL if signing fails
      return this.getPublicUrl(key);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(deleteCommand);
      return true;
    } catch (error: unknown) {
      if (isAwsNotFoundError(error)) {
        return false; // File doesn't exist
      }
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(headCommand);
      return true;
    } catch (error: unknown) {
      if (isAwsNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<StorageResult> {
    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourcePath}`,
      Key: destinationPath
    });

    await this.s3Client.send(copyCommand);

    const fileInfo = await this.getFileInfo(destinationPath);
    if (!fileInfo) {
      throw new Error('Failed to copy file');
    }

    return {
      path: destinationPath,
      url: this.getPublicUrl(destinationPath),
      size: fileInfo.size,
      metadata: fileInfo.metadata
    };
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<StorageResult> {
    // Copy the file first
    const result = await this.copyFile(sourcePath, destinationPath);
    
    // Then delete the source
    await this.deleteFile(sourcePath);
    
    return result;
  }

  async listFiles(prefix: string, recursive = false): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    let continuationToken: string | undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        Delimiter: recursive ? undefined : '/',
        ContinuationToken: continuationToken
      });

      const response = await this.s3Client.send(listCommand);
      
      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            files.push({
              path: obj.Key,
              url: this.getPublicUrl(obj.Key),
              size: obj.Size || 0,
              lastModified: obj.LastModified || new Date()
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return files;
  }

  async getStorageStats(): Promise<{ totalSize: number; fileCount: number; availableSpace?: number }> {
    const files = await this.listFiles('', true);
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileCount = files.length;
    
    // S3 doesn't have a concept of "available space" since it's virtually unlimited
    return {
      totalSize,
      fileCount
    };
  }
}