import PDFDocument from 'pdfkit';
import type * as PDFKit from 'pdfkit';

export interface DaySchedule {
  time: string;
  activity: string;
}

export interface UpcomingOverview {
  date: string;
  summary: string;
}

export interface SubPlanInput {
  today: DaySchedule[];
  upcoming: UpcomingOverview[];
  procedures: string;
  studentNotes: string;
  emergencyContacts: string;
  curriculumOutcomes?: Array<{
    code: string;
    description: string;
    subject: string;
  }>;
  goals?: Array<{
    id: number;
    text: string;
    status: string;
    studentName?: string;
  }>;
  routines?: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    timeOfDay?: string;
  }>;
  fallbackPlan?: string;
}

/**
 * Generate a PDF buffer for an emergency substitute plan.
 */
export function generateSubPlanPDF(
  data: SubPlanInput,
  doc?: PDFKit.PDFDocument,
): Promise<Buffer | void> {
  return new Promise((resolve) => {
    const d = doc ?? new PDFDocument();
    const chunks: Buffer[] = [];
    if (!doc) {
      d.on('data', (chunk: Buffer) => chunks.push(chunk));
      d.on('end', () => resolve(Buffer.concat(chunks)));
    }

    d.fontSize(16).text('Emergency Sub Plan', { align: 'center' });
    d.moveDown();

    d.fontSize(12).text('Today', { underline: true });
    data.today.forEach((item) => {
      d.text(`${item.time} - ${item.activity}`);
    });
    d.moveDown();

    d.text('Next 3 Days', { underline: true });
    data.upcoming.forEach((day) => {
      d.text(`${day.date}: ${day.summary}`);
    });
    d.moveDown();

    d.text('Classroom Procedures', { underline: true });
    d.text(data.procedures);
    d.moveDown();

    d.text('Student Notes', { underline: true });
    d.text(data.studentNotes);
    d.moveDown();

    d.text('Emergency Contacts', { underline: true });
    d.text(data.emergencyContacts);
    d.moveDown();

    // Add class routines section if available
    if (data.routines && data.routines.length > 0) {
      d.text('Class Routines', { underline: true });
      
      // Group routines by category
      const byCategory: Record<string, typeof data.routines> = {};
      data.routines.forEach((routine) => {
        if (!byCategory[routine.category]) {
          byCategory[routine.category] = [];
        }
        byCategory[routine.category].push(routine);
      });

      // Print routines by category
      Object.entries(byCategory).forEach(([category, routines]) => {
        d.font('Helvetica-Bold').text(category.charAt(0).toUpperCase() + category.slice(1));
        d.font('Helvetica');

        routines.forEach((routine) => {
          const timeStr = routine.timeOfDay ? ` (${routine.timeOfDay})` : '';
          d.text(`• ${routine.title}${timeStr}`, {
            indent: 20,
            continued: true,
          });
          d.text(` - ${routine.description}`, {
            indent: 30,
            continued: false,
          });
        });
        d.moveDown(0.5);
      });
      d.moveDown();
    }

    // Add student goals section if available
    if (data.goals && data.goals.length > 0) {
      d.text('Current Student Goals', { underline: true });
      data.goals.forEach((goal) => {
        const studentStr = goal.studentName ? `${goal.studentName}: ` : '';
        d.text(`• ${studentStr}${goal.text}`, {
          indent: 20,
          continued: false,
        });
      });
      d.moveDown();
    }

    // Add curriculum outcomes section if available
    if (data.curriculumOutcomes && data.curriculumOutcomes.length > 0) {
      d.text('Learning Goals (Curriculum Outcomes)', { underline: true });

      // Group outcomes by subject
      const bySubject: Record<string, Array<{ code: string; description: string }>> = {};
      data.curriculumOutcomes.forEach((outcome) => {
        if (!bySubject[outcome.subject]) {
          bySubject[outcome.subject] = [];
        }
        bySubject[outcome.subject].push({
          code: outcome.code,
          description: outcome.description,
        });
      });

      // Print outcomes by subject
      Object.entries(bySubject).forEach(([subject, outcomes]) => {
        d.font('Helvetica-Bold').text(subject);
        d.font('Helvetica');

        outcomes.forEach((outcome) => {
          d.text(`• ${outcome.code} – ${outcome.description}`, {
            indent: 20,
            continued: false,
          });
        });
        d.moveDown(0.5);
      });
      d.moveDown();
    }

    // Add fallback plan section if available
    if (data.fallbackPlan) {
      d.text('Emergency Fallback Plan', { underline: true });
      d.text(data.fallbackPlan);
      d.moveDown();
    }

    if (!doc) {
      d.end();
    } else {
      resolve();
    }
  });
}
