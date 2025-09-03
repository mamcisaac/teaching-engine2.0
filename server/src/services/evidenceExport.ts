/**
 * Evidence Export Service
 * Creates downloadable packages of student evidence for Emily to share with parents
 * through her usual communication methods (email, newsletters, etc.)
 */

import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@teaching-engine/database';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface ExportOptions {
  studentId?: string;
  subject?: string;
  startDate?: Date;
  endDate?: Date;
  includePhotos?: boolean;
  includeVideos?: boolean;
  includeAudio?: boolean;
  includeDocuments?: boolean;
  includeNotes?: boolean;
  format?: 'pdf' | 'zip' | 'both';
  parentFriendly?: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  message: string;
  includedItems: {
    artifacts: number;
    photos: number;
    videos: number;
    audio: number;
    documents: number;
    notes: number;
  };
}

/**
 * Export evidence for a specific student
 */
export const exportStudentEvidence = async (
  studentId: string,
  userId: number,
  options: ExportOptions = {}
): Promise<ExportResult> => {
  logger.info(`Exporting evidence for student ${studentId}`);

  try {
    // Verify student belongs to teacher
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        artifacts: {
          where: {
            dateCollected: {
              gte: options.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
              lte: options.endDate || new Date()
            },
            ...(options.subject ? {
              outcomes: {
                some: {
                  outcome: {
                    subject: options.subject
                  }
                }
              }
            } : {})
          },
          include: {
            outcomes: {
              include: {
                outcome: {
                  select: {
                    subject: true,
                    code: true,
                    description: true
                  }
                }
              }
            }
          },
          orderBy: { dateCollected: 'desc' }
        },
        outcomeProgress: {
          include: {
            outcome: {
              select: {
                subject: true,
                code: true,
                description: true,
                strand: true
              }
            }
          }
        }
      }
    });

    if (!student || student.userId !== userId) {
      return {
        success: false,
        message: 'Student not found or access denied',
        includedItems: { artifacts: 0, photos: 0, videos: 0, audio: 0, documents: 0, notes: 0 }
      };
    }

    // Filter artifacts by type based on options
    const filteredArtifacts = student.artifacts.filter(artifact => {
      if (options.includePhotos === false && artifact.artifactType === 'PHOTO') return false;
      if (options.includeVideos === false && artifact.artifactType === 'VIDEO') return false;
      if (options.includeAudio === false && artifact.artifactType === 'AUDIO') return false;
      if (options.includeDocuments === false && artifact.artifactType === 'DOCUMENT') return false;
      if (options.includeNotes === false && artifact.artifactType === 'NOTE') return false;
      return true;
    });

    // Count items by type
    const includedItems = {
      artifacts: filteredArtifacts.length,
      photos: filteredArtifacts.filter(a => a.artifactType === 'PHOTO').length,
      videos: filteredArtifacts.filter(a => a.artifactType === 'VIDEO').length,
      audio: filteredArtifacts.filter(a => a.artifactType === 'AUDIO').length,
      documents: filteredArtifacts.filter(a => a.artifactType === 'DOCUMENT').length,
      notes: filteredArtifacts.filter(a => a.artifactType === 'NOTE').length
    };

    if (filteredArtifacts.length === 0) {
      return {
        success: false,
        message: 'No evidence found for the specified criteria',
        includedItems
      };
    }

    // Create temp directory for export
    const tempDir = path.join(os.tmpdir(), `evidence-export-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const format = options.format || 'pdf';
    let resultPath: string;
    let fileName: string;

    if (format === 'pdf' || format === 'both') {
      // Generate PDF report
      const pdfPath = await generateStudentEvidencePDF(student, filteredArtifacts, tempDir, options);
      resultPath = pdfPath;
      fileName = path.basename(pdfPath);
    }

    if (format === 'zip' || format === 'both') {
      // Create ZIP package with all files
      const zipPath = await createEvidenceZip(student, filteredArtifacts, tempDir, options);
      resultPath = zipPath;
      fileName = path.basename(zipPath);
    }

    const stats = await fs.stat(resultPath!);

    return {
      success: true,
      filePath: resultPath!,
      fileName: fileName!,
      fileSize: stats.size,
      message: `Successfully exported evidence for ${student.firstName} ${student.lastName}`,
      includedItems
    };

  } catch (error: unknown) {
    logger.error('Failed to export student evidence:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: `Export failed: ${(error as Error).message}`,
      includedItems: { artifacts: 0, photos: 0, videos: 0, audio: 0, documents: 0, notes: 0 }
    };
  }
};

/**
 * Generate PDF report with embedded evidence
 */
const generateStudentEvidencePDF = async (
  student: any,
  artifacts: any[],
  tempDir: string,
  options: ExportOptions
): Promise<string> => {
  const fileName = `${student.firstName}_${student.lastName}_Evidence_${new Date().toISOString().split('T')[0]}.pdf`;
  const pdfPath = path.join(tempDir, fileName);

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72
    }
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text('Student Evidence Portfolio', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`${student.firstName} ${student.lastName}`, { align: 'center' });
  doc.fontSize(12).text(`Grade ${student.grade} - Student ID: ${student.studentNumber || 'N/A'}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-CA')}`, { align: 'center' });
  
  if (options.parentFriendly) {
    doc.moveDown();
    doc.fontSize(10).text('This portfolio showcases your child\'s learning journey and progress in our Grade 1 French Immersion classroom.', { align: 'center', color: 'gray' });
  }
  
  doc.moveDown(2);

  // ETFO Explanation for parents
  if (options.parentFriendly) {
    doc.fontSize(14).text('Understanding Your Child\'s Progress', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text('We use the ETFO Growing Success framework to assess your child\'s learning:');
    doc.moveDown(0.5);
    doc.text('• ', { continued: true }).fillColor('green').text('Exceeding: ', { continued: true }).fillColor('black').text('Your child demonstrates learning beyond grade-level expectations');
    doc.text('• ', { continued: true }).fillColor('blue').text('Meeting: ', { continued: true }).fillColor('black').text('Your child demonstrates the expected grade-level learning');
    doc.text('• ', { continued: true }).fillColor('orange').text('Approaching: ', { continued: true }).fillColor('black').text('Your child is progressing toward grade-level expectations');
    doc.text('• ', { continued: true }).fillColor('red').text('Not Yet: ', { continued: true }).fillColor('black').text('Your child needs more time and support to reach expectations');
    doc.moveDown(2);
  }

  // Current Progress Summary
  if (student.outcomeProgress && student.outcomeProgress.length > 0) {
    doc.fontSize(14).text('Current Progress Overview', { underline: true });
    doc.moveDown();

    const progressBySubject: Record<string, any[]> = {};
    for (const progress of student.outcomeProgress) {
      const subject = progress.outcome?.subject || 'Other';
      if (!progressBySubject[subject]) progressBySubject[subject] = [];
      progressBySubject[subject].push(progress);
    }

    for (const [subject, progressItems] of Object.entries(progressBySubject)) {
      doc.fontSize(12).text(subject, { underline: true });
      doc.moveDown(0.5);

      const counts = { EXCEEDING: 0, MEETING: 0, APPROACHING: 0, NOT_YET: 0 };
      for (const item of progressItems) {
        counts[item.currentLevel as keyof typeof counts]++;
      }

      doc.fontSize(10);
      Object.entries(counts).forEach(([level, count]) => {
        if (count > 0) {
          const color = level === 'EXCEEDING' ? 'green' : 
                       level === 'MEETING' ? 'blue' :
                       level === 'APPROACHING' ? 'orange' : 'red';
          doc.fillColor(color).text(`${level.replace('_', ' ')}: ${count} outcomes`, { continued: true }).fillColor('black').text('');
        }
      });
      doc.moveDown();
    }
    doc.moveDown();
  }

  // Evidence Items
  doc.fontSize(14).text('Learning Evidence', { underline: true });
  doc.moveDown();

  for (const artifact of artifacts.slice(0, 20)) { // Limit to prevent huge PDFs
    doc.fontSize(12).text(`${artifact.title || 'Untitled'}`, { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(10);
    doc.text(`Type: ${artifact.artifactType} | Date: ${new Date(artifact.dateCollected).toLocaleDateString('en-CA')}`);
    
    if (artifact.description) {
      doc.moveDown(0.3);
      doc.text(`Description: ${artifact.description}`);
    }

    // Show connected learning outcomes
    if (artifact.outcomes && artifact.outcomes.length > 0) {
      doc.moveDown(0.3);
      doc.text('Connected to:', { underline: true });
      for (const outcome of artifact.outcomes) {
        doc.text(`• ${outcome.outcome.subject}: ${outcome.outcome.description}`);
      }
    }

    // Note about multimedia files
    if (['PHOTO', 'VIDEO', 'AUDIO'].includes(artifact.artifactType)) {
      doc.moveDown(0.3);
      doc.fillColor('gray').text(`[${artifact.artifactType} file - please see attached files for full content]`).fillColor('black');
    }

    doc.moveDown();

    // Add page break if needed
    if (doc.y > 650) {
      doc.addPage();
    }
  }

  if (artifacts.length > 20) {
    doc.moveDown();
    doc.fillColor('gray').text(`Note: Showing most recent 20 items. Total evidence items: ${artifacts.length}`).fillColor('black');
  }

  // Footer
  doc.moveDown(2);
  if (options.parentFriendly) {
    doc.fontSize(10).fillColor('gray');
    doc.text('Questions about your child\'s progress? Please contact me to discuss further.', { align: 'center' });
    doc.text('Thank you for supporting your child\'s learning journey!', { align: 'center' });
  } else {
    doc.text('Generated by Teaching Engine Student Assessment System', { align: 'center' });
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      await fs.writeFile(pdfPath, buffer);
      resolve(pdfPath);
    });
  });
};

