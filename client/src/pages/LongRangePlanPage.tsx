
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { apiClient } from '../api/core/client';
import { Dialog } from '../components/Dialog';
import { AISuggestionPanel } from '../components/planning/AISuggestionPanel';
import { BlankTemplateQuickActions } from '../components/printing/BlankTemplatePrinter';
import { Button } from '../components/ui/Button';
import { useAIPlanningAssistant } from '../hooks/useAIPlanningAssistant';
import type { AISuggestion } from '../hooks/useAIPlanningAssistant';

interface LongRangePlan {
  id: string;
  title: string;
  titleFr?: string;
  academicYear: string;
  term?: string;
  grade: number;
  subject: string;
  description?: string;
  goals?: string;
  themes?: string[];
  // ETFO-aligned fields
  overarchingQuestions?: string;
  assessmentOverview?: string;
  resourceNeeds?: string;
  professionalGoals?: string;
  _count: {
    unitPlans: number;
    expectations: number;
  };
}

// API Response interfaces
interface _LongRangePlansResponse {
  plans: LongRangePlan[];
}

interface CreateLongRangePlanResponse {
  id: string;
  title: string;
  academicYear: string;
}

// Type guards
function isLongRangePlansArray(data: unknown): data is LongRangePlan[] {
  return Array.isArray(data) && (data.length === 0 || (typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]));
}

function isCreateLongRangePlanResponse(data: unknown): data is CreateLongRangePlanResponse {
  return typeof data === 'object' && data !== null && 'id' in data && 'title' in data;
}

