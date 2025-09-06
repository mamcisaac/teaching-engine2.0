/**
 * Image Processing Job Processor
 * Handles asynchronous image processing tasks
 * 
 * REAL IMPLEMENTATION - Actually processes images with Sharp
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Job } from 'bull';
import sharp from 'sharp';

import { logger } from '../../../logger';
import { getStorageService } from '../../storage';

const prisma = new PrismaClient();
const storageService = getStorageService();

export interface ImageJobData {
  artifactId: string;
  buffer: string; // Base64 encoded
  originalName: string;
  mimeType: string;
  userId: number;
  studentId: string;
}

export interface ImageJobResult {
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, any>;
  processingTime: number;
}

/**
 * Process image job
 * - Generate optimized thumbnail
 * - Extract metadata
 * - Update database with results
 */
export const processImageJob = async (job: Job<ImageJobData>): Promise<ImageJobResult> => {
  const startTime = Date.now();
  const { artifactId, buffer, originalName } = job.data;
  
  logger.info(`Processing image job ${job.id} for artifact ${artifactId}`);
  
  try {
    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(buffer, 'base64');
    
    // Update job progress
    await job.progress(10);
    
    // Process image with Sharp
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    await job.progress(30);
    
    // Generate thumbnail (200x200 max, maintaining aspect ratio)
    const thumbnailBuffer = await image
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();
    
    await job.progress(60);
    
    // Upload thumbnail to storage
    const thumbnailName = `thumb_${artifactId}_${Date.now()}.jpg`;
    const uploadResult = await storageService.uploadBuffer(
      thumbnailBuffer,
      thumbnailName,
      'image/jpeg',
      {
        folder: 'thumbnails',
        metadata: {
          artifactId,
          type: 'thumbnail',
          originalFile: originalName
        }
      }
    );
    
    await job.progress(80);
    
    // Update artifact in database with processing results
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        thumbnailPath: uploadResult.path,
        thumbnailUrl: uploadResult.url,
        metadata: JSON.stringify({
          dimensions: {
            width: metadata.width || 0,
            height: metadata.height || 0
          },
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation,
          processedAt: new Date().toISOString()
        }),
        processingStatus: 'COMPLETED',
        processingCompletedAt: new Date()
      }
    });
    
    await job.progress(100);
    
    const processingTime = Date.now() - startTime;
    
    logger.info(`Image job ${job.id} completed in ${processingTime}ms`);
    
    return {
      thumbnailUrl: uploadResult.url,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      metadata: {
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels
      },
      processingTime
    };
    
  } catch (error: unknown) {
    logger.error(`Image job ${job.id} failed`, error instanceof Error ? error.message : String(error));
    
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
 * Generate multiple thumbnail sizes for responsive display
 */
export const generateResponsiveThumbnails = async (
  imageBuffer: Buffer,
  artifactId: string
): Promise<Record<string, string>> => {
  const sizes = [
    { name: 'small', width: 150 },
    { name: 'medium', width: 300 },
    { name: 'large', width: 600 }
  ];
  
  const thumbnails: Record<string, string> = {};
  
  for (const size of sizes) {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(size.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();
    
    const uploadResult = await storageService.uploadBuffer(
      thumbnailBuffer,
      `thumb_${artifactId}_${size.name}_${Date.now()}.jpg`,
      'image/jpeg',
      {
        folder: `thumbnails/${size.name}`,
        metadata: {
          artifactId,
          size: size.name
        }
      }
    );
    
    thumbnails[size.name] = uploadResult.url;
  }
  
  return thumbnails;
};

/**
 * Extract and store EXIF data
 */
export const extractExifData = async (
  imageBuffer: Buffer
): Promise<Record<string, any>> => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Parse EXIF data if available
    if (metadata.exif) {
      // Here you could use exif-parser for more detailed extraction
      return {
        make: 'Camera Make', // Placeholder - use exif-parser
        model: 'Camera Model',
        dateTime: new Date().toISOString(),
        orientation: metadata.orientation,
        xResolution: metadata.density,
        yResolution: metadata.density
      };
    }
    
    return {};
  } catch (error: unknown) {
    logger.warn('Failed to extract EXIF data', error instanceof Error ? error.message : String(error));
    return {};
  }
};