/**
 * Create ZIP package with all files
 */
const createEvidenceZip = async (
  student: any,
  artifacts: any[],
  tempDir: string,
  options: ExportOptions
): Promise<string> => {
  const fileName = `${student.firstName}_${student.lastName}_Evidence_Package_${new Date().toISOString().split('T')[0]}.zip`;
  const zipPath = path.join(tempDir, fileName);

  const output = require('fs').createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  // Add README file
  const readmeContent = `
Evidence Package for ${student.firstName} ${student.lastName}
Grade ${student.grade} - Generated: ${new Date().toLocaleDateString('en-CA')}

This package contains your child's learning evidence from our Grade 1 French Immersion classroom.

Contents:
- Student_Progress_Report.pdf: Complete overview with explanations
- Photos/: Photo evidence of learning
- Videos/: Video recordings of learning activities  
- Audio/: Audio recordings (conversations, reading, etc.)
- Documents/: Written work and documents
- Notes/: Teacher observations and notes

Understanding Progress Levels:
• Exceeding: Learning beyond grade-level expectations
• Meeting: Demonstrating expected grade-level learning
• Approaching: Progressing toward grade-level expectations  
• Not Yet: Needs more time and support

Questions? Please feel free to contact me!
`;

  archive.append(readmeContent, { name: 'README.txt' });

  // Add PDF report
  const pdfPath = await generateStudentEvidencePDF(student, artifacts, tempDir, options);
  archive.file(pdfPath, { name: 'Student_Progress_Report.pdf' });

  // Add artifact files organized by type
  for (const artifact of artifacts) {
    if (artifact.filePath && artifact.fileName) {
      try {
        const fullPath = path.resolve(artifact.filePath);
        await fs.access(fullPath); // Check if file exists

        const typeFolder = artifact.artifactType.toLowerCase() + 's';
        const fileName = `${new Date(artifact.dateCollected).toISOString().split('T')[0]}_${artifact.fileName}`;
        
        archive.file(fullPath, { name: `${typeFolder}/${fileName}` });
      } catch (error: unknown) {
        logger.warn(`Could not add file to zip: ${artifact.filePath}`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  archive.finalize();

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);
  });
};

/**
 * Export class-wide evidence summary for newsletters
 */
export const exportClassSummary = async (
  userId: number,
  options: ExportOptions = {}
): Promise<ExportResult> => {
  logger.info('Exporting class evidence summary');

  try {
    const students = await prisma.student.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        artifacts: {
          where: {
            dateCollected: {
              gte: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              lte: options.endDate || new Date()
            }
          }
        },
        outcomeProgress: {
          include: {
            outcome: {
              select: {
                subject: true,
                strand: true
              }
            }
          }
        }
      }
    });

    // Create summary PDF
    const tempDir = path.join(os.tmpdir(), `class-summary-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const pdfPath = await generateClassSummaryPDF(students, tempDir, options);
    const stats = await fs.stat(pdfPath);

    const totalArtifacts = students.reduce((sum, s) => sum + s.artifacts.length, 0);

    return {
      success: true,
      filePath: pdfPath,
      fileName: path.basename(pdfPath),
      fileSize: stats.size,
      message: 'Successfully generated class summary',
      includedItems: {
        artifacts: totalArtifacts,
        photos: 0,
        videos: 0,
        audio: 0,
        documents: 0,
        notes: 0
      }
    };

  } catch (error: unknown) {
    logger.error('Failed to export class summary:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: `Export failed: ${(error as Error).message}`,
      includedItems: { artifacts: 0, photos: 0, videos: 0, audio: 0, documents: 0, notes: 0 }
    };
  }
};

/**
 * Generate class summary PDF for newsletters
 */
const generateClassSummaryPDF = async (
  students: any[],
  tempDir: string,
  options: ExportOptions
): Promise<string> => {
  const fileName = `Class_Learning_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  const pdfPath = path.join(tempDir, fileName);

  const doc = new PDFDocument({ size: 'LETTER', margins: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text('Grade 1 French Immersion - Class Learning Highlights', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${options.startDate?.toLocaleDateString('en-CA') || 'Last 30 days'} - ${(options.endDate || new Date()).toLocaleDateString('en-CA')}`, { align: 'center' });
  doc.moveDown(2);

  // Summary stats
  const totalArtifacts = students.reduce((sum, s) => sum + s.artifacts.length, 0);
  const totalProgress = students.reduce((sum, s) => sum + s.outcomeProgress.length, 0);

  doc.fontSize(14).text('Class Overview', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`• ${students.length} students actively learning`);
  doc.text(`• ${totalArtifacts} pieces of evidence collected`);
  doc.text(`• ${totalProgress} learning outcomes assessed`);
  doc.moveDown(2);

  // Subject highlights
  const subjectData: Record<string, { students: Set<string>; artifacts: number }> = {};
  
  for (const student of students) {
    for (const progress of student.outcomeProgress) {
      const subject = progress.outcome?.subject || 'Other';
      if (!subjectData[subject]) {
        subjectData[subject] = { students: new Set().add(student.id), artifacts: 0 };
      } else {
        subjectData[subject].students.add(student.id);
      }
    }
    
    for (const artifact of student.artifacts) {
      // Could connect to subject via outcomes, but for now count all
      Object.keys(subjectData).forEach(subject => {
        subjectData[subject].artifacts += artifact.outcomes?.some((o: any) => o.outcome.subject === subject) ? 1 : 0;
      });
    }
  }

  doc.fontSize(14).text('Learning by Subject', { underline: true });
  doc.moveDown();
  doc.fontSize(12);

  for (const [subject, data] of Object.entries(subjectData)) {
    const studentCount = data.students.size;
    doc.text(`${subject}: ${studentCount} students actively assessed`);
  }

  doc.moveDown(2);

  // Recent learning highlights (could be customized)
  doc.fontSize(14).text('Recent Learning Highlights', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text('• Students have been actively engaged in hands-on learning activities');
  doc.text('• Evidence collected across all subjects shows strong progress');
  doc.text('• Individual progress reports available upon request');
  
  doc.moveDown(2);
  doc.fontSize(10).fillColor('gray');
  doc.text('This summary provides an overview of classroom learning activities. Individual student progress reports are available separately.', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      await fs.writeFile(pdfPath, buffer);
      resolve(pdfPath);
    });
  });
};

export default {
  exportStudentEvidence,
  exportClassSummary
};