import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { prisma } from '../../dist/prisma.js';
import { getOutcomeCoverage } from '../../dist/utils/outcomeCoverage.js';

// Mock the prisma client
jest.mock('../prisma.js', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

const mockQueryRaw = prisma.$queryRaw as jest.Mock;

describe('getOutcomeCoverage', () => {
  const outcomeId = 'test-outcome-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return uncovered status when no activities exist', async () => {
    mockQueryRaw.mockResolvedValueOnce([]);

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'uncovered',
      linked: 0,
      completed: 0,
    });
  });

  it('should return covered status when all activities are completed', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      { id: 1, completedAt: new Date() },
      { id: 2, completedAt: new Date() },
    ]);

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'covered',
      linked: 2,
      completed: 2,
    });
  });

  it('should return partial status when some activities are completed', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      { id: 1, completedAt: new Date() },
      { id: 2, completedAt: null },
    ]);

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'partial',
      linked: 2,
      completed: 1,
    });
  });

  it('should handle database errors gracefully', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('Database error'));

    await expect(getOutcomeCoverage(outcomeId)).rejects.toThrow(
      'Failed to get coverage for outcome: Database error',
    );
  });
});
