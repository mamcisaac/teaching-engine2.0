/**
 * PDF Report Generation Service
 * Creates progress reports for individual students or the entire class
 * Using PDFKit for generation
 */

import PDFDocument from 'pdfkit';
import { PrismaClient } from '@teaching-engine/database';
import { logger } from '../logger';

const prisma = new PrismaClient();

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
  generateProgressSummary(doc, progress);
  
  if (options.includeProgressChart) {
    generateProgressChart(doc, progress);
  }
  
  generateStrengthsAndGrowth(doc, progress);
  
  if (options.includeArtifacts && student.artifacts.length > 0) {
    generateRecentArtifacts(doc, student.artifacts);
  }
  
  generateTeacherComments(doc, progress);
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
  options: ReportOptions = {}
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
    landscape: true,
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
    const levels = countLevels(student.outcomeProgress);
    
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
  generateClassStatistics(doc, students);

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

function generateReportHeader(doc: PDFKit.PDFDocument, student: any) {
  doc.fontSize(20).text('Student Progress Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`${student.firstName} ${student.lastName}`, { align: 'center' });
  doc.fontSize(12).text(`Grade ${student.grade} - Student ID: ${student.studentNumber || 'N/A'}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString('en-CA')}`, { align: 'center' });
  doc.moveDown(2);
}

function generateProgressSummary(doc: PDFKit.PDFDocument, progress: any[]) {
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

function generateProgressChart(doc: PDFKit.PDFDocument, progress: any[]) {
  doc.fontSize(14).text('Progress by Subject', { underline: true });
  doc.moveDown();
  
  // Group by subject
  const bySubject: Record<string, any[]> = {};
  for (const p of progress) {
    const subject = p.outcome.subject;
    if (!bySubject[subject]) bySubject[subject] = [];
    bySubject[subject].push(p);
  }
  
  doc.fontSize(11);
  for (const [subject, items] of Object.entries(bySubject)) {
    const levels = countLevels(items);
    const percent = Math.round((levels.MEETING + levels.EXCEEDING) / levels.total * 100) || 0;
    doc.text(`${subject}: ${percent}% meeting or exceeding expectations`);
  }
  doc.moveDown();
}

function generateStrengthsAndGrowth(doc: PDFKit.PDFDocument, progress: any[]) {
  doc.fontSize(14).text('Areas of Strength', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  const strengths = progress
    .filter(p => p.currentLevel === 'EXCEEDING' || p.currentLevel === 'MEETING')
    .slice(0, 5);
  
  if (strengths.length > 0) {
    for (const s of strengths) {
      doc.text(`• ${s.outcome.description} (${s.currentLevel})`);
    }
  } else {
    doc.text('Continuing to develop foundational skills');
  }
  
  doc.moveDown();
  doc.fontSize(14).text('Areas for Growth', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  const growth = progress
    .filter(p => p.currentLevel === 'NOT_YET' || p.currentLevel === 'APPROACHING')
    .slice(0, 5);
  
  if (growth.length > 0) {
    for (const g of growth) {
      doc.text(`• ${g.outcome.description}`);
      if (g.areasForGrowth) {
        doc.fontSize(10).text(`  ${g.areasForGrowth}`, { indent: 20 });
        doc.fontSize(11);
      }
    }
  } else {
    doc.text('Student is meeting expectations across all assessed areas');
  }
  doc.moveDown();
}

function generateRecentArtifacts(doc: PDFKit.PDFDocument, artifacts: any[]) {
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

function generateTeacherComments(doc: PDFKit.PDFDocument, progress: any[]) {
  doc.fontSize(14).text('Teacher Comments', { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  
  // Find recent comments
  const withComments = progress
    .filter(p => p.teacherNotes)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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

function generateReportFooter(doc: PDFKit.PDFDocument) {
  doc.fontSize(10)
     .text('This report reflects ongoing assessment based on classroom observations, conversations, and student products.', 
           { align: 'center' });
  doc.moveDown();
  doc.text('For questions or to discuss this report, please contact the teacher.', { align: 'center' });
}

function generateClassStatistics(doc: PDFKit.PDFDocument, students: any[]) {
  doc.fontSize(16).text('Class Statistics', { align: 'center' });
  doc.moveDown(2);
  
  let totalExceeding = 0;
  let totalMeeting = 0;
  let totalApproaching = 0;
  let totalNotYet = 0;
  
  for (const student of students) {
    const levels = countLevels(student.outcomeProgress);
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

function countLevels(progress: any[]) {
  const counts = {
    EXCEEDING: 0,
    MEETING: 0,
    APPROACHING: 0,
    NOT_YET: 0,
    total: 0
  };
  
  for (const p of progress) {
    counts[p.currentLevel as keyof typeof counts]++;
    counts.total++;
  }
  
  return counts;
}