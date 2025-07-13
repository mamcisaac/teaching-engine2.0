/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { ComponentType } from 'react';
import { lazy, Suspense } from 'react';

// Lazy load heavy AI components
const AILessonPlanPanel = lazy(() => import('../ai/AILessonPlanPanel').then(module => ({ default: module.AILessonPlanPanel })));
const AIUnitPlanPanel = lazy(() => import('../ai/AIUnitPlanPanel').then(module => ({ default: module.AIUnitPlanPanel })));
const AIWeeklyPlanModal = lazy(() => import('../ai/AIWeeklyPlanModal').then(module => ({ default: module.AIWeeklyPlanModal })));
const GPTPlanningAgent = lazy(() => import('../ai/GPTPlanningAgent').then(module => ({ default: module.GPTPlanningAgent })));

// Lazy load chart components
const CurriculumExpectationCoverage = lazy(() => import('../CurriculumExpectationCoverage'));

// Lazy load form wizards
const CurriculumSetupWizard = lazy(() => import('../forms/CurriculumSetupWizard'));
const PlanningWizard = lazy(() => import('../planning/PlanningWizard').then(module => ({ default: module.PlanningWizard })));

// Lazy load complex modals
const TemplatePreviewModal = lazy(() => import('../templates/TemplatePreviewModal'));
const TemplateApplyModal = lazy(() => import('../templates/TemplateApplyModal'));

// Common loading fallbacks
const AILoadingFallback = (): React.ReactElement => (
  <div className="animate-pulse p-6 space-y-4">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-200 rounded" />
      <div className="h-6 bg-gray-200 rounded w-32" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-20 bg-gray-200 rounded" />
    <div className="flex gap-2">
      <div className="h-10 bg-blue-200 rounded w-24" />
      <div className="h-10 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

const ChartLoadingFallback = (): React.ReactElement => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    <div className="h-64 bg-gray-200 rounded" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  </div>
);

const FormLoadingFallback = (): React.ReactElement => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-gray-200 rounded w-1/4" />
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-10 bg-blue-200 rounded w-24" />
      <div className="h-10 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

const ModalLoadingFallback = (): React.ReactElement => (
  <div className="animate-pulse p-6 space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/2" />
    <div className="h-32 bg-gray-200 rounded" />
    <div className="flex justify-end gap-2">
      <div className="h-10 bg-gray-200 rounded w-20" />
      <div className="h-10 bg-blue-200 rounded w-20" />
    </div>
  </div>
);

// Higher-order component for creating lazy wrapped components
function createLazyComponent<T = any>(
  LazyComponent: ComponentType<T>, 
  fallback: ComponentType = (): React.ReactElement => <div>Loading...</div>
): ComponentType<T> {
  return function LazyWrapper(props: T) {
    const FallbackComponent = fallback;
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props as any} />
      </Suspense>
    );
  };
}

// Export lazy-wrapped components
export const LazyAILessonPlanPanel = createLazyComponent(AILessonPlanPanel, AILoadingFallback);
export const LazyAIUnitPlanPanel = createLazyComponent(AIUnitPlanPanel, AILoadingFallback);
export const LazyAIWeeklyPlanModal = createLazyComponent(AIWeeklyPlanModal, ModalLoadingFallback);
export const LazyGPTPlanningAgent = createLazyComponent(GPTPlanningAgent, AILoadingFallback);

export const LazyCurriculumExpectationCoverage = createLazyComponent(CurriculumExpectationCoverage, ChartLoadingFallback);

export const LazyCurriculumSetupWizard = createLazyComponent(CurriculumSetupWizard, FormLoadingFallback);
export const LazyPlanningWizard = createLazyComponent(PlanningWizard, FormLoadingFallback);

export const LazyTemplatePreviewModal = createLazyComponent(TemplatePreviewModal, ModalLoadingFallback);
export const LazyTemplateApplyModal = createLazyComponent(TemplateApplyModal, ModalLoadingFallback);

// Default export with all lazy components
export default {
  // AI Components
  AILessonPlanPanel: LazyAILessonPlanPanel,
  AIUnitPlanPanel: LazyAIUnitPlanPanel,
  AIWeeklyPlanModal: LazyAIWeeklyPlanModal,
  GPTPlanningAgent: LazyGPTPlanningAgent,
  
  // Chart Components
  CurriculumExpectationCoverage: LazyCurriculumExpectationCoverage,
  
  // Form Components
  CurriculumSetupWizard: LazyCurriculumSetupWizard,
  PlanningWizard: LazyPlanningWizard,
  
  // Modal Components
  TemplatePreviewModal: LazyTemplatePreviewModal,
  TemplateApplyModal: LazyTemplateApplyModal,
};