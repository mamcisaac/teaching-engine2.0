import React, { Suspense, lazy } from 'react';

// Lazy load AI components for better performance
const AILessonPlanPanel = lazy(() =>
  import('../../../../components/ai/AILessonPlanPanel').then((m) => ({ default: m.AILessonPlanPanel })),
);
const WithAIErrorBoundary = lazy(() =>
  import('../../../../components/ai/AIErrorBoundary').then((m) => ({ default: m.WithAIErrorBoundary })),
);

interface AIAssistantTabProps {
  formData: any;
  unitPlan?: any;
  onLessonGenerated: (lessonPlan: any) => void;
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
                    title: unitPlan.title,
                    bigIdeas: (unitPlan.bigIdeas !== null && unitPlan.bigIdeas !== undefined && unitPlan.bigIdeas !== '') ? [unitPlan.bigIdeas] : [],
                    expectations:
                      unitPlan.expectations && unitPlan.expectations.length > 0 ? unitPlan.expectations.map((exp: any) => ({
                        id: exp.expectation.id ?? '',
                        code: exp.expectation.code ?? '',
                        description: exp.expectation.description ?? '',
                      })).filter((exp: any) => exp.id !== '') : [],
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