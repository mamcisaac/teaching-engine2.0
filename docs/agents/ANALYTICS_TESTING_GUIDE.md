# Analytics Testing Guide

This guide provides comprehensive information for testing the analytics features implemented by Agent-Insight.

## Overview

The analytics system uses a multi-layered testing approach:

- Unit tests for individual analytics calculations
- Integration tests for API endpoints
- Component tests for React visualizations
- Performance benchmarks for load time requirements
- Accessibility tests for WCAG 2.1 compliance

## Test Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Setup test environment
pnpm --filter client test:setup
pnpm --filter server test:setup
```

### Environment Configuration

The test environment includes:

- Mock canvas for Chart.js rendering
- Mock PDFKit for export testing
- Mock data services for database-independent testing
- Vitest for fast test execution

## Running Tests

### All Analytics Tests

```bash
# Run all analytics tests
pnpm test -- analytics

# Run with coverage
pnpm test:coverage -- analytics
```

### Specific Test Suites

```bash
# Backend analytics tests
pnpm --filter server test src/services/analytics
pnpm --filter server test src/routes/__tests__/analytics.integration.test.ts

# Frontend component tests
pnpm --filter client test src/components/analytics

# Performance benchmarks
pnpm test:performance -- analytics

# Accessibility tests
pnpm test:a11y -- analytics
```

## Test Structure

### Backend Tests

#### Service Tests

Located in `server/src/services/analytics/__tests__/`

- `analyticsCache.test.ts` - TTL-based caching with smart invalidation
- `curriculumAnalytics.test.ts` - Curriculum coverage calculations
- `domainAnalytics.test.ts` - Domain strength analysis
- `themeAnalytics.test.ts` - Theme usage patterns
- `vocabularyAnalytics.test.ts` - Vocabulary growth tracking
- `exportService.test.ts` - Multi-format export functionality

#### Integration Tests

Located in `server/src/routes/__tests__/`

- `analytics.integration.test.ts` - API endpoint testing with mock data

### Frontend Tests

#### Component Tests

Located in `client/src/components/analytics/__tests__/`

- `CurriculumHeatmap.test.tsx` - Heatmap visualization
- `DomainRadarChart.test.tsx` - Radar chart rendering
- `ThemeAnalyticsDashboard.test.tsx` - Theme analytics UI
- `VocabularyGrowthChart.test.tsx` - Growth chart display
- `AnalyticsWidget.test.tsx` - Widget integration system

#### Performance Tests

Located in `client/src/components/analytics/__tests__/performance/`

- Load time benchmarks (<2 second requirement)
- Re-render optimization tests
- Data fetching performance

#### Accessibility Tests

Located in `client/src/components/analytics/__tests__/a11y/`

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

## Mock Data

### Using Mock Services

The analytics system uses mock data services for testing:

```typescript
import { mockDataService } from '@/services/mockDataService';

// Generate test data
const testStudent = mockDataService.generateStudent();
const testOutcomes = mockDataService.generateCurriculumOutcomes(20);
```

### Mock Data Structure

```typescript
// Theme analytics mock
const mockThemeData = {
  totalThemes: 12,
  activeThemes: 8,
  averageUsagePerTheme: 15.5,
  mostUsedThemes: [...],
  themeBalance: {
    balanced: true,
    recommendation: 'Well balanced',
    distribution: {...}
  },
  crossSubjectConnections: [...]
};
```

## Common Testing Patterns

### Testing Async Data Loading

```typescript
it('should load analytics data', async () => {
  renderWithQueryClient(<AnalyticsComponent />);

  // Check loading state
  expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });
});
```

### Testing Chart Components

```typescript
it('should render chart with data', async () => {
  const { container } = render(<ChartComponent data={mockData} />);

  // Check canvas rendering
  const canvas = container.querySelector('canvas');
  expect(canvas).toBeInTheDocument();

  // Verify chart instance
  expect(Chart).toHaveBeenCalledWith(
    expect.any(Object),
    expect.objectContaining({
      type: 'radar',
      data: expect.any(Object)
    })
  );
});
```

### Testing Export Functionality

```typescript
it('should export data in requested format', async () => {
  const exportSpy = vi.spyOn(exportService, 'exportData');

  // Trigger export
  fireEvent.click(screen.getByText('Export PDF'));

  await waitFor(() => {
    expect(exportSpy).toHaveBeenCalledWith({
      type: 'curriculum-heatmap',
      format: 'pdf',
      data: expect.any(Object),
    });
  });
});
```

## Troubleshooting

### Canvas Rendering Issues

If you see "HTMLCanvasElement.prototype.getContext not implemented":

1. Ensure `setupTests.ts` is loaded in vite config
2. Check that canvas mocks are properly initialized
3. Use `@vitest/environment-jsdom` for browser APIs

### Async Test Timeouts

For slow-loading components:

```typescript
await waitFor(
  () => {
    expect(element).toBeInTheDocument();
  },
  { timeout: 5000 },
); // Increase timeout
```

### Mock Data Synchronization

Ensure mock data matches component expectations:

- Check TypeScript interfaces
- Verify required fields are present
- Match date formats and types

### Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Reset any global state
});
```

## Performance Testing

### Benchmarking Load Times

```typescript
describe('Performance', () => {
  it('should load within 2 seconds', async () => {
    const start = performance.now();

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-loaded')).toBeInTheDocument();
    });

    const loadTime = performance.now() - start;
    expect(loadTime).toBeLessThan(2000);
  });
});
```

### Memory Usage

Monitor component memory usage:

```typescript
it('should not leak memory on unmount', () => {
  const { unmount } = render(<HeavyComponent />);

  // Take heap snapshot
  const beforeHeap = performance.memory.usedJSHeapSize;

  unmount();

  // Force GC if available
  if (global.gc) global.gc();

  const afterHeap = performance.memory.usedJSHeapSize;
  expect(afterHeap).toBeLessThanOrEqual(beforeHeap);
});
```

## Accessibility Testing

### Using axe-core

```typescript
import { axe } from 'jest-axe';

it('should be accessible', async () => {
  const { container } = render(<AnalyticsComponent />);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation

```typescript
it('should be keyboard navigable', () => {
  render(<InteractiveChart />);

  const firstButton = screen.getByRole('button', { name: /export/i });
  firstButton.focus();

  // Tab to next element
  userEvent.tab();

  expect(screen.getByRole('button', { name: /settings/i })).toHaveFocus();
});
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Analytics Tests
  run: |
    pnpm test:ci -- analytics
    pnpm test:coverage -- analytics --reporter=json

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/analytics-coverage.json
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
pnpm test -- analytics --changed
```

## Best Practices

1. **Test Data Realism**: Use realistic mock data that represents actual usage
2. **Error Scenarios**: Test loading, error, and empty states
3. **User Interactions**: Test all interactive elements
4. **Performance Budgets**: Set and test performance thresholds
5. **Accessibility First**: Include a11y tests from the start
6. **Visual Regression**: Consider snapshot tests for charts
7. **Integration Coverage**: Test API integration thoroughly
8. **Mock Wisely**: Mock external dependencies, not business logic

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest-axe for Accessibility](https://github.com/nickcolley/jest-axe)
- [Chart.js Testing Guide](https://www.chartjs.org/docs/latest/developers/testing.html)

---

_Last updated: January 2024_
_Maintained by: Agent-Insight_
