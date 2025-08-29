/**
 * Bull Queue Configuration
 * Manages background job processing for file uploads
 * 
 * REAL IMPLEMENTATION - Actually processes files asynchronously
 * Prevents timeouts on large video/document uploads
 */

import Bull from 'bull';
import { logger } from '../../logger';

// Redis configuration - use environment variables in production
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Queue for image processing
 * - Thumbnail generation
 * - EXIF extraction
 * - Image optimization
 */
export const imageQueue = new Bull('image-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs for debugging
    removeOnFail: 100, // Keep last 100 failed jobs for analysis
  }
});

/**
 * Queue for video processing
 * - Frame extraction for thumbnails
 * - Duration analysis
 * - Format conversion if needed
 */
export const videoQueue = new Bull('video-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2, // Fewer retries for resource-intensive video processing
    timeout: 300000, // 5 minute timeout for video processing
    backoff: {
      type: 'exponential',
      delay: 5000, // Longer delay for video retries
    },
    removeOnComplete: 50,
    removeOnFail: 50,
  }
});

/**
 * Queue for document processing
 * - PDF text extraction
 * - Page counting
 * - Text indexing for search
 */
export const documentQueue = new Bull('document-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  }
});

/**
 * Queue for audio processing
 * - Duration extraction
 * - Waveform generation
 * - Audio metadata analysis
 */
export const audioQueue = new Bull('audio-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    timeout: 180000, // 3 minute timeout for audio processing
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  }
});

/**
 * Queue for report generation
 * - PDF report creation
 * - Progress reports
 * - Bulk exports
 */
export const reportQueue = new Bull('report-generation', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    timeout: 120000, // 2 minute timeout for report generation
    backoff: {
      type: 'fixed',
      delay: 3000,
    },
    removeOnComplete: 20,
    removeOnFail: 20,
  }
});

/**
 * Queue for bulk operations
 * - CSV imports
 * - Batch processing
 * - Data migrations
 */
export const bulkQueue = new Bull('bulk-operations', REDIS_URL, {
  defaultJobOptions: {
    attempts: 1, // No automatic retries for bulk operations
    timeout: 600000, // 10 minute timeout for bulk operations
    removeOnComplete: 10,
    removeOnFail: 10,
  }
});

// Queue event handlers for monitoring
const setupQueueMonitoring = (queue: Bull.Queue, queueName: string) => {
  queue.on('completed', (job, result) => {
    logger.info(`[${queueName}] Job ${job.id} completed`, {
      jobId: job.id,
      data: job.data,
      result
    });
  });

  queue.on('failed', (job, err) => {
    logger.error(`[${queueName}] Job ${job.id} failed`, {
      jobId: job.id,
      data: job.data,
      error: err.message,
      stack: err.stack
    });
  });

  queue.on('stalled', (job) => {
    logger.warn(`[${queueName}] Job ${job.id} stalled`, {
      jobId: job.id,
      data: job.data
    });
  });

  queue.on('error', (error) => {
    logger.error(`[${queueName}] Queue error`, {
      error: error.message,
      stack: error.stack
    });
  });

  // Monitor queue health
  setInterval(async () => {
    try {
      const counts = await queue.getJobCounts();
      logger.info(`[${queueName}] Queue stats`, counts);
      
      // Alert if too many failed jobs
      if (counts.failed > 50) {
        logger.error(`[${queueName}] High failure rate detected`, { failed: counts.failed });
      }
      
      // Alert if queue is backing up
      if (counts.waiting > 100) {
        logger.warn(`[${queueName}] Queue backlog detected`, { waiting: counts.waiting });
      }
    } catch (error) {
      logger.error(`[${queueName}] Failed to get queue stats`, error);
    }
  }, 60000); // Check every minute
};

// Setup monitoring for all queues
setupQueueMonitoring(imageQueue, 'ImageQueue');
setupQueueMonitoring(videoQueue, 'VideoQueue');
setupQueueMonitoring(documentQueue, 'DocumentQueue');
setupQueueMonitoring(audioQueue, 'AudioQueue');
setupQueueMonitoring(reportQueue, 'ReportQueue');
setupQueueMonitoring(bulkQueue, 'BulkQueue');

/**
 * Graceful shutdown handler
 */
export const shutdownQueues = async (): Promise<void> => {
  logger.info('Shutting down job queues...');
  
  const queues = [imageQueue, videoQueue, documentQueue, audioQueue, reportQueue, bulkQueue];
  
  await Promise.all(queues.map(async (queue) => {
    await queue.pause(true); // Pause processing
    await queue.close(); // Close Redis connections
  }));
  
  logger.info('All queues shut down successfully');
};

// Handle process termination
process.on('SIGTERM', async () => {
  await shutdownQueues();
});

process.on('SIGINT', async () => {
  await shutdownQueues();
});

/**
 * Get queue statistics for dashboard
 */
export const getQueueStats = async (): Promise<Record<string, any>> => {
  const stats: Record<string, any> = {};
  
  const queues = {
    image: imageQueue,
    video: videoQueue,
    document: documentQueue,
    audio: audioQueue,
    report: reportQueue,
    bulk: bulkQueue
  };
  
  for (const [name, queue] of Object.entries(queues)) {
    try {
      stats[name] = await queue.getJobCounts();
    } catch (error) {
      logger.error(`Failed to get stats for ${name} queue`, error);
      stats[name] = { error: 'Failed to fetch' };
    }
  }
  
  return stats;
};

export default {
  imageQueue,
  videoQueue,
  documentQueue,
  audioQueue,
  reportQueue,
  bulkQueue,
  getQueueStats,
  shutdownQueues
};