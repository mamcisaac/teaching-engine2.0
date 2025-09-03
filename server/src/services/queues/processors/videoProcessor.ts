/**
 * Video Processing Job Processor
 * Handles asynchronous video processing tasks
 * 
 * REAL IMPLEMENTATION - Actually processes videos with FFmpeg
 */

import { Job } from 'bull';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@teaching-engine/database';
import { getStorageService } from '../../storage';
import { logger } from '../../../logger';

const prisma = new PrismaClient();
const storageService = getStorageService();
const tempDir = path.join(os.tmpdir(), 'teaching-engine-video');

// Ensure temp directory exists
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

export interface VideoJobData {
  artifactId: string;
  buffer: string; // Base64 encoded
  originalName: string;
  mimeType: string;
  userId: number;
  studentId: string;
}

export interface VideoJobResult {
  thumbnailUrl?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, any>;
  processingTime: number;
}

/**
 * Process video job
 * - Extract thumbnail frame
 * - Get video metadata
 * - Update database with results
 */
export const processVideoJob = async (job: Job<VideoJobData>): Promise<VideoJobResult> => {
  const startTime = Date.now();
  const { artifactId, buffer, originalName, mimeType } = job.data;
  
  logger.info(`Processing video job ${job.id} for artifact ${artifactId}`);
  
  // Create temp file paths
  const tempVideoPath = path.join(tempDir, `video_${job.id}_${Date.now()}.mp4`);
  const tempThumbPath = path.join(tempDir, `thumb_${job.id}_${Date.now()}.jpg`);
  
  try {
    // Convert base64 back to buffer and save to temp file
    const videoBuffer = Buffer.from(buffer, 'base64');
    await fs.writeFile(tempVideoPath, videoBuffer);
    
    await job.progress(10);
    
    // Get video metadata
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .ffprobe((err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
    });
    
    await job.progress(30);
    
    // Extract video information
    const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
    const audioStream = metadata.streams.find((s: any) => s.codec_type === 'audio');
    
    const duration = parseFloat(metadata.format.duration || '0');
    const width = videoStream?.width || 0;
    const height = videoStream?.height || 0;
    const frameRate = parseFrameRate(videoStream?.r_frame_rate);
    const bitrate = parseInt(metadata.format.bit_rate || '0');
    
    // Determine thumbnail extraction time (10% of video or 1 second)
    const thumbnailTime = duration > 10 ? Math.min(duration * 0.1, 10) : 1;
    
    await job.progress(50);
    
    // Extract thumbnail
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: [thumbnailTime],
          filename: path.basename(tempThumbPath),
          folder: path.dirname(tempThumbPath),
          size: '320x?'  // Width 320px, maintain aspect ratio
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
    
    await job.progress(70);
    
    // Upload thumbnail to storage
    const thumbnailBuffer = await fs.readFile(tempThumbPath);
    const thumbnailName = `thumb_${artifactId}_${Date.now()}.jpg`;
    
    const uploadResult = await storageService.uploadBuffer(
      thumbnailBuffer,
      thumbnailName,
      'image/jpeg',
      {
        folder: 'thumbnails/videos',
        metadata: {
          artifactId,
          type: 'video-thumbnail',
          extractedAt: thumbnailTime,
          originalFile: originalName
        }
      }
    );
    
    await job.progress(85);
    
    // Update artifact in database with processing results
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        thumbnailPath: uploadResult.path,
        thumbnailUrl: uploadResult.url,
        metadata: JSON.stringify({
          duration,
          dimensions: { width, height },
          frameRate,
          bitrate,
          hasAudio: !!audioStream,
          audioCodec: audioStream?.codec_name,
          videoCodec: videoStream?.codec_name,
          format: metadata.format.format_name,
          processedAt: new Date().toISOString()
        }),
        processingStatus: 'COMPLETED',
        processingCompletedAt: new Date()
      }
    });
    
    await job.progress(95);
    
    // Cleanup temp files
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbPath).catch(() => {});
    
    await job.progress(100);
    
    const processingTime = Date.now() - startTime;
    
    logger.info(`Video job ${job.id} completed in ${processingTime}ms`);
    
    return {
      thumbnailUrl: uploadResult.url,
      duration,
      dimensions: { width, height },
      metadata: {
        frameRate,
        bitrate,
        format: metadata.format.format_name
      },
      processingTime
    };
    
  } catch (error: unknown) {
    logger.error(`Video job ${job.id} failed`, error instanceof Error ? error.message : String(error));
    
    // Cleanup temp files on error
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbPath).catch(() => {});
    
    // Update artifact with error status
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        processingStatus: 'FAILED',
        processingError: (error as Error).message
      }
    }).catch(err => logger.error('Failed to update artifact error status', err));
    
    throw error;
  }
};

/**
 * Parse frame rate safely (no eval!)
 */
function parseFrameRate(frameRateStr?: string): number | undefined {
  if (!frameRateStr) return undefined;
  
  // Handle fraction format (e.g., "30/1" or "30000/1001")
  if (frameRateStr.includes('/')) {
    const [num, den] = frameRateStr.split('/').map(Number);
    return den > 0 ? num / den : undefined;
  }
  
  // Handle simple number format
  return parseFloat(frameRateStr);
}

/**
 * Generate preview clips for video
 */
export const generatePreviewClip = async (
  videoPath: string,
  artifactId: string,
  duration: number
): Promise<string> => {
  const previewPath = path.join(tempDir, `preview_${artifactId}_${Date.now()}.mp4`);
  
  // Create a 10-second preview from the middle of the video
  const startTime = Math.max(0, (duration - 10) / 2);
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(10)
      .output(previewPath)
      .size('640x?') // Smaller size for preview
      .videoBitrate('1000k')
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run();
  });
  
  // Upload preview to storage
  const previewBuffer = await fs.readFile(previewPath);
  const uploadResult = await storageService.uploadBuffer(
    previewBuffer,
    `preview_${artifactId}.mp4`,
    'video/mp4',
    {
      folder: 'previews',
      metadata: {
        artifactId,
        type: 'preview',
        duration: 10
      }
    }
  );
  
  // Cleanup temp file
  await fs.unlink(previewPath).catch(() => {});
  
  return uploadResult.url;
};

/**
 * Extract multiple thumbnails from video
 */
export const extractVideoFrames = async (
  videoPath: string,
  artifactId: string,
  count: number = 4
): Promise<string[]> => {
  const frames: string[] = [];
  
  // Get video duration
  const metadata = await new Promise<any>((resolve, reject) => {
    ffmpeg(videoPath)
      .ffprobe((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
  });
  
  const duration = parseFloat(metadata.format.duration || '0');
  const interval = duration / (count + 1);
  
  // Extract frames at regular intervals
  for (let i = 1; i <= count; i++) {
    const timestamp = interval * i;
    const framePath = path.join(tempDir, `frame_${artifactId}_${i}_${Date.now()}.jpg`);
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(framePath),
          folder: path.dirname(framePath),
          size: '320x?'
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
    
    const frameBuffer = await fs.readFile(framePath);
    const uploadResult = await storageService.uploadBuffer(
      frameBuffer,
      `frame_${artifactId}_${i}.jpg`,
      'image/jpeg',
      {
        folder: 'frames',
        metadata: {
          artifactId,
          frameNumber: i,
          timestamp
        }
      }
    );
    
    frames.push(uploadResult.url);
    
    // Cleanup temp file
    await fs.unlink(framePath).catch(() => {});
  }
  
  return frames;
};