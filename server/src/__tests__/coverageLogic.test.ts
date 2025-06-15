// A simple test that doesn't depend on any external modules
function calculateCoverage(covered: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((covered / total) * 100);
}

describe('Coverage Logic', () => {
  it('should calculate 0% coverage for empty set', () => {
    expect(calculateCoverage(0, 0)).toBe(0);
  });

  it('should calculate 50% coverage', () => {
    expect(calculateCoverage(1, 2)).toBe(50);
  });

  it('should calculate 100% coverage', () => {
    expect(calculateCoverage(2, 2)).toBe(100);
  });

  it('should round to nearest integer', () => {
    expect(calculateCoverage(1, 3)).toBe(33);
    expect(calculateCoverage(2, 3)).toBe(67);
  });
});
