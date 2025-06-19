import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
interface Outcome {
  id: string;
  code: string;
  subject: string;
  grade: number;
  description: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}
import { Button } from '../ui/Button';

interface UncoveredOutcome {
  outcome: Outcome;
  suggestion: AISuggestedActivity | null;
}

interface AISuggestedActivity {
  id: number;
  outcomeId: string;
  userId: number;
  title: string;
  descriptionFr: string;
  descriptionEn?: string;
  materials: string[];
  duration: number;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

interface UncoveredOutcomesPanelProps {
  startDate?: Date;
  endDate?: Date;
  theme?: string;
  onSelectSuggestion: (suggestion: AISuggestedActivity) => void;
}

export function UncoveredOutcomesPanel({
  startDate,
  endDate,
  theme,
  onSelectSuggestion,
}: UncoveredOutcomesPanelProps) {
  const queryClient = useQueryClient();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Fetch uncovered outcomes
  const { data: uncoveredOutcomes, isLoading } = useQuery({
    queryKey: ['uncovered-outcomes', startDate, endDate, theme],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (theme) params.append('theme', theme);

      const response = await apiClient.get<UncoveredOutcome[]>(
        `/ai-suggestions/uncovered?${params}`,
      );
      return response.data;
    },
  });

  // Generate AI suggestion mutation
  const generateSuggestion = useMutation({
    mutationFn: async (outcomeId: string) => {
      setGeneratingFor(outcomeId);
      const response = await apiClient.post<AISuggestedActivity>('/ai-suggestions/generate', {
        outcomeId,
        theme,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uncovered-outcomes'] });
      setGeneratingFor(null);
    },
    onError: () => {
      setGeneratingFor(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" role="status">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!uncoveredOutcomes || uncoveredOutcomes.length === 0) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <div className="text-4xl mx-auto mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">Tous les résultats couverts!</h3>
        <p className="text-green-700">
          Excellent! All curriculum outcomes have been addressed in your plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Uncovered Outcomes</h3>
        <span className="text-sm text-gray-500">
          {uncoveredOutcomes.length} outcomes need attention
        </span>
      </div>

      <div className="space-y-3">
        {uncoveredOutcomes.map(({ outcome, suggestion }) => (
          <div key={outcome.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {outcome.code}
                  </span>
                  <span className="text-sm text-gray-500">{outcome.subject}</span>
                </div>
                <p className="text-sm text-gray-700">{outcome.description}</p>

                {suggestion && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <span className="text-xs text-gray-500">{suggestion.duration} min</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{suggestion.descriptionFr}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectSuggestion(suggestion)}
                      className="mt-2"
                    >
                      <span className="mr-1">📅</span>
                      Use this activity
                    </Button>
                  </div>
                )}
              </div>

              <div className="ml-4">
                {!suggestion && (
                  <Button
                    size="sm"
                    onClick={() => generateSuggestion.mutate(outcome.id)}
                    disabled={generatingFor === outcome.id}
                  >
                    {generatingFor === outcome.id ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Suggest Activity
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
