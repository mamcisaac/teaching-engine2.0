import PDFDocument from 'pdfkit';

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
export function generateSubPlanPDF(data: SubPlanInput): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(16).text('Emergency Sub Plan', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('Today', { underline: true });
    data.today.forEach((item) => {
      doc.text(`${item.time} - ${item.activity}`);
    });
    doc.moveDown();

    doc.text('Next 3 Days', { underline: true });
    data.upcoming.forEach((day) => {
      doc.text(`${day.date}: ${day.summary}`);
    });
    doc.moveDown();

    doc.text('Classroom Procedures', { underline: true });
    doc.text(data.procedures);
    doc.moveDown();

    doc.text('Student Notes', { underline: true });
    doc.text(data.studentNotes);
    doc.moveDown();

    doc.text('Emergency Contacts', { underline: true });
    doc.text(data.emergencyContacts);

    doc.end();
  });
}
