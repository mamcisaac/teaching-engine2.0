import React, { Suspense, lazy } from 'react';

import type { ETFOLessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';

// Lazy load AI components for better performance
const AILessonPlanPanel = lazy(() =>
  import('../../../../components/ai/AILessonPlanPanel').then((m) => ({ default: m.AILessonPlanPanel })),
);
const WithAIErrorBoundary = lazy(() =>
  import('../../../../components/ai/AIErrorBoundary').then((m) => ({ default: m.WithAIErrorBoundary })),
);

interface ThreePartStructure {
  mindsOn: {
    activities: string[];
    duration: number;
    materials: string[];
  };
  handsOn: {
    activities: string[];
    duration: number;
    materials: string[];
  };
  mindsOnReflection: {
    activities: string[];
    duration: number;
    materials: string[];
  };
}

interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
}

interface UnitPlanExpectation {
  expectation: CurriculumExpectation;
}

interface UnitPlanWithExpectations {
  title?: string;
  bigIdeas?: string;
  longRangePlan?: {
    grade: number;
    subject: string;
  };
  expectations?: UnitPlanExpectation[];
}

interface AIAssistantTabProps {
  formData: ETFOLessonPlanFormData;
  unitPlan?: UnitPlanWithExpectations;
  onLessonGenerated: (lessonPlan: ThreePartStructure) => void;
  onSuggestionAccepted: (type: string, content: string[]) => void;
}

export function AIAssistantTab({
  formData,
  unitPlan,
  onLessonGenerated,
  onSuggestionAccepted,
}: AIAssistantTabProps): React.ReactElement {
  return (
    <div className="space-y-6 mt-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2 text-gray-600">Loading AI Assistant...</span>
          </div>
        }
      >
        <WithAIErrorBoundary>
          <AILessonPlanPanel
            className="w-full"
            duration={formData.duration}
            grade={unitPlan?.longRangePlan?.grade ?? 1}
            learningGoals={formData.learningGoals !== '' ? [formData.learningGoals] : []}
            lessonTitle={formData.title}
            subject={unitPlan?.longRangePlan?.subject ?? ''}
            unitContext={
              unitPlan
                ? {
                    title: unitPlan.title ?? '',
                    bigIdeas: (unitPlan.bigIdeas !== null && unitPlan.bigIdeas !== undefined && unitPlan.bigIdeas !== '') ? [unitPlan.bigIdeas] : [],
                    expectations:
                      unitPlan.expectations && unitPlan.expectations.length > 0 ? unitPlan.expectations.map((exp: UnitPlanExpectation) => ({
                        id: exp.expectation.id ?? '',
                        code: exp.expectation.code ?? '',
                        description: exp.expectation.description ?? '',
                      })).filter((exp: { id: string; code: string; description: string }) => exp.id !== '') : [],
                  }
                : undefined
            }
            onLessonGenerated={onLessonGenerated}
            onSuggestionAccepted={onSuggestionAccepted}
          />
        </WithAIErrorBoundary>
      </Suspense>
    </div>
  );
}