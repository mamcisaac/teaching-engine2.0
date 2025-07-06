import { lazy, Suspense } from 'react';

// Lazy load the optimized OnboardingFlow to reduce bundle size
const OnboardingFlowOptimized = lazy(() => 
  import('./OnboardingFlowOptimized').then(module => ({
    default: module.OnboardingFlowOptimized
  }))
);

// Loading fallback for lazy loading
const OnboardingLoadingFallback = () => (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

// Export the lazy-loaded component
export function OnboardingFlow() {
  return (
    <Suspense fallback={<OnboardingLoadingFallback />}>
      <OnboardingFlowOptimized />
    </Suspense>
  );
}