export function LongRangePlanPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // If after June, show next academic year, else current
    return currentMonth >= 6
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;
  });
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiGoalSuggestions, setAiGoalSuggestions] = useState<AISuggestion | null>(null);

  const { generateLongRangeGoals, isGenerating } = useAIPlanningAssistant();

  // Fetch long-range plans
  const { data: plans = [], isLoading } = useQuery<LongRangePlan[]>({
    queryKey: ['long-range-plans', selectedYear],
    queryFn: async (): Promise<LongRangePlan[]> => {
      const response = await apiClient.get<LongRangePlan[]>(`/api/long-range-plans?academicYear=${selectedYear}`);
      if (!isLongRangePlansArray(response.data)) {
        throw new Error('Invalid long range plans response format');
      }
      return response.data;
    },
  });

  // Create mutation
  const createPlan = useMutation<CreateLongRangePlanResponse, Error, Partial<LongRangePlan>>({
    mutationFn: async (data: Partial<LongRangePlan>): Promise<CreateLongRangePlanResponse> => {
      const response = await apiClient.post<CreateLongRangePlanResponse>('/api/long-range-plans', data);
      if (!isCreateLongRangePlanResponse(response.data)) {
        throw new Error('Invalid create plan response format');
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
      setIsCreateModalOpen(false);
    },
  });

  // Form state with ETFO-aligned fields
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: 1,
    term: 'Full Year',
    description: '',
    goals: '',
    themes: [] as string[],
    // Additional ETFO fields
    overarchingQuestions: '',
    assessmentOverview: '',
    resourceNeeds: '',
    professionalGoals: '',
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    createPlan.mutate({
      ...formData,
      academicYear: selectedYear,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Long-Range Planning</h1>
        <p className="mt-2 text-gray-600">
          Plan your academic year with ETFO-aligned curriculum organization
        </p>
      </div>

      {/* Year Selector and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700" htmlFor="year-select">
            Academic Year:
          </label>
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            id="year-select"
            onChange={(e) => {
 setSelectedYear(e.target.value); 
}}
            value={selectedYear}
          >
            {[0, 1, 2].map((offset, _index) => {
              const year = new Date().getFullYear() - 1 + offset;
              return (
                <option key={year} value={`${year}-${year + 1}`}>
                  {year}-{year + 1}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <BlankTemplateQuickActions
            schoolInfo={{
              academicYear: selectedYear,
            }}
            templateType="long-range"
          />
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-testid="create-long-range-plan-button"
            onClick={() => {
 setIsCreateModalOpen(true); 
}}
          >
            Create Long Range Plan
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No plans yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first long-range plan for {selectedYear}
          </p>
          <div className="mt-6">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="create-long-range-plan-empty-state-button"
              onClick={() => {
 setIsCreateModalOpen(true); 
}}
            >
              Create Long Range Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: LongRangePlan, _index) => (
            <Link
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
              key={plan.id}
              to={`/planner/long-range/${plan.id}/units`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.subject} - Grade {plan.grade}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {plan.term ?? 'Full Year'}
                  </span>
                </div>

                {Boolean(plan.description != null && plan.description !== '' && plan.description.trim() !== '') && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                )}

                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4 text-gray-500">
                    <span>{plan._count.unitPlans} units</span>
                    <span>{plan._count.expectations} expectations</span>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>

                {plan.themes && plan.themes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.themes.slice(0, 3).map((theme, _index) => (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                        key={_index}
                      >
                        {theme}
                      </span>
                    ))}
                    {plan.themes.length > 3 && (
                      <span className="text-xs text-gray-500">+{plan.themes.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Dialog onOpenChange={setIsCreateModalOpen} open={isCreateModalOpen}>
        <div className="p-6 max-w-lg">
          <h3 className="text-lg font-semibold mb-4">Create Long-Range Plan</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-title">Plan Title *</label>
              <input
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-title"
                onChange={(e) => {
 setFormData({ ...formData, title: e.target.value }); 
}}
                placeholder="e.g., Grade 3 Mathematics Year Plan"
                required
                type="text"
                value={formData.title}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-subject">Subject *</label>
                <input
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  id="plan-subject"
                  onChange={(e) => {
 setFormData({ ...formData, subject: e.target.value }); 
}}
                  placeholder="e.g., Mathematics"
                  required
                  type="text"
                  value={formData.subject}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-grade">Grade *</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  id="plan-grade"
                  onChange={(e) => {
 setFormData({ ...formData, grade: Number(e.target.value) }); 
}}
                  value={formData.grade}
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Grade {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-term">Term</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-term"
                onChange={(e) => {
 setFormData({ ...formData, term: e.target.value }); 
}}
                value={formData.term}
              >
                <option value="Full Year">Full Year</option>
                <option value="Term 1">Term 1 (Sep-Jan)</option>
                <option value="Term 2">Term 2 (Feb-Jun)</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-description">Description</label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-description"
                onChange={(e) => {
 setFormData({ ...formData, description: e.target.value }); 
}}
                placeholder="Brief overview of the year plan..."
                rows={3}
                value={formData.description}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-goals">Learning Goals</label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-goals"
                onChange={(e) => {
 setFormData({ ...formData, goals: e.target.value }); 
}}
                placeholder="Overall learning goals for the year..."
                rows={3}
                value={formData.goals}
              />
              {formData.subject && formData.grade && (
                <button
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
 setShowAISuggestions(!showAISuggestions); 
}}
                  type="button"
                >
                  {showAISuggestions ? 'Hide' : 'Show'} AI Suggestions
                </button>
              )}
            </div>

            {showAISuggestions && formData.subject && formData.grade && (
              <AISuggestionPanel
                description="Get AI-powered suggestions for your long-range plan goals"
                error={generateLongRangeGoals.error}
                isGenerating={isGenerating}
                onAcceptAll={() => {
                  if (aiGoalSuggestions?.suggestions && aiGoalSuggestions.suggestions.length > 0) {
                    setFormData({
                      ...formData,
                      goals: aiGoalSuggestions.suggestions.join('\n\n'),
                    });
                  }
                }}
                onAcceptSuggestion={(suggestion) => {
                  setFormData({
                    ...formData,
                    goals: formData.goals ? `${formData.goals}\n\n${suggestion}` : suggestion,
                  });
                }}
                onGenerate={(): void => {
                  void (async (): Promise<void> => {
                    const result = await generateLongRangeGoals.mutateAsync({
                      subject: formData.subject,
                      grade: formData.grade,
                      termLength: formData.term === 'Full Year' ? 40 : 20,
                    });
                    setAiGoalSuggestions(result);
                  })();
                }}
                suggestions={aiGoalSuggestions || null}
                title="AI Goal Suggestions"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-themes">
                Key Themes (press Enter to add)
              </label>
              <input
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-themes"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !formData.themes.includes(value)) {
                      setFormData({ ...formData, themes: [...formData.themes, value] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
                placeholder="Type a theme and press Enter..."
                type="text"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.themes.map((theme, index) => (
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700"
                    key={index}
                  >
                    {theme}
                    <button
                      className="ml-1 hover:text-indigo-900"
                      onClick={() => {
 setFormData({
                          ...formData,
                          themes: formData.themes.filter((_, i) => i !== index),
                        }); 
}
                      }
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-questions">
                Overarching Questions
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-questions"
                onChange={(e) => {
 setFormData({ ...formData, overarchingQuestions: e.target.value }); 
}}
                placeholder="Big questions that will guide the year..."
                rows={2}
                value={formData.overarchingQuestions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-assessment">
                Assessment Overview
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-assessment"
                onChange={(e) => {
 setFormData({ ...formData, assessmentOverview: e.target.value }); 
}}
                placeholder="Overall assessment strategy for the year..."
                rows={2}
                value={formData.assessmentOverview}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-resources">Resource Needs</label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-resources"
                onChange={(e) => {
 setFormData({ ...formData, resourceNeeds: e.target.value }); 
}}
                placeholder="Materials, technology, and resources needed..."
                rows={2}
                value={formData.resourceNeeds}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="plan-professional-goals">
                Professional Learning Goals
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="plan-professional-goals"
                onChange={(e) => {
 setFormData({ ...formData, professionalGoals: e.target.value }); 
}}
                placeholder="Your professional development goals for this year..."
                rows={2}
                value={formData.professionalGoals}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button aria-label="Click button" onClick={() => {
 setIsCreateModalOpen(false); 
}}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={createPlan.isPending}
                type="submit"
              >
                {createPlan.isPending ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}

