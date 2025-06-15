import { getOutcomeCoverage } from '../utils/outcomeCoverage';

// Mock the prisma client
const mockQueryRaw = jest.fn();

jest.mock('../prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

describe('getOutcomeCoverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return uncovered status for outcome with no activities', async () => {
    console.log('Starting simplified test');

    // Mock the database query to return no activities
    mockQueryRaw.mockImplementation(() => {
      console.log('Mock query called');
      return Promise.resolve([]);
    });

    const coverage = await getOutcomeCoverage('TEST-1');

    console.log('Test completed');

    expect(coverage).toEqual({
      outcomeId: 'TEST-1',
      status: 'uncovered',
      linked: 0,
      completed: 0,
    });
  });
});
