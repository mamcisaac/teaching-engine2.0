/**
 * Queue Initialization
 * Starts all job processors and connects them to their queues
 * 
 * IMPORTANT: This must be called on server startup
 */

import { imageQueue, videoQueue, documentQueue, audioQueue, reportQueue, bulkQueue } from './index';
import { processImageJob } from './processors/imageProcessor';
import { processVideoJob } from './processors/videoProcessor';
import { processDocumentJob } from './processors/documentProcessor';
import { processAudioJob } from './processors/audioProcessor';
import { processReportJob } from './processors/reportProcessor';
import { processBulkJob } from './processors/bulkProcessor';
import { logger } from '../../logger';

/**
 * Initialize all queue processors
 */
export const initializeQueues = async (): Promise<void> => {
  logger.info('Initializing job queues...');
  
  // Image processing queue
  imageQueue.process('process-image', 5, async (job) => {
    return await processImageJob(job);
  });
  
  // Video processing queue (limited concurrency due to resource usage)
  videoQueue.process('process-video', 2, async (job) => {
    return await processVideoJob(job);
  });
  
  // Document processing queue
  documentQueue.process('process-document', 3, async (job) => {
    return await processDocumentJob(job);
  });
  
  // Audio processing queue (limited concurrency due to FFmpeg usage)
  audioQueue.process('process-audio', 2, async (job) => {
    return await processAudioJob(job);
  });
  
  // Report generation queue
  reportQueue.process('generate-report', 2, async (job) => {
    return await processReportJob(job);
  });
  
  // Bulk operations queue
  bulkQueue.process('bulk-import', 1, async (job) => {
    return await processBulkJob(job);
  });
  
  logger.info('All queue processors initialized');
  
  // Clean up old jobs periodically
  setInterval(async () => {
    try {
      const queues = [imageQueue, videoQueue, documentQueue, audioQueue, reportQueue, bulkQueue];
      
      for (const queue of queues) {
        // Clean completed jobs older than 24 hours
        const completed = await queue.getCompleted();
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        
        for (const job of completed) {
          if (job.finishedOn && job.finishedOn < cutoff) {
            await job.remove();
          }
        }
        
        // Clean failed jobs older than 7 days
        const failed = await queue.getFailed();
        const failedCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const job of failed) {
          if (job.finishedOn && job.finishedOn < failedCutoff) {
            await job.remove();
          }
        }
      }
      
      logger.info('Cleaned up old jobs from queues');
    } catch (error) {
      logger.error('Failed to clean up old jobs', error);
    }
  }, 60 * 60 * 1000); // Run every hour
};

/**
 * Add a job to process an uploaded artifact
 */
export const queueArtifactProcessing = async (
  artifactType: string,
  artifactId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: number,
  studentId: string
): Promise<string> => {
  const jobData = {
    artifactId,
    buffer: buffer.toString('base64'), // Convert to base64 for Redis storage
    originalName,
    mimeType,
    userId,
    studentId
  };
  
  let job;
  
  // Queue based on file type
  if (artifactType === 'PHOTO' || mimeType.startsWith('image/')) {
    job = await imageQueue.add('process-image', jobData, {
      priority: 1, // Normal priority
      delay: 0 // Process immediately
    });
  } else if (artifactType === 'VIDEO' || mimeType.startsWith('video/')) {
    job = await videoQueue.add('process-video', jobData, {
      priority: 2, // Lower priority than images
      delay: 0
    });
  } else if (artifactType === 'DOCUMENT' || mimeType === 'application/pdf') {
    job = await documentQueue.add('process-document', jobData, {
      priority: 1,
      delay: 0
    });
  } else if (artifactType === 'AUDIO' || mimeType.startsWith('audio/')) {
    job = await audioQueue.add('process-audio', jobData, {
      priority: 2, // Lower priority than documents
      delay: 0
    });
  } else {
    // Default to image queue for unknown types
    job = await imageQueue.add('process-image', jobData);
  }
  
  logger.info(`Queued ${artifactType} processing job ${job.id} for artifact ${artifactId}`);
  
  return job.id.toString();
};

/**
 * Get job status and progress
 */
export const getJobStatus = async (
  queueName: string,
  jobId: string
): Promise<{
  status: string;
  progress: number;
  result?: any;
  error?: string;
}> => {
  let queue;
  
  switch (queueName) {
    case 'image':
      queue = imageQueue;
      break;
    case 'video':
      queue = videoQueue;
      break;
    case 'document':
      queue = documentQueue;
      break;
    case 'audio':
      queue = audioQueue;
      break;
    case 'report':
      queue = reportQueue;
      break;
    case 'bulk':
      queue = bulkQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  
  const job = await queue.getJob(jobId);
  
  if (!job) {
    return {
      status: 'not_found',
      progress: 0
    };
  }
  
  const state = await job.getState();
  const progress = job.progress();
  
  if (state === 'completed') {
    return {
      status: 'completed',
      progress: 100,
      result: job.returnvalue
    };
  }
  
  if (state === 'failed') {
    return {
      status: 'failed',
      progress: progress as number || 0,
      error: job.failedReason
    };
  }
  
  return {
    status: state,
    progress: progress as number || 0
  };
};

export default {
  initializeQueues,
  queueArtifactProcessing,
  getJobStatus
};