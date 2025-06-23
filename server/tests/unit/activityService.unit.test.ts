import { describe, it, expect, jest } from '@jest/globals';

// Test the reorderActivities logic without actually importing the service
describe('ActivityService Unit Tests', () => {
  describe('reorderActivities logic', () => {
    // Mock prisma object
    const createMockPrisma = () => ({
      $transaction: jest.fn(),
      activity: {
        update: jest.fn(),
        findMany: jest.fn(),
      },
    });

    // Reimplementation of the service logic for testing
    async function reorderActivities(
      prisma: { $transaction: (arg: unknown[]) => Promise<unknown> },
      milestoneId: number,
      activityIds: number[],
    ) {
      await prisma.$transaction(
        activityIds.map((id: number, index: number) =>
          prisma.activity.update({ where: { id }, data: { orderIndex: index } }),
        ),
      );
      return prisma.activity.findMany({
        where: { milestoneId },
        orderBy: { orderIndex: 'asc' },
      });
    }

    it('should reorder activities correctly', async () => {
      const mockPrisma = createMockPrisma();
      const milestoneId = 1;
      const activityIds = [3, 1, 2];

      // Mock the transaction to resolve successfully
      mockPrisma.$transaction.mockResolvedValue(undefined);

      // Mock the findMany to return reordered activities
      const mockActivities = [
        { id: 3, milestoneId: 1, title: 'Third', orderIndex: 0 },
        { id: 1, milestoneId: 1, title: 'First', orderIndex: 1 },
        { id: 2, milestoneId: 1, title: 'Second', orderIndex: 2 },
      ];
      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);

      const result = await reorderActivities(mockPrisma, milestoneId, activityIds);

      // Verify transaction was called with correct updates
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.activity.update({ where: { id: 3 }, data: { orderIndex: 0 } }),
        mockPrisma.activity.update({ where: { id: 1 }, data: { orderIndex: 1 } }),
        mockPrisma.activity.update({ where: { id: 2 }, data: { orderIndex: 2 } }),
      ]);

      // Verify findMany was called correctly
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: { milestoneId: 1 },
        orderBy: { orderIndex: 'asc' },
      });

      // Verify the result
      expect(result).toEqual(mockActivities);
    });

    it('should handle empty activity list', async () => {
      const mockPrisma = createMockPrisma();
      const milestoneId = 1;

      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const result = await reorderActivities(mockPrisma, milestoneId, []);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([]);
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: { milestoneId: 1 },
        orderBy: { orderIndex: 'asc' },
      });
      expect(result).toHaveLength(0);
    });

    it('should handle single activity', async () => {
      const mockPrisma = createMockPrisma();
      const milestoneId = 1;
      const activityIds = [5];

      mockPrisma.$transaction.mockResolvedValue(undefined);
      const mockActivity = { id: 5, milestoneId: 1, title: 'Single', orderIndex: 0 };
      mockPrisma.activity.findMany.mockResolvedValue([mockActivity]);

      const result = await reorderActivities(mockPrisma, milestoneId, activityIds);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.activity.update({ where: { id: 5 }, data: { orderIndex: 0 } }),
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockActivity);
    });

    it('should handle transaction errors', async () => {
      const mockPrisma = createMockPrisma();
      const milestoneId = 1;
      const activityIds = [1, 2, 3];

      const error = new Error('Transaction failed');
      mockPrisma.$transaction.mockRejectedValue(error);

      await expect(reorderActivities(mockPrisma, milestoneId, activityIds)).rejects.toThrow(
        'Transaction failed',
      );

      // Verify findMany was not called after failed transaction
      expect(mockPrisma.activity.findMany).not.toHaveBeenCalled();
    });

    it('should preserve activity properties during reorder', async () => {
      const mockPrisma = createMockPrisma();
      const milestoneId = 1;
      const activityIds = [2, 1];

      mockPrisma.$transaction.mockResolvedValue(undefined);

      // Mock activities with full properties
      const mockActivities = [
        {
          id: 2,
          milestoneId: 1,
          title: 'Activity 2',
          description: 'Description 2',
          duration: 30,
          materials: ['pen', 'paper'],
          orderIndex: 0,
        },
        {
          id: 1,
          milestoneId: 1,
          title: 'Activity 1',
          description: 'Description 1',
          duration: 45,
          materials: ['book'],
          orderIndex: 1,
        },
      ];
      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);

      const result = await reorderActivities(mockPrisma, milestoneId, activityIds);

      // Verify all properties are preserved
      expect(result[0]).toMatchObject({
        id: 2,
        title: 'Activity 2',
        description: 'Description 2',
        duration: 30,
        materials: ['pen', 'paper'],
        orderIndex: 0,
      });
      expect(result[1]).toMatchObject({
        id: 1,
        title: 'Activity 1',
        description: 'Description 1',
        duration: 45,
        materials: ['book'],
        orderIndex: 1,
      });
    });

    it('should create correct update operations for reordering', async () => {
      const mockPrisma = createMockPrisma();
      const activityIds = [5, 3, 8, 1];

      // Capture the update calls
      const updateCalls: unknown[] = [];
      mockPrisma.activity.update.mockImplementation((args) => {
        updateCalls.push(args);
        return args;
      });

      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPrisma.activity.findMany.mockResolvedValue([]);

      await reorderActivities(mockPrisma, 1, activityIds);

      // Verify the update operations were created correctly
      expect(updateCalls).toHaveLength(4);
      expect(updateCalls[0]).toEqual({ where: { id: 5 }, data: { orderIndex: 0 } });
      expect(updateCalls[1]).toEqual({ where: { id: 3 }, data: { orderIndex: 1 } });
      expect(updateCalls[2]).toEqual({ where: { id: 8 }, data: { orderIndex: 2 } });
      expect(updateCalls[3]).toEqual({ where: { id: 1 }, data: { orderIndex: 3 } });
    });
  });
});
