/**
 * Storage Service Interface
 * Abstraction for file storage operations supporting both local and cloud storage
 */

export interface UploadOptions {
  folder?: string;
  filename?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface StorageResult {
  path: string;
  url: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface FileInfo {
  path: string;
  url: string;
  size: number;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface IStorageService {
  /**
   * Upload a file from buffer
   */
  uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<StorageResult>;

  /**
   * Upload a file from path
   */
  uploadFile(
    filePath: string,
    options?: UploadOptions
  ): Promise<StorageResult>;

  /**
   * Get file information
   */
  getFileInfo(path: string): Promise<FileInfo | null>;

  /**
   * Get signed/public URL for file access
   */
  getFileUrl(path: string, expiresIn?: number): Promise<string>;

  /**
   * Delete a file
   */
  deleteFile(path: string): Promise<boolean>;

  /**
   * Check if file exists
   */
  fileExists(path: string): Promise<boolean>;

  /**
   * Copy file to new location
   */
  copyFile(sourcePath: string, destinationPath: string): Promise<StorageResult>;

  /**
   * Move file to new location
   */
  moveFile(sourcePath: string, destinationPath: string): Promise<StorageResult>;

  /**
   * List files in a directory
   */
  listFiles(path: string, recursive?: boolean): Promise<FileInfo[]>;

  /**
   * Get storage stats
   */
  getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    availableSpace?: number;
  }>;
}

export type StorageDriver = 'local' | 's3';

export interface StorageConfig {
  driver: StorageDriver;
  local?: {
    basePath: string;
    baseUrl: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    baseUrl: string;
    endpoint?: string; // For S3-compatible services
  };
}