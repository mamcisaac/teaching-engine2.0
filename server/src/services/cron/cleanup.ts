/**
 * Cleanup Cron Jobs
 * Handles periodic cleanup of temporary files and old data
 * 
 * CRITICAL: Prevents disk space exhaustion
 */

import * as cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@teaching-engine/database';
import { logger } from '../../logger';
import { getFileProcessingService } from '../fileProcessingService';

const prisma = new PrismaClient();
const fileProcessingService = getFileProcessingService();

// Temp directories to clean
const TEMP_DIRS = [
  path.join(os.tmpdir(), 'teaching-engine-temp'),
  path.join(os.tmpdir(), 'teaching-engine-video'),
  path.join(process.cwd(), 'server', 'uploads', 'temp')
];

/**
 * Clean up temporary files older than specified hours
 */
const cleanupTempFiles = async (olderThanHours: number = 24): Promise<void> => {
  logger.info(`Starting temp file cleanup (files older than ${olderThanHours} hours)`);
  
  const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
  let totalDeleted = 0;
  let totalSize = 0;
  
  for (const dir of TEMP_DIRS) {
    try {
      // Check if directory exists
      await fs.access(dir);
      
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        try {
          const stats = await fs.stat(filePath);
          
          // Skip directories
          if (stats.isDirectory()) continue;
          
          // Check if file is old enough to delete
          if (stats.mtimeMs < cutoffTime) {
            totalSize += stats.size;
            await fs.unlink(filePath);
            totalDeleted++;
            logger.debug(`Deleted temp file: ${filePath}`);
          }
        } catch (error) {
          logger.warn(`Failed to process temp file ${filePath}:`, error);
        }
      }
    } catch (error) {
      // Directory might not exist yet
      if ((error as any).code !== 'ENOENT') {
        logger.error(`Failed to clean temp directory ${dir}:`, error);
      }
    }
  }
  
  logger.info(`Temp file cleanup completed: ${totalDeleted} files deleted, ${(totalSize / 1024 / 1024).toFixed(2)} MB freed`);
};

/**
 * Clean up orphaned database records
 */
const cleanupOrphanedRecords = async (): Promise<void> => {
  logger.info('Starting orphaned record cleanup');
  
  try {
    // Delete artifacts without associated students
    const orphanedArtifacts = await prisma.studentArtifact.deleteMany({
      where: {
        student: {
          is: null
        }
      }
    });
    
    // Delete artifact outcomes without artifacts
    const orphanedOutcomes = await prisma.studentArtifactOutcome.deleteMany({
      where: {
        artifact: {
          is: null
        }
      }
    });
    
    // Delete progress records for deleted students
    const orphanedProgress = await prisma.studentOutcomeProgress.deleteMany({
      where: {
        student: {
          is: null
        }
      }
    });
    
    logger.info(`Orphaned record cleanup completed: ${orphanedArtifacts.count} artifacts, ${orphanedOutcomes.count} outcomes, ${orphanedProgress.count} progress records deleted`);
  } catch (error) {
    logger.error('Failed to clean orphaned records:', error);
  }
};

/**
 * Archive old artifacts to reduce active database size
 */
const archiveOldArtifacts = async (olderThanDays: number = 180): Promise<void> => {
  logger.info(`Starting artifact archival (artifacts older than ${olderThanDays} days)`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  try {
    // Mark old artifacts as archived
    const archived = await prisma.studentArtifact.updateMany({
      where: {
        dateCollected: {
          lt: cutoffDate
        },
        isArchived: false
      },
      data: {
        isArchived: true
      }
    });
    
    logger.info(`Archived ${archived.count} artifacts older than ${olderThanDays} days`);
  } catch (error) {
    logger.error('Failed to archive old artifacts:', error);
  }
};

/**
 * Monitor and alert on storage usage
 */
const monitorStorageUsage = async (): Promise<void> => {
  logger.info('Checking storage usage');
  
  try {
    // Get storage stats per student
    const storageByStudent = await prisma.studentArtifact.groupBy({
      by: ['studentId'],
      _sum: {
        fileSize: true
      },
      where: {
        isArchived: false
      }
    });
    
    // Check for students exceeding quota (5GB)
    const QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
    const WARNING_THRESHOLD = 0.9; // Warn at 90% usage
    
    for (const student of storageByStudent) {
      const usage = student._sum.fileSize || 0;
      
      if (usage > QUOTA_BYTES) {
        logger.error(`Student ${student.studentId} exceeded storage quota: ${(usage / 1024 / 1024 / 1024).toFixed(2)} GB`);
        
        // Could send notification to teacher here
        // await notifyTeacher(student.studentId, 'quota_exceeded');
      } else if (usage > QUOTA_BYTES * WARNING_THRESHOLD) {
        logger.warn(`Student ${student.studentId} approaching storage quota: ${(usage / 1024 / 1024 / 1024).toFixed(2)} GB`);
      }
    }
    
    // Get total storage usage
    const totalStorage = await prisma.studentArtifact.aggregate({
      _sum: {
        fileSize: true
      }
    });
    
    logger.info(`Total storage usage: ${((totalStorage._sum.fileSize || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`);
  } catch (error) {
    logger.error('Failed to monitor storage usage:', error);
  }
};

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = (): void => {
  logger.info('Initializing cleanup cron jobs');
  
  // Clean temp files every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await cleanupTempFiles(24); // Clean files older than 24 hours
    } catch (error) {
      logger.error('Temp file cleanup cron failed:', error);
    }
  });
  
  // Clean orphaned records daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupOrphanedRecords();
    } catch (error) {
      logger.error('Orphaned record cleanup cron failed:', error);
    }
  });
  
  // Archive old artifacts weekly on Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    try {
      await archiveOldArtifacts(180); // Archive artifacts older than 6 months
    } catch (error) {
      logger.error('Artifact archival cron failed:', error);
    }
  });
  
  // Monitor storage usage every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await monitorStorageUsage();
    } catch (error) {
      logger.error('Storage monitoring cron failed:', error);
    }
  });
  
  // Use the file processing service's cleanup method daily
  cron.schedule('0 1 * * *', async () => {
    try {
      const deleted = await fileProcessingService.cleanupTempFiles(48); // Clean files older than 48 hours
      logger.info(`FileProcessingService cleaned ${deleted} temp files`);
    } catch (error) {
      logger.error('FileProcessingService cleanup failed:', error);
    }
  });
  
  logger.info('All cleanup cron jobs scheduled');
};

/**
 * Manual cleanup trigger (for testing or emergency cleanup)
 */
export const runManualCleanup = async (): Promise<{
  tempFilesDeleted: number;
  orphanedRecords: number;
  archivedArtifacts: number;
}> => {
  logger.info('Running manual cleanup');
  
  // Clean temp files
  await cleanupTempFiles(1); // Clean files older than 1 hour for manual cleanup
  
  // Clean orphaned records
  await cleanupOrphanedRecords();
  
  // Archive old artifacts
  await archiveOldArtifacts(90); // Archive artifacts older than 3 months
  
  // Monitor storage
  await monitorStorageUsage();
  
  return {
    tempFilesDeleted: 0, // Would need to track in cleanup functions
    orphanedRecords: 0,
    archivedArtifacts: 0
  };
};

export default {
  initializeCronJobs,
  runManualCleanup,
  cleanupTempFiles,
  cleanupOrphanedRecords,
  archiveOldArtifacts,
  monitorStorageUsage
};