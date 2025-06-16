import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Mock the prisma client first
const mockQueryRaw = jest.fn();

// Mock the module before any imports
jest.unstable_mockModule('../prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

describe('getOutcomeCoverage', () => {
  const outcomeId = 'test-outcome-1';
  let getOutcomeCoverage: (outcomeId: string) => Promise<{
    isCovered: boolean;
    linked: number;
    completed: number;
    activities: unknown[];
  }>;

  beforeAll(async () => {
    // Import after mocking
    const module = await import('../utils/outcomeCoverage');
    getOutcomeCoverage = module.getOutcomeCoverage;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    mockQueryRaw.mockImplementation(() => Promise.resolve([]));
  });

  it('should return uncovered status when no activities exist', async () => {
    mockQueryRaw.mockImplementation(() => Promise.resolve([]));

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'uncovered',
      linked: 0,
      completed: 0,
    });
  });

  it('should return covered status when all activities are completed', async () => {
    mockQueryRaw.mockImplementation(() =>
      Promise.resolve([
        { id: 1, completedAt: new Date() },
        { id: 2, completedAt: new Date() },
      ]),
    );

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'covered',
      linked: 2,
      completed: 2,
    });
  });

  it('should return partial status when some activities are completed', async () => {
    mockQueryRaw.mockImplementation(() =>
      Promise.resolve([
        { id: 1, completedAt: new Date() },
        { id: 2, completedAt: null },
      ]),
    );

    const result = await getOutcomeCoverage(outcomeId);

    expect(result).toEqual({
      outcomeId,
      status: 'partial',
      linked: 2,
      completed: 1,
    });
  });

  it('should handle database errors gracefully', async () => {
    mockQueryRaw.mockImplementation(() => Promise.reject(new Error('Database error')));

    await expect(getOutcomeCoverage(outcomeId)).rejects.toThrow(
      'Failed to get coverage for outcome: Database error',
    );
  });
});
