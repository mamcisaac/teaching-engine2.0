/**
 * PDF Report Generation Service
 * Creates progress reports for individual students or the entire class
 * Using PDFKit for generation
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';
import PDFDocument from 'pdfkit';

// PDFKit types don't always match the runtime API
type PDFKitDocument = typeof PDFDocument;

// Types for progress tracking data
interface ProgressItem {
  currentLevel: string;
  outcome: {
    description: string;
    subject: string;
  };
  areasForGrowth?: string;
  teacherNotes?: string;
  updatedAt?: Date | string;
}

interface ArtifactItem {
  title: string;
  artifactType: string;
  dateCollected: Date;
  description?: string;
}

interface LevelCounts {
  EXCEEDING: number;
  MEETING: number;
  APPROACHING: number;
  BEGINNING: number;
  NOT_YET: number;
  total: number;
}

import { logger } from '../logger';


export interface ReportOptions {
  studentId?: string;
  subject?: string;
  startDate?: Date;
  endDate?: Date;
  includeArtifacts?: boolean;
  includeProgressChart?: boolean;
}

/**
 * Generate individual student progress report
 */
export const generateStudentReport = async (
  studentId: string,
  userId: number,
  options: ReportOptions = {}
): Promise<Buffer> => {
  logger.info(`Generating progress report for student ${studentId}`);
  
  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      artifacts: {
        where: {
          dateCollected: {
            gte: options.startDate || new Date(new Date().setMonth(new Date().getMonth() - 3)),
            lte: options.endDate || new Date()
          }
        },
        orderBy: { dateCollected: 'desc' },
        take: 10 // Recent artifacts
      }
    }
  });

  if (!student || student.userId !== userId) {
    throw new Error('Student not found or access denied');
  }

  // Fetch progress data
  const progress = await prisma.studentOutcomeProgress.findMany({
    where: {
      studentId,
      outcome: options.subject ? {
        subject: options.subject
      } : undefined
    },
    include: {
      outcome: true
    }
  });

  // Create PDF document
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

  // Generate report content
  generateReportHeader(doc, student);
  generateProgressSummary(doc, progress as ProgressItem[]);
  
  if (options.includeProgressChart) {
    generateProgressChart(doc, progress as ProgressItem[]);
  }
  
  generateStrengthsAndGrowth(doc, progress as ProgressItem[]);
  
  if (options.includeArtifacts && student.artifacts.length > 0) {
    generateRecentArtifacts(doc, student.artifacts as ArtifactItem[]);
  }
  
  generateTeacherComments(doc, (progress as Array<Record<string, unknown>>).filter((p: Record<string, unknown>) => p.teacherNotes).map((p: Record<string, unknown>) => ({
    currentLevel: p.currentLevel || 'Not assessed',
    outcome: p.outcome || { description: '', subject: '' },
    teacherNotes: p.teacherNotes
  })) as ProgressItem[]);
  generateReportFooter(doc);

  // Finalize PDF
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      logger.info(`Generated report for ${student.firstName} ${student.lastName}: ${buffer.length} bytes`);
      resolve(buffer);
    });
  });
};

/**
 * Generate class overview report
 */
