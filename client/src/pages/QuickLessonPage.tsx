
import { Zap, FileText, ArrowLeft, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { LessonPlanFormData } from '../components/forms/LessonPlanForm';
import { LessonPlanForm } from '../components/forms/LessonPlanForm';
import { OnboardingTooltip } from '../components/onboarding';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useCreateETFOLessonPlan } from '../hooks/useETFOPlanning';
import { useShowContextualHints } from '../hooks/useFeatureTutorial';
import { logger } from '../utils/logger';
export default function QuickLessonPage(): React.ReactElement {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLesson = useCreateETFOLessonPlan();
  const showHints = useShowContextualHints();

  const handleSubmit = (data: LessonPlanFormData): void => {
    void (async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Create standalone lesson without unit requirement
      const lessonData = {
        ...data,
        unitPlanId: null, // Allow null for standalone lessons
        isStandalone: true,
      };

      await createLesson.mutateAsync(
        lessonData as LessonPlanFormData & { unitPlanId: null; isStandalone: true },
      );

      toast.success('Quick lesson created successfully!');
      navigate('/planner/etfo-lessons');
    } catch (_error) {
      logger.error('Failed to create quick lesson:', _error);
      toast.error('Failed to create lesson. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    })();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button aria-label="Click button" onClick={() => {
 navigate('/planner'); 
}}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            {showHints ? (
              <OnboardingTooltip
                content="Perfect for Grade 1 French Immersion! Create bilingual lessons quickly with AI assistance."
                id="quick-lesson-title"
                position="right"
                title="Quick Lesson Planning"
              >
                <h1 className="text-3xl font-bold text-gray-900">Quick Lesson Planner</h1>
              </OnboardingTooltip>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">Quick Lesson Planner</h1>
            )}
            <p className="text-gray-600">
              Create a standalone lesson plan without requiring a unit plan
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-900 font-medium">Quick Lesson Mode</h3>
              <p className="text-blue-800 text-sm mt-1">
                Perfect for emergency planning, substitute teacher lessons, or one-off activities.
                You can optionally link this lesson to a unit plan later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick lesson benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">⚡ No Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create lessons without needing long-range or unit plans
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🎯 ETFO Aligned</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Still follows three-part lesson structure and curriculum expectations
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🔗 Link Later</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Optionally connect to unit plans when you create them</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Lesson form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Quick Lesson Plan
          </CardTitle>
          <CardDescription>
            Fill out the essential details. Optional fields can be completed later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LessonPlanForm
            initialData={{
              title: '',
              date: new Date().toISOString().split('T')[0],
              duration: 60,
              materials: [''],
              accommodations: [''],
              modifications: [''],
              extensions: [''],
              assessmentType: 'formative',
              isSubFriendly: false,
              expectationIds: [],
            }}
            isSubmitting={isSubmitting}
            onCancel={() => {
 navigate('/planner'); 
}}
            onSubmit={handleSubmit}
            showUnitPlanSelector={false} // Hide unit plan requirement
          />
        </CardContent>
      </Card>
    </div>
  );
}
