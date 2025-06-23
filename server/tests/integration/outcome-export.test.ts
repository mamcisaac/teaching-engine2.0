import { describe, it, expect, jest } from '@jest/globals';
import { generateSubPlanPDF, SubPlanInput } from '../../src/services/subPlanGenerator';
import PDFDocument from 'pdfkit';

describe('Outcome integration in PDF exports', () => {
  it('should include curriculum outcomes in sub plan PDF', async () => {
    // Mock PDF document methods to track what gets written
    const mockText = jest.fn().mockReturnThis();
    const mockMoveDown = jest.fn().mockReturnThis();
    const mockFont = jest.fn().mockReturnThis();
    const mockFontSize = jest.fn().mockReturnThis();
    const mockEnd = jest.fn();

    const mockDoc = {
      text: mockText,
      moveDown: mockMoveDown,
      font: mockFont,
      fontSize: mockFontSize,
      end: mockEnd,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'end') callback();
      }),
    } as unknown as PDFDocument;

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

    // Generate PDF with mocked document
    await generateSubPlanPDF(subPlanInput, mockDoc);

    // Verify that curriculum outcomes section was added
    expect(mockText).toHaveBeenCalledWith('Learning Goals (Curriculum Outcomes)', {
      underline: true,
    });

    // Verify that each outcome code and description were included
    const textCalls = mockText.mock.calls.map((call) => call[0]);
    expect(textCalls.some((call) => call.includes('MATH-1.1'))).toBe(true);
    expect(textCalls.some((call) => call.includes('Count to 100 by ones and tens'))).toBe(true);
    expect(textCalls.some((call) => call.includes('ELA-2.3'))).toBe(true);
    expect(
      textCalls.some((call) => call.includes('Read common high-frequency words by sight')),
    ).toBe(true);

    // Check that subjects are grouped properly
    expect(textCalls.some((call) => call.includes('Math'))).toBe(true);
    expect(textCalls.some((call) => call.includes('English Language Arts'))).toBe(true);
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
