import { lazy, Suspense } from 'react';

// Lazy load chart components to reduce initial bundle size
const CurriculumExpectationCoverage = lazy(() => import('../CurriculumExpectationCoverage'));

// Loading fallback for charts
const ChartLoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    <div className="h-64 bg-gray-200 rounded" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  </div>
);

// Wrapped component with suspense
export const LazyCurriculumExpectationCoverage = () => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <CurriculumExpectationCoverage />
  </Suspense>
);

export default {
  CurriculumExpectationCoverage: LazyCurriculumExpectationCoverage,
};