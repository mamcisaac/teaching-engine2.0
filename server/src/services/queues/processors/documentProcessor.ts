/**
 * Document Processing Queue Processor
 * Handles PDF text extraction, page counting, and document analysis
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Job } from 'bull';
import pdfParse from 'pdf-parse';

import { logger } from '../../../logger';



interface DocumentJobData {
  artifactId: string;
  buffer: string; // base64 encoded
  originalName: string;
  mimeType: string;
  userId: number;
  studentId: string;
}

/**
 * Process document job
 * Extracts text and metadata from PDF documents
 */
export const processDocumentJob = async (job: Job<DocumentJobData>): Promise<unknown> => {
  const { artifactId, buffer, originalName, mimeType, userId, studentId } = job.data;
  
  try {
    logger.info(`Starting document processing for artifact ${artifactId}`, JSON.stringify({
      artifactId,
      originalName,
      mimeType,
      userId,
      studentId
    }));

    // Update processing status
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: { processingStatus: 'PROCESSING' }
    });

    await job.progress(20);

    // Convert base64 back to buffer
    const fileBuffer = Buffer.from(buffer, 'base64');
    const metadata: Record<string, unknown> = {
      fileSize: fileBuffer.length,
      originalName,
      mimeType
    };

    await job.progress(40);

    // Process based on file type
    if (mimeType === 'application/pdf') {
      // Extract PDF metadata
      try {
        const pdfData = await pdfParse(fileBuffer);
        
        metadata.pageCount = pdfData.numpages;
        metadata.textLength = pdfData.text.length;
        metadata.hasText = pdfData.text.trim().length > 0;
        
        // Store searchable text (truncated for storage)
        const searchableText = pdfData.text.substring(0, 5000);
        metadata.searchableText = searchableText;
        
        logger.info(`PDF analysis complete for ${artifactId}`, JSON.stringify({
          pageCount: metadata.pageCount,
          textLength: metadata.textLength,
          hasText: metadata.hasText
        }));
        
      } catch (pdfError) {
        logger.warn(`PDF parsing failed for ${artifactId}`, JSON.stringify({ error: pdfError }));
        metadata.processingError = 'PDF parsing failed';
        metadata.pageCount = 0;
        metadata.hasText = false;
      }
      
    } else if (mimeType.startsWith('text/')) {
      // Handle text files
      const textContent = fileBuffer.toString('utf-8');
      metadata.textLength = textContent.length;
      metadata.hasText = textContent.trim().length > 0;
      metadata.searchableText = textContent.substring(0, 5000);
      
    } else {
      // Unknown document type
      metadata.processingError = 'Unsupported document type';
    }

    await job.progress(80);

    // Record processing time
    const processingStartTime = Date.now() - (job.processedOn || Date.now());
    metadata.processingTime = Date.now() - processingStartTime;

    // Update artifact with processing results
    await prisma.studentArtifact.update({
      where: { id: artifactId },
      data: {
        processingStatus: 'COMPLETED',
        processingCompletedAt: new Date(),
        metadata: metadata as any
      }
    });

    await job.progress(100);

    const result = {
      success: true,
      artifactId,
      metadata,
      processingTime: metadata.processingTime
    };

    logger.info(`Document processing completed for artifact ${artifactId}`, JSON.stringify({
      artifactId,
      processingTime: metadata.processingTime,
      pageCount: metadata.pageCount,
      hasText: metadata.hasText
    }));

    return result;

  } catch (error: unknown) {
    logger.error(`Document processing failed for artifact ${artifactId}`, JSON.stringify({
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      artifactId,
      userId,
      studentId
    }));

    // Update processing status to failed
    try {
      await prisma.studentArtifact.update({
        where: { id: artifactId },
        data: {
          processingStatus: 'FAILED',
          metadata: {
            processingError: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString()
          } as any
        }
      });
    } catch (updateError) {
      logger.error(`Failed to update artifact status after processing failure`, JSON.stringify({
        artifactId,
        updateError
      }));
    }

    // Re-throw to mark job as failed
    throw error;
  }
};

// Function already exported above