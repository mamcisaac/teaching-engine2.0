import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Calendar, Clock, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { toast } from 'sonner';
import Dialog from '../Dialog';

interface AIWeeklyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string;
  onPlanApplied?: () => void;
}

interface PlanActivity {
  time: string;
  subject: string;
  activityTitle: string;
  activityDescription: string;
  duration: number;
  outcomeIds: string[];
  materials?: string[];
}

interface QualityMetrics {
  coverageScore: number;
  balanceScore: number;
  pacingScore: number;
  overallScore: number;
}

interface GeneratedPlan {
  planId: number;
  plan: {
    monday: PlanActivity[];
    tuesday: PlanActivity[];
    wednesday: PlanActivity[];
    thursday: PlanActivity[];
    friday: PlanActivity[];
    qualityMetrics: QualityMetrics;
    gapsCovered: string[];
  };
  metrics: QualityMetrics;
  availableSlots: number;
  gapsCovered: string[];
}

export function AIWeeklyPlanModal({ 
  isOpen, 
  onClose, 
  weekStart,
  onPlanApplied 
}: AIWeeklyPlanModalProps) {
  const [preferences, setPreferences] = useState({
    preferredComplexity: 'moderate' as 'simple' | 'moderate' | 'complex',
    includeAssessments: false,
    bufferTime: 5,
    subjectHours: {} as Record<string, number>,
  });
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<keyof GeneratedPlan['plan']>('monday');

  // Generate plan mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/ai/plans/generate', {
        weekStart,
        preferences,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      toast.success('Weekly plan generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate weekly plan');
    },
  });

  // Apply plan mutation
  const applyMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.post(`/api/ai/plans/${planId}/apply`);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Plan applied to calendar!');
      onPlanApplied?.();
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as any).response?.data?.error || 'Failed to apply plan'
        : 'Failed to apply plan';
      toast.error(errorMessage);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleApply = () => {
    if (generatedPlan) {
      applyMutation.mutate(generatedPlan.planId);
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="AI Weekly Plan Generator">
      <div className="space-y-6">
        {!generatedPlan ? (
          <>
            {/* Preferences Form */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Planning Preferences
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Activity Complexity
                    </label>
                    <select
                      value={preferences.preferredComplexity}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        preferredComplexity: e.target.value as any,
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="simple">Simple</option>
                      <option value="moderate">Moderate</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.includeAssessments}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          includeAssessments: e.target.checked,
                        })}
                        className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        Include assessment activities
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Buffer time between activities (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={preferences.bufferTime}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        bufferTime: parseInt(e.target.value),
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      AI Planning Assistant
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      The AI will analyze your curriculum gaps, respect your timetable,
                      and create a balanced weekly plan optimized for student learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generateMutation.isPending ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Generated Plan Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Generated Plan Preview
                </h3>
                <button
                  onClick={() => setGeneratedPlan(null)}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Generate New Plan
                </button>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getMetricColor(generatedPlan.plan.qualityMetrics.coverageScore)}`}>
                    {(generatedPlan.plan.qualityMetrics.coverageScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getMetricColor(generatedPlan.plan.qualityMetrics.balanceScore)}`}>
                    {(generatedPlan.plan.qualityMetrics.balanceScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Balance</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getMetricColor(generatedPlan.plan.qualityMetrics.pacingScore)}`}>
                    {(generatedPlan.plan.qualityMetrics.pacingScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Pacing</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getMetricColor(generatedPlan.plan.qualityMetrics.overallScore)}`}>
                    {(generatedPlan.plan.qualityMetrics.overallScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
              </div>

              {/* Day Selector */}
              <div className="flex gap-2 mb-4">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                      selectedDay === day
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Day Activities */}
              <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {!Array.isArray(generatedPlan.plan[selectedDay]) || generatedPlan.plan[selectedDay].length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No activities scheduled for {selectedDay}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(generatedPlan.plan[selectedDay] as PlanActivity[]).map((activity: PlanActivity, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {formatTime(activity.time)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({activity.duration} min)
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mt-1">
                              {activity.activityTitle}
                            </h4>
                          </div>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {activity.subject}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {activity.activityDescription}
                        </p>
                        {activity.materials && activity.materials.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Materials: {activity.materials.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gaps Covered */}
              {generatedPlan.gapsCovered.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Curriculum Gaps Addressed
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    This plan covers {generatedPlan.gapsCovered.length} priority outcomes
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {applyMutation.isPending ? 'Applying...' : 'Apply to Calendar'}
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}