import { describe, it, expect } from '@jest/globals';
import { generateSubPlanPDF, SubPlanInput } from '../src/services/subPlanGenerator';
// import PDFDocument from 'pdfkit';
// import { Readable } from 'stream';

describe('Outcome integration in PDF exports', () => {
  it('should include curriculum outcomes in sub plan PDF', async () => {
    // Prepare test data
    const subPlanInput: SubPlanInput = {
      today: [
        { time: '09:00', activity: 'Math lesson' },
        { time: '10:30', activity: 'Reading practice' },
      ],
      upcoming: [{ date: '2023-09-15', summary: 'Review fractions' }],
      procedures: 'Standard classroom procedures',
      studentNotes: 'No allergies',
      emergencyContacts: 'Principal: 555-1234',
      curriculumOutcomes: [
        {
          code: 'MATH-1.1',
          description: 'Count to 100 by ones and tens',
          subject: 'Math',
        },
        {
          code: 'ELA-2.3',
          description: 'Read common high-frequency words by sight',
          subject: 'English Language Arts',
        },
        {
          code: 'MATH-1.2',
          description: 'Compare two numbers between 1 and 10',
          subject: 'Math',
        },
      ],
    };

    // Generate PDF
    const pdfBuffer = await generateSubPlanPDF(subPlanInput);

    // Convert buffer to string to check content
    const pdfText = pdfBuffer?.toString() || '';

    // Check that the PDF contains the expected section header
    expect(pdfText).toContain('Curriculum Outcomes Covered');

    // Check that each outcome is included
    expect(pdfText).toContain('MATH-1.1');
    expect(pdfText).toContain('Count to 100 by ones and tens');
    expect(pdfText).toContain('ELA-2.3');
    expect(pdfText).toContain('Read common high-frequency words by sight');

    // Check that subjects are grouped properly
    expect(pdfText).toContain('Math');
    expect(pdfText).toContain('English Language Arts');
  });

  it('should handle empty outcomes list correctly', async () => {
    // Prepare test data without outcomes
    const subPlanInput: SubPlanInput = {
      today: [{ time: '09:00', activity: 'Test activity' }],
      upcoming: [],
      procedures: 'Procedures',
      studentNotes: 'Notes',
      emergencyContacts: 'Contacts',
      curriculumOutcomes: [], // Empty array
    };

    // Generate PDF
    const pdfBuffer = await generateSubPlanPDF(subPlanInput);
    const pdfText = pdfBuffer?.toString() || '';

    // The PDF should not contain the outcomes section header
    expect(pdfText).not.toContain('Curriculum Outcomes Covered');
  });

  it('should handle undefined outcomes correctly', async () => {
    // Prepare test data without outcomes
    const subPlanInput: SubPlanInput = {
      today: [{ time: '09:00', activity: 'Test activity' }],
      upcoming: [],
      procedures: 'Procedures',
      studentNotes: 'Notes',
      emergencyContacts: 'Contacts',
      // No curriculumOutcomes field
    };

    // Generate PDF
    const pdfBuffer = await generateSubPlanPDF(subPlanInput);
    const pdfText = pdfBuffer?.toString() || '';

    // The PDF should not contain the outcomes section header
    expect(pdfText).not.toContain('Curriculum Outcomes Covered');
  });
});
