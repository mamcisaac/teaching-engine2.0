import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus, Sparkles, Filter, ChevronDown, ChevronUp, Clock, Users, BookOpen } from 'lucide-react';
import { api } from '../../api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Outcome } from '../../types';

interface GenerateActivityParams {
  outcomeIds: string[];
  theme?: string;
  languageLevel?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  generateSeries?: boolean;
  seriesSize?: number;
}

interface GeneratedActivity {
  id: number;
  title: string;
  descriptionFr: string;
  descriptionEn?: string;
  materials: string[];
  duration: number;
  theme?: string;
  qualityScore?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  groupSize?: 'individual' | 'pairs' | 'small-group' | 'whole-class';
  subject: string;
  outcome: Outcome;
}

interface GeneratedSeries {
  subject: string;
  seriesId: string;
  seriesTitle: string;
  seriesDescription: string;
  activities: GeneratedActivity[];
  totalDuration: number;
  progression?: 'linear' | 'spiral' | 'thematic';
}

interface AIActivityGeneratorPanelProps {
  selectedOutcomes: string[];
  onOutcomesChange?: (outcomes: string[]) => void;
  onActivityDrop?: (activity: GeneratedActivity) => void;
}

export function AIActivityGeneratorPanel({
  selectedOutcomes,
  onOutcomesChange,
  onActivityDrop,
}: AIActivityGeneratorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [theme, setTheme] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [generateSeries, setGenerateSeries] = useState(false);
  const [seriesSize, setSeriesSize] = useState(3);
  const [generatedActivities, setGeneratedActivities] = useState<GeneratedActivity[]>([]);
  const [generatedSeries, setGeneratedSeries] = useState<GeneratedSeries[]>([]);

  // Fetch curriculum gaps
  const { data: curriculumAnalysis } = useQuery({
    queryKey: ['curriculum-analysis'],
    queryFn: async () => {
      const response = await api.get('/api/ai/curriculum/analyze');
      return response.data.data;
    },
  });

  // Generate activities mutation
  const generateMutation = useMutation({
    mutationFn: async (params: GenerateActivityParams) => {
      const response = await api.post('/api/ai/activities/generate', params);
      return response.data.data;
    },
    onSuccess: (data: GeneratedActivity[] | GeneratedSeries[]) => {
      toast.success('Activities generated successfully!');
      
      if (Array.isArray(data) && data[0] && 'activities' in data[0]) {
        // Series generated
        setGeneratedSeries(data as GeneratedSeries[]);
        setGeneratedActivities([]);
      } else {
        // Individual activities
        setGeneratedActivities(Array.isArray(data) ? data as GeneratedActivity[] : [data as GeneratedActivity]);
        setGeneratedSeries([]);
      }
    },
    onError: () => {
      toast.error('Failed to generate activities');
    },
  });

  // Provide feedback on activity
  const feedbackMutation = useMutation({
    mutationFn: async ({ id, accepted }: { id: number; accepted: boolean }) => {
      await api.post(`/api/ai/activities/${id}/feedback`, { accepted });
    },
  });

  const handleGenerate = () => {
    if (selectedOutcomes.length === 0) {
      toast.error('Please select at least one outcome');
      return;
    }

    generateMutation.mutate({
      outcomeIds: selectedOutcomes,
      theme: theme || undefined,
      complexity,
      generateSeries,
      seriesSize: generateSeries ? seriesSize : undefined,
    });
  };

  const handleAcceptActivity = (activity: GeneratedActivity) => {
    feedbackMutation.mutate({ id: activity.id, accepted: true });
    if (onActivityDrop) {
      onActivityDrop(activity);
    }
    toast.success('Activity added to planner');
  };

  const handleRejectActivity = (activity: GeneratedActivity) => {
    feedbackMutation.mutate({ id: activity.id, accepted: false });
    setGeneratedActivities(prev => prev.filter(a => a.id !== activity.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Activity Generator</h3>
          {curriculumAnalysis && (
            <span className="text-sm text-gray-500">
              ({curriculumAnalysis.coveragePercentage.toFixed(0)}% coverage)
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Generation Options */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme (optional)
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Winter, Animals, Community"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complexity
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generation Type
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!generateSeries}
                      onChange={() => setGenerateSeries(false)}
                      className="mr-2"
                    />
                    Individual
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={generateSeries}
                      onChange={() => setGenerateSeries(true)}
                      className="mr-2"
                    />
                    Series
                  </label>
                </div>
              </div>
            </div>

            {generateSeries && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activities in Series
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={seriesSize}
                  onChange={(e) => setSeriesSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || selectedOutcomes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              {generateMutation.isPending ? 'Generating...' : 'Generate Activities'}
            </button>
          </div>

          {/* Selected Outcomes */}
          {selectedOutcomes.length > 0 && (
            <div className="bg-purple-50 rounded-md p-3">
              <p className="text-sm font-medium text-purple-900 mb-1">
                Selected Outcomes ({selectedOutcomes.length})
              </p>
              <p className="text-xs text-purple-700">
                {selectedOutcomes.join(', ')}
              </p>
            </div>
          )}

          {/* Generated Activities */}
          {generatedActivities.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Generated Activities</h4>
              {generatedActivities.map((activity) => (
                <DraggableActivityCard
                  key={activity.id}
                  activity={activity}
                  onAccept={() => handleAcceptActivity(activity)}
                  onReject={() => handleRejectActivity(activity)}
                />
              ))}
            </div>
          )}

          {/* Generated Series */}
          {generatedSeries.length > 0 && (
            <div className="space-y-4">
              {generatedSeries.map((series: GeneratedSeries) => (
                <div key={series.seriesId} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-1">{series.seriesTitle}</h4>
                  <p className="text-sm text-gray-600 mb-3">{series.seriesDescription}</p>
                  <div className="space-y-2">
                    {series.activities.map((activity, index) => (
                      <DraggableActivityCard
                        key={activity.id}
                        activity={activity}
                        seriesIndex={index + 1}
                        onAccept={() => handleAcceptActivity(activity)}
                        onReject={() => handleRejectActivity(activity)}
                      />
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Total duration: {series.totalDuration} minutes • 
                    Progression: {series.progression}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coverage Gaps */}
          {curriculumAnalysis?.priorityGaps && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Priority Coverage Gaps</h4>
              <div className="space-y-1">
                {curriculumAnalysis.priorityGaps.slice(0, 5).map((gap: { outcome: Outcome; priority: number }) => (
                  <button
                    key={gap.outcome.id}
                    onClick={() => {
                      if (onOutcomesChange) {
                        onOutcomesChange([...selectedOutcomes, gap.outcome.id]);
                      }
                    }}
                    className="w-full text-left text-sm p-2 rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">{gap.outcome.code}</span>
                    <span className="text-gray-600 ml-2">{gap.outcome.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DraggableActivityCardProps {
  activity: GeneratedActivity;
  seriesIndex?: number;
  onAccept: () => void;
  onReject: () => void;
}

function DraggableActivityCard({ 
  activity, 
  seriesIndex,
  onAccept, 
  onReject 
}: DraggableActivityCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ai-activity-${activity.id}`,
    data: activity,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          {seriesIndex && (
            <span className="text-xs font-medium text-purple-600 mb-1 block">
              Activity {seriesIndex}
            </span>
          )}
          <h5 className="font-medium text-gray-900">{activity.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{activity.descriptionFr}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Accept activity"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Reject activity"
          >
            ×
          </button>
        </div>
      </div>

      {/* Activity Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.duration} min
        </span>
        {activity.complexity && (
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {activity.complexity}
          </span>
        )}
        {activity.groupSize && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {activity.groupSize}
          </span>
        )}
        {activity.qualityScore && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {(activity.qualityScore * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Materials */}
      {activity.materials.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Materials:</span> {activity.materials.join(', ')}
        </div>
      )}

      {/* Outcome */}
      <div className="mt-2 text-xs text-gray-500">
        {activity.outcome.code} - {activity.subject}
      </div>
    </div>
  );
}