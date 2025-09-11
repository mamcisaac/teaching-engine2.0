/**
 * Storage Service Wrapper
 * Wraps the existing storage functionality from ../storage
 */

import { saveFile } from '../storage';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';

class StorageService {
  private uploadsDir: string;
  
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirExists();
  }
  
  private ensureUploadsDirExists() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }
  
  /**
   * Get URL for accessing a file
   */
  async getFileUrl(filePath: string): Promise<string> {
    // In production, this would return a CDN URL or signed S3 URL
    // For development, return a local URL
    const fileName = path.basename(filePath);
    return `/uploads/${fileName}`;
  }
  
  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      logger.error({ error }, `Failed to delete file: ${filePath}`);
      throw error;
    }
  }
  
  /**
   * Save a file to storage using the existing saveFile function
   */
  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    try {
      // Use the existing saveFile function from ../storage
      const url = await saveFile(fileName, buffer);
      logger.info(`Saved file: ${fileName}`);
      
      // Return the path (not the URL) for consistency with artifacts route
      return path.join('uploads', fileName);
    } catch (error) {
      logger.error({ error }, `Failed to save file: ${fileName}`);
      throw error;
    }
  }
  
  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
  }
  
  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<fs.Stats | null> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        return fs.statSync(fullPath);
      }
      return null;
    } catch (error) {
      logger.error({ error }, `Failed to get file stats: ${filePath}`);
      return null;
    }
  }
}

// Singleton instance
let instance: StorageService;

export function getStorageService(): StorageService {
  if (!instance) {
    instance = new StorageService();
  }
  return instance;
}