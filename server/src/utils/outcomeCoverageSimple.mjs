/**
 * Simplified version of getOutcomeCoverage for testing
 */
export async function getOutcomeCoverage(outcomeId) {
  console.log('getOutcomeCoverage called with:', outcomeId);
  
  // Simulate database call
  const activities = [];
  
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.completedAt !== null).length;

  let status = 'uncovered';
  if (totalActivities > 0) {
    status = completedActivities > 0 ? 'covered' : 'partial';
  }

  return {
    outcomeId,
    status,
    linked: totalActivities,
    completed: completedActivities
  };
}

/**
 * Simplified version of getCoverageSummary for testing
 */
export function getCoverageSummary(coverage) {
  console.log('getCoverageSummary called with:', coverage);
  
  const total = coverage.length;
  const covered = coverage.filter(c => c.status === 'covered').length;
  const partial = coverage.filter(c => c.status === 'partial').length;
  const uncovered = coverage.filter(c => c.status === 'uncovered').length;
  
  return { total, covered, partial, uncovered };
}