export const generateClassReport = async (
  userId: number,
  _options: ReportOptions = {}
): Promise<Buffer> => {
  logger.info(`Generating class overview report for teacher ${userId}`);
  
  // Fetch all active students
  const students = await prisma.student.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      outcomeProgress: {
        include: {
          outcome: true
        }
      }
    }
  });

  // Create PDF document
  const doc = new PDFDocument({
    size: 'LETTER',
    layout: 'landscape' as const, // PDFKit layout option
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Generate class overview
  doc.fontSize(20).text('Class Progress Overview', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString('en-CA')}`, { align: 'center' });
  doc.moveDown(2);

  // Create summary table
  doc.fontSize(14).text('Student Progress Summary', { underline: true });
  doc.moveDown();

  // Table headers
  const tableTop = doc.y;
  doc.fontSize(10);
  doc.text('Student', 50, tableTop, { width: 150 });
  doc.text('Exceeding', 200, tableTop, { width: 80, align: 'center' });
  doc.text('Meeting', 280, tableTop, { width: 80, align: 'center' });
  doc.text('Approaching', 360, tableTop, { width: 80, align: 'center' });
  doc.text('Not Yet', 440, tableTop, { width: 80, align: 'center' });
  doc.text('Total', 520, tableTop, { width: 80, align: 'center' });

  doc.moveTo(50, tableTop + 15)
     .lineTo(600, tableTop + 15)
     .stroke();

  let yPosition = tableTop + 25;

  // Add student rows
  for (const student of students) {
    const levels = countLevels(student.outcomeProgress as ProgressItem[]);
    
    doc.text(`${student.firstName} ${student.lastName}`, 50, yPosition, { width: 150 });
    doc.text(levels.EXCEEDING.toString(), 200, yPosition, { width: 80, align: 'center' });
    doc.text(levels.MEETING.toString(), 280, yPosition, { width: 80, align: 'center' });
    doc.text(levels.APPROACHING.toString(), 360, yPosition, { width: 80, align: 'center' });
    doc.text(levels.NOT_YET.toString(), 440, yPosition, { width: 80, align: 'center' });
    doc.text(levels.total.toString(), 520, yPosition, { width: 80, align: 'center' });
    
    yPosition += 20;
    
    if (yPosition > 500) {
      doc.addPage();
      yPosition = 50;
    }
  }

  // Add class statistics
  doc.addPage();
  generateClassStatistics(doc, students as Array<{outcomeProgress: ProgressItem[]}>);

  // Finalize PDF
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      logger.info(`Generated class report: ${buffer.length} bytes`);
      resolve(buffer);
    });
  });
};

// Helper functions for report generation

function generateReportHeader(doc: PDFKitDocument, student: { firstName: string; lastName: string; grade: number; studentNumber?: string | null }) {
  doc.fontSize(20).text('Student Progress Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`${student.firstName} ${student.lastName}`, { align: 'center' });
  doc.fontSize(12).text(`Grade ${student.grade} - Student ID: ${student.studentNumber || 'N/A'}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString('en-CA')}`, { align: 'center' });
  doc.moveDown(2);
}

function generateProgressSummary(doc: PDFKitDocument, progress: Array<{currentLevel: string}>) {
  doc.fontSize(14).text('Overall Progress', { underline: true });
  doc.moveDown();
  
  const levels = countLevels(progress);
  doc.fontSize(11);
  doc.text(`• Exceeding Expectations: ${levels.EXCEEDING} outcomes`);
  doc.text(`• Meeting Expectations: ${levels.MEETING} outcomes`);
  doc.text(`• Approaching Expectations: ${levels.APPROACHING} outcomes`);
  doc.text(`• Not Yet Meeting Expectations: ${levels.NOT_YET} outcomes`);
  doc.moveDown();
}

function generateProgressChart(doc: PDFKitDocument, progress: Array<{outcome: {subject: string}}>) {
  doc.fontSize(14).text('Progress by Subject', { underline: true });
  doc.moveDown();
  
  // Group by subject
  const bySubject: Record<string, Array<{outcome: {subject: string}}>> = {};
  for (const p of progress) {
    const subject = p.outcome.subject || 'Unknown';
    if (!bySubject[subject]) bySubject[subject] = [];
    bySubject[subject].push(p);
  }
  
  doc.fontSize(11);
  for (const [subject, items] of Object.entries(bySubject)) {
    const levels = countLevels(items.filter((item: Record<string, unknown>) => item.currentLevel).map((item: Record<string, unknown>) => ({ currentLevel: String(item.currentLevel) || 'Not assessed' })));
    const percent = Math.round((levels.MEETING + levels.EXCEEDING) / levels.total * 100) || 0;
    doc.text(`${subject}: ${percent}% meeting or exceeding expectations`);
  }
  doc.moveDown();
}

function generateStrengthsAndGrowth(doc: PDFKitDocument, progress: Array<{currentLevel: string; outcome: {description: string}; areasForGrowth?: string}>) {
  // Use parent-friendly language
  doc.fontSize(14).text('What Your Child Does Well', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  const strengths = progress
    .filter(p => p.currentLevel === 'EXCEEDING' || p.currentLevel === 'MEETING')
    .slice(0, 5);
  
  if (strengths.length > 0) {
    for (const s of strengths) {
      const levelText = s.currentLevel === 'EXCEEDING' 
        ? ' (Excelling)' 
        : ' (Strong understanding)';
      doc.text(`• ${s.outcome.description}${levelText}`);
    }
  } else {
    doc.text('Your child is developing important foundational skills.');
  }
  
  doc.moveDown();
  doc.fontSize(14).text('Skills We\'re Working On Together', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  const growth = progress
    .filter(p => p.currentLevel === 'NOT_YET' || p.currentLevel === 'APPROACHING')
    .slice(0, 5);
  
  if (growth.length > 0) {
    for (const g of growth) {
      const progressText = g.currentLevel === 'APPROACHING' 
        ? ' (Making good progress)' 
        : ' (Just beginning)';
      doc.text(`• ${g.outcome.description}${progressText}`);
      if (g.areasForGrowth) {
        doc.fontSize(10).text(`  How you can help: ${g.areasForGrowth}`, { indent: 20 });
        doc.fontSize(11);
      }
    }
  } else {
    doc.text('Your child is successfully meeting all learning expectations we\'ve assessed so far!');
  }
  doc.moveDown();
}

function generateRecentArtifacts(doc: PDFKitDocument, artifacts: Array<{title: string; artifactType: string; dateCollected: Date; description?: string}>) {
  doc.fontSize(14).text('Recent Work Samples', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  for (const artifact of artifacts.slice(0, 5)) {
    doc.text(`• ${artifact.title} (${artifact.artifactType}) - ${new Date(artifact.dateCollected).toLocaleDateString('en-CA')}`);
    if (artifact.description) {
      doc.fontSize(10).text(`  ${artifact.description}`, { indent: 20 });
      doc.fontSize(11);
    }
  }
  doc.moveDown();
}

function generateTeacherComments(doc: PDFKitDocument, progress: ProgressItem[]) {
  doc.fontSize(14).text('Teacher Comments', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  // Find recent comments
  const withComments = progress
    .filter((p: ProgressItem) => p.teacherNotes)
    .sort((a: ProgressItem, b: ProgressItem) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 3);
  
  if (withComments.length > 0) {
    for (const p of withComments) {
      doc.text(`${p.outcome.subject}: ${p.teacherNotes}`);
      doc.moveDown(0.5);
    }
  } else {
    doc.text('See individual assessments for detailed feedback');
  }
  doc.moveDown();
}

function generateReportFooter(doc: PDFKitDocument) {
  doc.fontSize(10)
     .text('This report reflects ongoing assessment based on classroom observations, conversations, and student products.', 
           { align: 'center' });
  doc.moveDown();
  doc.text('For questions or to discuss this report, please contact the teacher.', { align: 'center' });
}

function generateClassStatistics(doc: PDFKitDocument, students: Array<{outcomeProgress: Array<{currentLevel: string}>}>) {
  doc.fontSize(16).text('Class Statistics', { align: 'center' });
  doc.moveDown(2);
  
  let totalExceeding = 0;
  let totalMeeting = 0;
  let totalApproaching = 0;
  let totalNotYet = 0;
  
  for (const student of students) {
    const levels = countLevels(student.outcomeProgress as ProgressItem[]);
    totalExceeding += levels.EXCEEDING;
    totalMeeting += levels.MEETING;
    totalApproaching += levels.APPROACHING;
    totalNotYet += levels.NOT_YET;
  }
  
  const total = totalExceeding + totalMeeting + totalApproaching + totalNotYet;
  
  doc.fontSize(12);
  doc.text('Class-Wide Progress Distribution:');
  doc.moveDown();
  doc.text(`• Exceeding: ${Math.round(totalExceeding / total * 100)}%`);
  doc.text(`• Meeting: ${Math.round(totalMeeting / total * 100)}%`);
  doc.text(`• Approaching: ${Math.round(totalApproaching / total * 100)}%`);
  doc.text(`• Not Yet: ${Math.round(totalNotYet / total * 100)}%`);
}

function countLevels(progress: Array<{currentLevel: string}>): LevelCounts {
  const counts = {
    EXCEEDING: 0,
    MEETING: 0,
    APPROACHING: 0,
    BEGINNING: 0,
    NOT_YET: 0,
    total: 0
  };
  
  for (const p of progress) {
    const level = p.currentLevel as keyof typeof counts;
    if (level in counts) {
      counts[level]++;
    }
    counts.total++;
  }
  
  return counts;
}
