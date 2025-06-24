import { jest, describe, it, beforeEach, expect } from '@jest/globals';
import { extractWeeklyPlan } from '../../src/services/weeklyPlanExtractor';

// Get the mocked prisma from global
const mockPrisma = jest.mocked((global as any).testPrismaClient);

describe('WeeklyPlanExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractWeeklyPlan', () => {
    it('should extract weekly plan data for multiple days', async () => {
      // Mock data
      const mockSubject = {
        id: 1,
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
      };

      const mockMilestone = {
        id: 1,
        title: 'Number Operations',
        targetDate: new Date('2024-01-31'),
        subject: mockSubject,
        activities: [],
      };

      const mockActivity = {
        id: 1,
        title: 'Addition Practice',
        milestone: { subject: mockSubject },
        outcomes: [],
      };

      const mockDailyPlan = {
        id: 1,
        date: new Date('2024-01-15'),
        items: [
          {
            id: 1,
            startMin: 540, // 9:00 AM
            activity: mockActivity,
            slot: { subject: mockSubject },
          },
        ],
      };

      // Setup mocks
      mockPrisma.dailyPlan.findMany.mockResolvedValue([mockDailyPlan]);
      mockPrisma.milestone.findMany.mockResolvedValue([mockMilestone]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([mockSubject]);

      const result = await extractWeeklyPlan('2024-01-15', 3, { userId: 1 });

      expect(result).toHaveProperty('startDate', '2024-01-15');
      expect(result).toHaveProperty('days');
      expect(result.days).toHaveLength(3);
      expect(result).toHaveProperty('weeklyOverview');
      expect(result.weeklyOverview).toHaveProperty('subjects');
      expect(result.weeklyOverview).toHaveProperty('milestones');
      expect(result).toHaveProperty('continuityNotes');
      expect(result).toHaveProperty('emergencyBackupPlans');
    });

    it('should generate continuity notes between days', async () => {
      // Setup mock data for consecutive days with related activities
      const mockSubject = { id: 1, name: 'Mathematics' };

      const mockPlans = [
        {
          id: 1,
          date: new Date('2024-01-15'),
          items: [
            {
              id: 1,
              startMin: 540,
              activity: {
                id: 1,
                title: 'Introduction to Fractions',
                milestone: { subject: mockSubject },
              },
              slot: { subject: mockSubject },
            },
          ],
        },
        {
          id: 2,
          date: new Date('2024-01-16'),
          items: [
            {
              id: 2,
              startMin: 540,
              activity: {
                id: 2,
                title: 'Fraction Operations',
                milestone: { subject: mockSubject },
              },
              slot: { subject: mockSubject },
            },
          ],
        },
      ];

      mockPrisma.dailyPlan.findMany.mockResolvedValue(mockPlans);
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([mockSubject]);

      const result = await extractWeeklyPlan('2024-01-15', 2, { userId: 1 });

      expect(result.continuityNotes).toHaveLength(2);

      const day2Notes = result.continuityNotes[1];
      expect(day2Notes.connections.length).toBeGreaterThan(0);
      expect(day2Notes.connections[0]).toContain('Mathematics');
      expect(day2Notes.connections[0]).toContain('Introduction to Fractions');
      expect(day2Notes.connections[0]).toContain('Fraction Operations');
    });

    it('should generate emergency backup plans by subject', async () => {
      const mockSubjects = [
        {
          id: 1,
          name: 'Mathematics',
          activities: [
            { id: 1, title: 'Math Review Worksheets', isFallback: true },
            { id: 2, title: 'Number Games', isFallback: true },
          ],
        },
        {
          id: 2,
          name: 'Language Arts',
          activities: [{ id: 3, title: 'Silent Reading', isFallback: true }],
        },
      ];

      mockPrisma.dailyPlan.findMany.mockResolvedValue([]);
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue(mockSubjects);

      const result = await extractWeeklyPlan('2024-01-15', 1, { userId: 1 });

      expect(result.emergencyBackupPlans).toHaveLength(2);

      const mathPlan = result.emergencyBackupPlans.find((p) => p.subject === 'Mathematics');
      expect(mathPlan).toBeDefined();
      expect(mathPlan?.activities).toContain('Math Review Worksheets');
      expect(mathPlan?.activities).toContain('Number Games');
      expect(mathPlan?.materials).toContain('Math manipulatives');

      const langPlan = result.emergencyBackupPlans.find((p) => p.subject === 'Language Arts');
      expect(langPlan).toBeDefined();
      expect(langPlan?.activities).toContain('Silent Reading');
      expect(langPlan?.materials).toContain('Reading books');
    });

    it('should calculate subject hours and topics correctly', async () => {
      const mockSubject = { id: 1, name: 'Mathematics' };

      const mockDailyPlan = {
        id: 1,
        date: new Date('2024-01-15'),
        items: [
          {
            id: 1,
            startMin: 540, // 9:00 AM - assuming 15-minute slots
            activity: {
              id: 1,
              title: 'Addition',
              milestone: { subject: mockSubject },
              outcomes: [],
            },
            slot: { subject: mockSubject },
          },
          {
            id: 2,
            startMin: 555, // 9:15 AM
            activity: {
              id: 2,
              title: 'Subtraction',
              milestone: { subject: mockSubject },
              outcomes: [],
            },
            slot: { subject: mockSubject },
          },
          {
            id: 3,
            startMin: 570, // 9:30 AM
            activity: {
              id: 3,
              title: 'Word Problems',
              milestone: { subject: mockSubject },
              outcomes: [],
            },
            slot: { subject: mockSubject },
          },
        ],
      };

      mockPrisma.dailyPlan.findMany.mockResolvedValue([mockDailyPlan]);
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([mockSubject]);

      const result = await extractWeeklyPlan('2024-01-15', 1, { userId: 1 });

      const mathSubject = result.weeklyOverview.subjects.find((s) => s.name === 'Mathematics');
      expect(mathSubject).toBeDefined();
      expect(mathSubject?.totalHours).toBe(0.75); // 3 slots × 0.25 hours each
      expect(mathSubject?.keyTopics).toContain('Addition');
      expect(mathSubject?.keyTopics).toContain('Subtraction');
      expect(mathSubject?.keyTopics).toContain('Word Problems');
    });

    it('should handle empty days gracefully', async () => {
      mockPrisma.dailyPlan.findMany.mockResolvedValue([]);
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([]);

      const result = await extractWeeklyPlan('2024-01-15', 3, { userId: 1 });

      expect(result.startDate).toBe('2024-01-15');
      expect(result.days).toHaveLength(3);
      expect(result.weeklyOverview.subjects).toHaveLength(0);
      expect(result.weeklyOverview.milestones).toHaveLength(0);
      expect(result.continuityNotes).toHaveLength(3);
      expect(result.emergencyBackupPlans).toHaveLength(0);
    });

    it('should respect user options for data inclusion', async () => {
      const mockDailyPlan = {
        id: 1,
        date: new Date('2024-01-15'),
        items: [],
      };

      mockPrisma.dailyPlan.findMany.mockResolvedValue([mockDailyPlan]);
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.assessmentResult.findMany.mockResolvedValue([]);
      mockPrisma.calendarEvent.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([]);

      // Test with includeGoals: false
      const result = await extractWeeklyPlan('2024-01-15', 1, {
        userId: 1,
        includeGoals: false,
        includeRoutines: false,
        includePlans: false,
      });

      expect(result.days[0].goals).toBeUndefined();
      expect(result.days[0].routines).toBeUndefined();
    });
  });
});
