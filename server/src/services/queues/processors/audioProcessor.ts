/**
 * Audio Processing Job Processor
 * Handles asynchronous audio processing tasks
 * 
 * REAL IMPLEMENTATION - Actually processes audio with FFmpeg
 */

import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

import { PrismaClient } from '@teaching-engine/database';
import type { Job } from 'bull';
import ffmpeg from 'fluent-ffmpeg';

import { logger } from '../../../logger';
import { getStorageService } from '../../storage';

const storageService = getStorageService();
const tempDir = path.join(os.tmpdir(), 'teaching-engine-audio');

// Ensure temp directory exists
fs.mkdir(tempDir, { recursive: true }).catch((error) => {
  logger.error('Failed to create temp directory:', error instanceof Error ? error.message : String(error));
});

export interface AudioJobData {
  artifactId: string;
  buffer: string; // Base64 encoded
  originalName: string;
  mimeType: string;
  userId: number;
  studentId: string;
}

export interface AudioJobResult {
  waveformUrl?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  processingTime: number;
}

/**
 * Process audio job
 * - Extract audio metadata (duration, bitrate, sample rate, channels)
 * - Generate waveform visualization
 * - Update database with results
 */
export const processAudioJob = async (job: Job<AudioJobData>): Promise<AudioJobResult> => {
  const startTime = Date.now();
  const { artifactId, buffer, originalName, mimeType } = job.data;
  
  logger.info(`Processing audio job ${job.id} for artifact ${artifactId}`);
  
  // Create temp file paths
  const tempAudioPath = path.join(tempDir, `audio_${job.id}_${Date.now()}.${getFileExtension(mimeType)}`);
  const tempWaveformPath = path.join(tempDir, `waveform_${job.id}_${Date.now()}.png`);
  
  try {
    // Convert base64 back to buffer and save to temp file
    const audioBuffer = Buffer.from(buffer, 'base64');
    await fs.writeFile(tempAudioPath, audioBuffer);
    
    await job.progress(10);
    
    // Get audio metadata
    const metadata = await new Promise<unknown>((resolve, reject) => {
      ffmpeg(tempAudioPath)
        .ffprobe((err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
    });
    
    await job.progress(30);
    
    // Extract audio information
    const audioStream = (metadata as { streams: Array<{ codec_type: string; sample_rate?: string; channels?: string; codec_name?: string }> }).streams.find((s: { codec_type: string }) => s.codec_type === 'audio');
    
    const duration = parseFloat((metadata as any).format.duration || '0');
    const bitrate = parseInt((metadata as any).format.bit_rate || '0');
    const sampleRate = parseInt((audioStream as any).sample_rate || '0');
    const channels = parseInt((audioStream as any).channels || '0');
    const codecName = (audioStream as any).codec_name;
    
    await job.progress(50);
    
    // Generate waveform visualization
    let waveformUrl: string | undefined;
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempAudioPath)
          .complexFilter([
            // Create waveform visualization
            'showwavespic=s=640x120:colors=0x3b82f6'
          ])
          .outputFormat('png')
          .output(tempWaveformPath)
          .on('end', () => resolve())
          .on('error', (err: Error) => reject(err))
          .run();
      });
      
      await job.progress(70);
      
      // Upload waveform to storage
      const waveformBuffer = await fs.readFile(tempWaveformPath);
      const waveformName = `waveform_${artifactId}_${Date.now()}.png`;
      
      const uploadResult = await storageService.uploadBuffer(
        waveformBuffer,
        waveformName,
        'image/png',
        {
          folder: 'waveforms/audio',
          metadata: {
            artifactId,
            type: 'audio-waveform',
            originalFile: originalName,
            duration: duration.toString(),
            sampleRate: sampleRate.toString()
          }
        }
      );
      
      waveformUrl = uploadResult.url;
      
    } catch (waveformError) {
      logger.warn(`Waveform generation failed for ${artifactId}`, JSON.stringify({ error: waveformError }));
      // Continue without waveform - not critical
    }
    
    await job.progress(85);
    
    // Update artifact in database with processing results
    const audioMetadata = {
      duration,
      bitrate,
      sampleRate,
      channels,
      codec: codecName,
      format: (metadata as any).format.format_name,
      hasWaveform: !!waveformUrl,
      fileSize: audioBuffer.length,
      processedAt: new Date().toISOString()
    };
    
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        ...(waveformUrl && { thumbnailUrl: waveformUrl }),
        metadata: JSON.stringify(audioMetadata),
        processingStatus: 'COMPLETED',
        processingCompletedAt: new Date()
      }
    });
    
    // Cleanup temp files
    await fs.unlink(tempAudioPath).catch(() => {});
    await fs.unlink(tempWaveformPath).catch(() => {});
    
    await job.progress(100);
    
    const processingTime = Date.now() - startTime;
    
    logger.info(`Audio job ${job.id} completed in ${processingTime}ms`, JSON.stringify({
      duration,
      sampleRate,
      channels,
      hasWaveform: !!waveformUrl
    }));
    
    return {
      waveformUrl,
      duration,
      metadata: audioMetadata,
      processingTime
    };
    
  } catch (error: unknown) {
    logger.error(`Audio job ${job.id} failed`, error instanceof Error ? error.message : String(error));
    
    // Cleanup temp files on error
    await fs.unlink(tempAudioPath).catch(() => {});
    await fs.unlink(tempWaveformPath).catch(() => {});
    
    // Update artifact with error status
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        processingStatus: 'FAILED',
        processingError: (error as Error).message,
        metadata: JSON.stringify({
          error: (error as Error).message,
          failedAt: new Date().toISOString(),
          originalName,
          fileSize: Buffer.from(buffer, 'base64').length
        })
      }
    }).catch(err => logger.error('Failed to update artifact error status', err));
    
    throw error;
  }
};

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3', 
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a'
  };
  
  return extensions[mimeType] || 'audio';
}

// Function already exported above