/**
 * Report Generation Queue Processor
 * Handles PDF report creation for student progress
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Job } from 'bull';

import { logger } from '../../../logger';
import { generateStudentReport, generateClassReport } from '../../reportGenerator';


interface StudentReportJobData {
  type: 'student' | 'class';
  userId: number;
  studentId?: string;
  options?: {
    subject?: string;
    includeArtifacts?: boolean;
    includeProgressChart?: boolean;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Process report generation job
 * Generates PDF reports for students or entire class
 */
export const processReportJob = async (job: Job<StudentReportJobData>): Promise<unknown> => {
  const { type, userId, studentId, options = {} } = job.data;
  
  try {
    logger.info(`Starting report generation`, JSON.stringify({
      type,
      userId,
      studentId,
      options
    }));

    await job.progress(10);

    let reportBuffer: Buffer;
    let fileName: string;
    let reportMetadata: Record<string, unknown> = {};

    if (type === 'student') {
      if (!studentId) {
        throw new Error('Student ID is required for student reports');
      }

      // Get student information for logging
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { firstName: true, lastName: true }
      });

      if (!student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      logger.info(`Generating individual report for ${student.firstName} ${student.lastName}`);
      
      await job.progress(30);

      // Generate student report
      const reportData = await generateStudentReport(
        studentId,
        userId,
        {
          subject: options.subject,
          includeArtifacts: options.includeArtifacts || false,
          includeProgressChart: options.includeProgressChart || false,
          startDate: options.startDate ? new Date(options.startDate) : undefined,
          endDate: options.endDate ? new Date(options.endDate) : undefined
        }
      );

      reportBuffer = reportData;
      fileName = `student-report-${studentId}.pdf`;
      reportMetadata = {
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        subject: options.subject,
        includeArtifacts: options.includeArtifacts,
        includeProgressChart: options.includeProgressChart,
        dateRange: {
          start: options.startDate,
          end: options.endDate
        }
      };

    } else if (type === 'class') {
      logger.info('Generating class overview report');
      
      await job.progress(30);

      // Generate class report
      const reportData = await generateClassReport(
        userId,
        {
          subject: options.subject,
          startDate: options.startDate ? new Date(options.startDate) : undefined,
          endDate: options.endDate ? new Date(options.endDate) : undefined
        }
      );

      reportBuffer = reportData;
      fileName = `class-report-${userId}.pdf`;
      reportMetadata = {
        type: 'class',
        subject: options.subject,
        dateRange: {
          start: options.startDate,
          end: options.endDate
        }
      };

    } else {
      throw new Error(`Unknown report type: ${type}`);
    }

    await job.progress(80);

    // Calculate processing metrics
    const processingTime = Date.now() - (job.processedOn || Date.now());
    
    const result = {
      success: true,
      type,
      fileName,
      fileSize: reportBuffer.length,
      processingTime,
      metadata: reportMetadata
    };

    await job.progress(100);

    logger.info(`Report generation completed`, JSON.stringify({
      type,
      fileName,
      fileSize: reportBuffer.length,
      processingTime,
      studentId
    }));

    return result;

  } catch (error: unknown) {
    logger.error(`Report generation failed`, JSON.stringify({
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type,
      userId,
      studentId,
      options
    }));

    // Re-throw to mark job as failed
    throw error;
  }
};

// Function already exported above