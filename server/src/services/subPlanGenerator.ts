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

    if (!doc) {
      d.end();
    } else {
      resolve();
    }
  });
}
