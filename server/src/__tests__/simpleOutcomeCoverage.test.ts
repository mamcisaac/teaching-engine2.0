import { getOutcomeCoverage, getCoverageSummary } from '../utils/outcomeCoverageSimple';

describe('Simple Outcome Coverage', () => {
  describe('getOutcomeCoverage', () => {
    it('should return uncovered status for outcome with no activities', async () => {
      console.log('Running simple getOutcomeCoverage test');

      const coverage = await getOutcomeCoverage('TEST-1');

      expect(coverage).toEqual({
        outcomeId: 'TEST-1',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });
    });
  });

  describe('getCoverageSummary', () => {
    it('should return correct summary for coverage data', () => {
      console.log('Running simple getCoverageSummary test');

      const coverage = [
        { outcomeId: '1', status: 'covered' as const, linked: 1, completed: 1 },
        { outcomeId: '2', status: 'uncovered' as const, linked: 0, completed: 0 },
        { outcomeId: '3', status: 'partial' as const, linked: 1, completed: 0 },
      ];

      const summary = getCoverageSummary(coverage);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });
  });
});
