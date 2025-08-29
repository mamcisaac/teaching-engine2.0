/**
 * Storage Service Factory
 * Creates the appropriate storage service instance based on configuration
 */

import path from 'path';
import { IStorageService, StorageConfig, StorageDriver } from './IStorageService';
import { LocalStorageService } from './LocalStorageService';
import { S3StorageService } from './S3StorageService';

export class StorageServiceFactory {
  private static instance: IStorageService | null = null;

  /**
   * Get the configured storage service instance (singleton)
   */
  static getInstance(): IStorageService {
    if (!this.instance) {
      this.instance = this.createStorageService();
    }
    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Create a new storage service instance based on environment configuration
   */
  static createStorageService(customConfig?: StorageConfig): IStorageService {
    const config = customConfig || this.getConfigFromEnvironment();
    
    switch (config.driver) {
      case 'local':
        return new LocalStorageService(config);
      case 's3':
        return new S3StorageService(config);
      default:
        throw new Error(`Unsupported storage driver: ${config.driver}`);
    }
  }

  /**
   * Extract storage configuration from environment variables
   */
  private static getConfigFromEnvironment(): StorageConfig {
    const driver = (process.env.STORAGE_DRIVER as StorageDriver) || 'local';

    const config: StorageConfig = {
      driver
    };

    if (driver === 'local') {
      config.local = {
        basePath: process.env.STORAGE_LOCAL_PATH || 
                  path.join(process.cwd(), 'uploads'),
        baseUrl: process.env.STORAGE_LOCAL_URL || 
                 `${process.env.SERVER_URL || 'http://localhost:3000'}/uploads`
      };
    } else if (driver === 's3') {
      const requiredS3Env = [
        'S3_BUCKET',
        'S3_REGION', 
        'S3_ACCESS_KEY_ID',
        'S3_SECRET_ACCESS_KEY',
        'S3_BASE_URL'
      ];

      const missingEnv = requiredS3Env.filter(key => !process.env[key]);
      if (missingEnv.length > 0) {
        throw new Error(`Missing required S3 environment variables: ${missingEnv.join(', ')}`);
      }

      config.s3 = {
        bucket: process.env.S3_BUCKET!,
        region: process.env.S3_REGION!,
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        baseUrl: process.env.S3_BASE_URL!,
        endpoint: process.env.S3_ENDPOINT
      };
    }

    return config;
  }

  /**
   * Validate that the storage service is properly configured
   */
  static async validateStorageService(storageService?: IStorageService): Promise<void> {
    const service = storageService || this.getInstance();
    
    try {
      // Test basic functionality with a small test file
      const testBuffer = Buffer.from('storage-service-test');
      const testFilename = `test-${Date.now()}.txt`;
      
      // Upload test file
      const uploadResult = await service.uploadBuffer(
        testBuffer,
        testFilename,
        'text/plain',
        { folder: 'system-tests' }
      );
      
      // Verify file exists
      const exists = await service.fileExists(uploadResult.path);
      if (!exists) {
        throw new Error('Test file was not found after upload');
      }
      
      // Get file info
      const fileInfo = await service.getFileInfo(uploadResult.path);
      if (!fileInfo) {
        throw new Error('Could not retrieve file info for test file');
      }
      
      // Get file URL
      const url = await service.getFileUrl(uploadResult.path);
      if (!url) {
        throw new Error('Could not generate file URL for test file');
      }
      
      // Clean up test file
      await service.deleteFile(uploadResult.path);
      
    } catch (error) {
      throw new Error(`Storage service validation failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Convenience function to get the storage service instance
 */
export const getStorageService = (): IStorageService => {
  return StorageServiceFactory.getInstance();
};

/**
 * Convenience function to validate storage configuration at startup
 */
export const validateStorageConfiguration = async (): Promise<void> => {
  return StorageServiceFactory.validateStorageService();
};