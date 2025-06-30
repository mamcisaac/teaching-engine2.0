import { jest } from '@jest/globals';
import { runProgressCheck } from '../../../src/jobs/progressCheck';
import { prisma } from '../../../src/prisma';

// Use the global mock setup from setup-all-mocks.ts
const mockPrisma = jest.mocked(prisma);
const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Progress Check Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockWarn.mockRestore();
  });

  describe('runProgressCheck', () => {
    it('should check unit plans ending within a week', async () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      await runProgressCheck();

      expect(mockPrisma.unitPlan.findMany).toHaveBeenCalledWith({
        where: {
          endDate: { lte: expect.any(Date) },
        },
        include: { lessonPlans: true, user: true },
      });

      const callArgs = mockPrisma.unitPlan.findMany.mock.calls[0][0];
      const queryDate = callArgs.where.endDate.lte;
      
      // Verify the query date is approximately one week from now
      const timeDiff = Math.abs(queryDate.getTime() - nextWeek.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should warn about unit plans with upcoming lessons', async () => {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 86400000); // Tomorrow

      const mockUnitPlans = [
        {
          id: 1,
          title: 'Unit Plan A',
          endDate: futureDate,
          lessonPlans: [
            { id: 1, date: futureDate }, // Future lesson
            { id: 2, date: new Date(today.getTime() - 86400000) }, // Past lesson
          ],
          user: { id: 1, name: 'Teacher 1' },
        },
        {
          id: 2,
          title: 'Unit Plan B',
          endDate: futureDate,
          lessonPlans: [
            { id: 3, date: new Date(today.getTime() - 86400000) }, // Past lesson only
          ],
          user: { id: 2, name: 'Teacher 2' },
        },
      ];

      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans as any);

      await runProgressCheck();

      expect(mockWarn).toHaveBeenCalledWith(
        'Progress check notification: Unit Plan "Unit Plan A" is ending soon with 1 upcoming lessons'
      );
      expect(mockWarn).toHaveBeenCalledTimes(1);
    });

    it('should warn about multiple upcoming lessons', async () => {
      const today = new Date();
      const futureDate1 = new Date(today.getTime() + 86400000); // Tomorrow
      const futureDate2 = new Date(today.getTime() + 172800000); // Day after tomorrow

      const mockUnitPlans = [
        {
          id: 1,
          title: 'Unit Plan with Multiple Lessons',
          endDate: futureDate2,
          lessonPlans: [
            { id: 1, date: futureDate1 },
            { id: 2, date: futureDate2 },
            { id: 3, date: new Date(today.getTime() - 86400000) }, // Past lesson
          ],
          user: { id: 1, name: 'Teacher 1' },
        },
      ];

      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans as any);

      await runProgressCheck();

      expect(mockWarn).toHaveBeenCalledWith(
        'Progress check notification: Unit Plan "Unit Plan with Multiple Lessons" is ending soon with 2 upcoming lessons'
      );
    });

    it('should not warn about unit plans with no upcoming lessons', async () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 86400000); // Yesterday

      const mockUnitPlans = [
        {
          id: 1,
          title: 'Completed Unit Plan',
          endDate: today,
          lessonPlans: [
            { id: 1, date: pastDate }, // Past lesson
          ],
          user: { id: 1, name: 'Teacher 1' },
        },
      ];

      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans as any);

      await runProgressCheck();

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should handle unit plans with no lesson plans', async () => {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 86400000);

      const mockUnitPlans = [
        {
          id: 1,
          title: 'Empty Unit Plan',
          endDate: futureDate,
          lessonPlans: [],
          user: { id: 1, name: 'Teacher 1' },
        },
      ];

      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans as any);

      await runProgressCheck();

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should handle empty result from database', async () => {
      mockPrisma.unitPlan.findMany.mockResolvedValue([]);

      await runProgressCheck();

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.unitPlan.findMany.mockRejectedValue(new Error('Database connection failed'));

      // Should not throw
      await expect(runProgressCheck()).rejects.toThrow('Database connection failed');
    });

    it('should correctly filter lessons by date boundary', async () => {
      const today = new Date();
      const todayMidnight = new Date(today);
      todayMidnight.setHours(0, 0, 0, 0);
      
      const todayEndOfDay = new Date(today);
      todayEndOfDay.setHours(23, 59, 59, 999);

      const mockUnitPlans = [
        {
          id: 1,
          title: 'Boundary Test Unit',
          endDate: new Date(today.getTime() + 86400000),
          lessonPlans: [
            { id: 1, date: new Date(today.getTime() - 1000) }, // Just before today
            { id: 2, date: today }, // Today (should not count as incomplete)
            { id: 3, date: new Date(today.getTime() + 1000) }, // Just after today
          ],
          user: { id: 1, name: 'Teacher 1' },
        },
      ];

      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans as any);

      await runProgressCheck();

      // Should count lessons in the future (after today)
      expect(mockWarn).toHaveBeenCalledWith(
        'Progress check notification: Unit Plan "Boundary Test Unit" is ending soon with 1 upcoming lessons'
      );
    });
  });
});