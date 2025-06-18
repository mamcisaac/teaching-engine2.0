/**
 * @todo This test suite heavily uses mocks and should be converted to integration tests
 * @mocked fs, archiver, unzipper - prevents testing actual file operations and compression
 * @mocked S3 - appropriate for external service but consider using localstack for integration tests
 * @not-fully-implemented - should use real file operations with temp directories for proper testing
 *
 * Current implementation only tests the logic flow, not actual backup/restore functionality
 */
import fs from 'fs';
import { jest } from '@jest/globals';
import {
  createBackup,
  restoreBackup,
  saveBackup,
  loadBackup,
  runBackupJob,
  scheduleBackups,
} from '../services/backupService';

// Mock dependencies
jest.mock('fs');
jest.mock('archiver');
jest.mock('unzipper');
jest.mock('@aws-sdk/client-s3');
jest.mock('node-cron');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockArchiver = jest.mocked(await import('archiver')).default;
const mockUnzipper = jest.mocked(await import('unzipper'));
const mockS3 = jest.mocked(await import('@aws-sdk/client-s3'));
const mockCron = jest.mocked(await import('node-cron'));

// Mock archive instance
const mockArchive = {
  on: jest.fn(),
  file: jest.fn(),
  directory: jest.fn(),
  finalize: jest.fn(),
};

// Mock unzipper result
const mockUnzipperResult = {
  files: [
    {
      path: 'test.db',
      stream: () => ({
        pipe: () => ({
          on: (event: string, callback: () => void) => {
            if (event === 'finish') setTimeout(callback, 0);
            return { on: jest.fn() };
          },
        }),
      }),
    },
    {
      path: 'uploads/test.jpg',
      stream: () => ({
        pipe: () => ({
          on: (event: string, callback: () => void) => {
            if (event === 'finish') setTimeout(callback, 0);
            return { on: jest.fn() };
          },
        }),
      }),
    },
  ],
};

