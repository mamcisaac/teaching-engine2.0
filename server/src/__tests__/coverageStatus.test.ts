type CoverageStatus = 'covered' | 'uncovered' | 'partial';

interface Activity {
  id: number;
  completedAt: Date | null;
}

interface OutcomeCoverage {
  outcomeId: string;
  status: CoverageStatus;
  linked: number;
  completed: number;
}

/**
 * Determines the coverage status based on activities
 */
function determineCoverageStatus(activities: Activity[]): OutcomeCoverage {
  const total = activities.length;
  const completed = activities.filter((a) => a.completedAt !== null).length;

  let status: CoverageStatus = 'uncovered';

  if (total === 0) {
    return {
      outcomeId: 'test',
      status: 'uncovered',
      linked: 0,
      completed: 0,
    };
  }

  if (completed === total) {
    status = 'covered';
  } else if (completed > 0) {
    status = 'partial';
  }

  return {
    outcomeId: 'test',
    status,
    linked: total,
    completed,
  };
}

describe('Coverage Status Calculation', () => {
  it('should return uncovered for no activities', () => {
    const result = determineCoverageStatus([]);
    expect(result).toEqual({
      outcomeId: 'test',
      status: 'uncovered',
      linked: 0,
      completed: 0,
    });
  });

  it('should return covered when all activities are completed', () => {
    const now = new Date();
    const activities = [
      { id: 1, completedAt: now },
      { id: 2, completedAt: now },
    ];

    const result = determineCoverageStatus(activities);
    expect(result).toEqual({
      outcomeId: 'test',
      status: 'covered',
      linked: 2,
      completed: 2,
    });
  });

  it('should return partial when some activities are completed', () => {
    const now = new Date();
    const activities = [
      { id: 1, completedAt: now },
      { id: 2, completedAt: null },
    ];

    const result = determineCoverageStatus(activities);
    expect(result).toEqual({
      outcomeId: 'test',
      status: 'partial',
      linked: 2,
      completed: 1,
    });
  });

  it('should return uncovered when no activities are completed', () => {
    const activities = [
      { id: 1, completedAt: null },
      { id: 2, completedAt: null },
    ];

    const result = determineCoverageStatus(activities);
    expect(result).toEqual({
      outcomeId: 'test',
      status: 'uncovered',
      linked: 2,
      completed: 0,
    });
  });
});
