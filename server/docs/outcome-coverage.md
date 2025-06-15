# Outcome Coverage System

This document describes the Outcome Coverage System used in the Teaching Engine 2.0 backend.

## Overview

The Outcome Coverage System tracks how well learning outcomes are being covered by activities in the system. It provides:

1. **Per-outcome coverage status** (covered, partial, or uncovered)
2. **Summary statistics** for a set of outcomes
3. **Integration** with the existing activity and outcome models

## API Reference

### Types

```typescript
type CoverageStatus = 'covered' | 'partial' | 'uncovered';

interface OutcomeCoverage {
  outcomeId: string;
  status: CoverageStatus;
  linked: number; // Number of activities linked to this outcome
  completed: number; // Number of completed activities
}

interface CoverageSummary {
  total: number; // Total number of outcomes
  covered: number; // Number of fully covered outcomes
  partial: number; // Number of partially covered outcomes
  uncovered: number; // Number of uncovered outcomes
}
```

### Functions

#### `getOutcomeCoverage(outcomeId: string): Promise<OutcomeCoverage>`

Gets the coverage status for a specific outcome.

**Parameters:**

- `outcomeId`: The ID of the outcome to check

**Returns:**
A promise that resolves to an `OutcomeCoverage` object

**Example:**

```typescript
const coverage = await getOutcomeCoverage('outcome-123');
// { outcomeId: 'outcome-123', status: 'covered', linked: 2, completed: 2 }
```

#### `getCoverageSummary(coverage: OutcomeCoverage[]): CoverageSummary`

Generates a summary of coverage for multiple outcomes.

**Parameters:**

- `coverage`: An array of `OutcomeCoverage` objects

**Returns:**
A `CoverageSummary` object with counts of each status type

**Example:**

```typescript
const summary = getCoverageSummary([
  { outcomeId: '1', status: 'covered', linked: 2, completed: 2 },
  { outcomeId: '2', status: 'partial', linked: 1, completed: 0 },
]);
// { total: 2, covered: 1, partial: 1, uncovered: 0 }
```

## Testing

### Unit Tests

Run the unit tests with:

```bash
npm test
```

### Test Coverage

To generate a coverage report:

```bash
npm test -- --coverage
```

## Error Handling

- Database errors are caught and re-thrown with descriptive messages
- Invalid input to `getCoverageSummary` is handled gracefully with warnings
- The system is designed to be resilient to missing or malformed data

## Performance Considerations

- Database queries are optimized to only fetch necessary fields
- The coverage calculation is done in-memory for performance
- Large result sets are handled efficiently with streaming where possible