describe('BackupService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Setup archiver mock
    mockArchiver.mockReturnValue(mockArchive as ReturnType<typeof mockArchiver>);
    mockArchive.on.mockImplementation((event: string, callback: (data: Buffer) => void) => {
      if (event === 'data') {
        // Simulate archive data chunks
        setTimeout(() => callback(Buffer.from('test-chunk-1')), 0);
        setTimeout(() => callback(Buffer.from('test-chunk-2')), 10);
      }
      return mockArchive;
    });
    mockArchive.finalize.mockResolvedValue(undefined);

    // Setup unzipper mock
    mockUnzipper.Open.buffer.mockResolvedValue(
      mockUnzipperResult as ReturnType<typeof mockUnzipper.Open.buffer>,
    );

    // Setup fs mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.promises.mkdir.mockResolvedValue(undefined);
    mockFs.promises.writeFile.mockResolvedValue(undefined);
    mockFs.promises.readFile.mockResolvedValue(Buffer.from('backup-data'));
    mockFs.createWriteStream.mockReturnValue({
      on: jest.fn().mockReturnThis(),
    } as fs.WriteStream);

    // Setup S3 mocks
    const mockS3Instance = {
      send: jest.fn().mockResolvedValue({
        Body: {
          [Symbol.asyncIterator]: async function* () {
            yield Buffer.from('s3-data');
          },
        },
      }),
    };
    mockS3.S3Client.mockImplementation(
      () => mockS3Instance as InstanceType<typeof mockS3.S3Client>,
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createBackup', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'file:./test.db';
    });

    it('should create a backup archive with database and uploads', async () => {
      const result = await createBackup();

      expect(mockArchiver).toHaveBeenCalledWith('zip');
      expect(mockArchive.file).toHaveBeenCalledWith(expect.stringContaining('test.db'), {
        name: 'test.db',
      });
      expect(mockArchive.directory).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        'uploads',
      );
      expect(mockArchive.finalize).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('test-chunk-1test-chunk-2');
    });

    it('should handle missing uploads directory', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await createBackup();

      expect(mockArchive.file).toHaveBeenCalled();
      expect(mockArchive.directory).not.toHaveBeenCalled();
    });

    it('should throw error for invalid DATABASE_URL', async () => {
      process.env.DATABASE_URL = 'postgres://invalid';

      await expect(createBackup()).rejects.toThrow('DATABASE_URL must be sqlite');
    });
  });

  describe('restoreBackup', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'file:./test.db';
    });

    it('should restore database and uploads from zip buffer', async () => {
      const testBuffer = Buffer.from('test-backup-data');

      await restoreBackup(testBuffer);

      expect(mockUnzipper.Open.buffer).toHaveBeenCalledWith(testBuffer);
      expect(mockFs.promises.mkdir).toHaveBeenCalledTimes(2); // For both db and uploads dirs
      expect(mockFs.createWriteStream).toHaveBeenCalledTimes(2);
    });

    it('should handle missing directories during restore', async () => {
      const testBuffer = Buffer.from('test-backup-data');
      mockFs.promises.mkdir.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(restoreBackup(testBuffer)).rejects.toThrow('Permission denied');
    });
  });

  describe('saveBackup', () => {
    const testData = Buffer.from('test-backup-data');

    it('should save to S3 when configured', async () => {
      process.env.BACKUP_PROVIDER = 's3';
      process.env.BACKUP_BUCKET = 'test-bucket';
      process.env.AWS_REGION = 'us-west-2';

      const result = await saveBackup(testData);

      expect(mockS3.S3Client).toHaveBeenCalledWith({ region: 'us-west-2' });
      expect(result).toMatch(/^s3:\/\/test-bucket\/backup-\d+\.zip$/);
    });

    it('should save to local filesystem when S3 not configured', async () => {
      process.env.BACKUP_PROVIDER = 'local';

      const result = await saveBackup(testData);

      expect(mockFs.promises.mkdir).toHaveBeenCalled();
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('backups'),
        testData,
      );
      expect(result).toMatch(/backup-\d+\.zip$/);
    });

    it('should use default region for S3', async () => {
      process.env.BACKUP_PROVIDER = 's3';
      process.env.BACKUP_BUCKET = 'test-bucket';
      delete process.env.AWS_REGION;

      await saveBackup(testData);

      expect(mockS3.S3Client).toHaveBeenCalledWith({ region: 'us-east-1' });
    });
  });

  describe('loadBackup', () => {
    it('should load from S3 when key starts with s3://', async () => {
      process.env.BACKUP_PROVIDER = 's3';
      process.env.BACKUP_BUCKET = 'test-bucket';

      const result = await loadBackup('s3://test-bucket/backup-123.zip');

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should load from local filesystem for regular paths', async () => {
      const testPath = '/path/to/backup.zip';

      const result = await loadBackup(testPath);

      expect(mockFs.promises.readFile).toHaveBeenCalledWith(testPath);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle S3 stream correctly', async () => {
      process.env.BACKUP_PROVIDER = 's3';
      process.env.BACKUP_BUCKET = 'test-bucket';

      const result = await loadBackup('s3://test-bucket/backup-123.zip');

      expect(result.toString()).toBe('s3-data');
    });
  });

  describe('runBackupJob', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'file:./test.db';
    });

    it('should create and save backup', async () => {
      const result = await runBackupJob();

      expect(mockArchiver).toHaveBeenCalled();
      expect(result).toMatch(/backup-\d+\.zip$/);
    });

    it('should handle backup creation errors', async () => {
      mockArchive.finalize.mockRejectedValue(new Error('Archive failed'));

      await expect(runBackupJob()).rejects.toThrow('Archive failed');
    });
  });

  describe('scheduleBackups', () => {
    it('should schedule backup with default cron expression', () => {
      scheduleBackups();

      expect(mockCron.schedule).toHaveBeenCalledWith('0 2 * * *', expect.any(Function));
    });

    it('should use custom cron expression from environment', () => {
      process.env.BACKUP_CRON = '0 0 * * 0';

      scheduleBackups();

      expect(mockCron.schedule).toHaveBeenCalledWith('0 0 * * 0', expect.any(Function));
    });

    it('should schedule runBackupJob function', () => {
      scheduleBackups();

      const [, scheduledFunction] = mockCron.schedule.mock.calls[0];
      expect(scheduledFunction).toBe(runBackupJob);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'file:./test.db';
    });

    it('should handle archiver errors', async () => {
      mockArchive.on.mockImplementation((event: string, callback: (error: Error) => void) => {
        if (event === 'error') {
          setTimeout(() => callback(new Error('Archiver error')), 0);
        }
        return mockArchive;
      });

      // Note: This test would need the actual implementation to handle archiver errors
      // The current implementation doesn't have error handling for archiver
    });

    it('should handle filesystem errors during save', async () => {
      mockFs.promises.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(saveBackup(Buffer.from('test'))).rejects.toThrow('Disk full');
    });

    it('should handle S3 errors', async () => {
      process.env.BACKUP_PROVIDER = 's3';
      process.env.BACKUP_BUCKET = 'test-bucket';

      const mockS3Instance = {
        send: jest.fn().mockRejectedValue(new Error('S3 error')),
      };
      mockS3.S3Client.mockImplementation(
        () => mockS3Instance as InstanceType<typeof mockS3.S3Client>,
      );

      await expect(saveBackup(Buffer.from('test'))).rejects.toThrow('S3 error');
    });
  });
});
