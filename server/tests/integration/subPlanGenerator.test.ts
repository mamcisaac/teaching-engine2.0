import { generateSubPlanPDF } from '../../src/services/subPlanGenerator';

describe('sub plan PDF generator', () => {
  it('creates a PDF buffer', async () => {
    const buf = await generateSubPlanPDF({
      today: [{ time: '09:00', activity: 'Math' }],
      upcoming: [
        { date: '2024-01-01', summary: 'Overview 1' },
        { date: '2024-01-02', summary: 'Overview 2' },
        { date: '2024-01-03', summary: 'Overview 3' },
      ],
      procedures: 'Follow class rules',
      studentNotes: 'Seat chart attached',
      emergencyContacts: 'Principal 555-1234',
    });
    expect(buf.length).toBeGreaterThan(0);
  });
});
