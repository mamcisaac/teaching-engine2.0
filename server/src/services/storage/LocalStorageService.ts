/**
 * Local Disk Storage Service Implementation
 * Handles file storage operations on the local filesystem
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import type { 
  IStorageService, 
  StorageResult, 
  FileInfo, 
  UploadOptions,
  StorageConfig 
} from './IStorageService';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);

export class LocalStorageService implements IStorageService {
  private basePath: string;
  private baseUrl: string;

  constructor(config: StorageConfig) {
    if (!config.local) {
      throw new Error('Local storage configuration is required');
    }
    
    this.basePath = config.local.basePath;
    this.baseUrl = config.local.baseUrl;

    // Ensure base directory exists
    this.ensureDirectoryExists(this.basePath);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private generateSafeFilename(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    
    const filename = `${timestamp}_${randomStr}_${baseName}${extension}`;
    return folder ? path.join(folder, filename) : filename;
  }

  private getAbsolutePath(relativePath: string): string {
    return path.join(this.basePath, relativePath);
  }

  private getPublicUrl(relativePath: string): string {
    return `${this.baseUrl}/${relativePath.replace(/\\/g, '/')}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    _mimeType: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
    const filename = options?.filename || this.generateSafeFilename(originalName, options?.folder);
    const absolutePath = this.getAbsolutePath(filename);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(path.dirname(absolutePath));
    
    // Write file
    await writeFile(absolutePath, buffer);
    
    // Get file stats
    const stats = await stat(absolutePath);
    
    return {
      path: filename,
      url: this.getPublicUrl(filename),
      size: stats.size,
      metadata: options?.metadata
    };
  }

  async uploadFile(
    filePath: string,
    options?: UploadOptions
  ): Promise<StorageResult> {
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

  async getFileInfo(relativePath: string): Promise<FileInfo | null> {
    try {
      const absolutePath = this.getAbsolutePath(relativePath);
      const stats = await stat(absolutePath);
      
      return {
        path: relativePath,
        url: this.getPublicUrl(relativePath),
        size: stats.size,
        lastModified: stats.mtime
      };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async getFileUrl(relativePath: string, _expiresIn?: number): Promise<string> {
    // For local storage, we don't need signed URLs
    // The expiresIn parameter is ignored for local storage
    return this.getPublicUrl(relativePath);
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      const absolutePath = this.getAbsolutePath(relativePath);
      await unlink(absolutePath);
      return true;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false; // File doesn't exist
      }
      throw error;
    }
  }

  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const absolutePath = this.getAbsolutePath(relativePath);
      await stat(absolutePath);
      return true;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<StorageResult> {
    const sourceAbsolute = this.getAbsolutePath(sourcePath);
    const destAbsolute = this.getAbsolutePath(destinationPath);
    
    // Ensure destination directory exists
    await this.ensureDirectoryExists(path.dirname(destAbsolute));
    
    await copyFile(sourceAbsolute, destAbsolute);
    
    const stats = await stat(destAbsolute);
    
    return {
      path: destinationPath,
      url: this.getPublicUrl(destinationPath),
      size: stats.size
    };
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<StorageResult> {
    const sourceAbsolute = this.getAbsolutePath(sourcePath);
    const destAbsolute = this.getAbsolutePath(destinationPath);
    
    // Ensure destination directory exists
    await this.ensureDirectoryExists(path.dirname(destAbsolute));
    
    await rename(sourceAbsolute, destAbsolute);
    
    const stats = await stat(destAbsolute);
    
    return {
      path: destinationPath,
      url: this.getPublicUrl(destinationPath),
      size: stats.size
    };
  }

  async listFiles(dirPath: string, recursive = false): Promise<FileInfo[]> {
    const absoluteDir = this.getAbsolutePath(dirPath);
    const files: FileInfo[] = [];
    
    try {
      const entries = await readdir(absoluteDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const entryAbsolutePath = path.join(absoluteDir, entry.name);
        
        if (entry.isFile()) {
          const stats = await stat(entryAbsolutePath);
          files.push({
            path: entryPath,
            url: this.getPublicUrl(entryPath),
            size: stats.size,
            lastModified: stats.mtime
          });
        } else if (entry.isDirectory() && recursive) {
          const subFiles = await this.listFiles(entryPath, true);
          files.push(...subFiles);
        }
      }
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // Directory doesn't exist
      }
      throw error;
    }
    
    return files;
  }

  async getStorageStats(): Promise<{ totalSize: number; fileCount: number; availableSpace?: number }> {
    const files = await this.listFiles('', true);
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileCount = files.length;
    
    // For local storage, we could check available disk space
    // This is a simplified implementation
    return {
      totalSize,
      fileCount
    };
  }
}