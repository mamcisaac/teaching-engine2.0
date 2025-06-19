import { useState } from 'react';
import { useActivitySuggestions } from '../api';
import { ActivityTemplate } from '../types';
import { Button } from './ui/Button';

interface ActivitySuggestionsProps {
  outcomeIds?: string[];
  themeId?: number;
  domain?: string;
  subject?: string;
  onAddToPlanner?: (suggestion: ActivityTemplate) => void;
}

export function ActivitySuggestions({
  outcomeIds = [],
  themeId,
  domain,
  subject,
  onAddToPlanner,
}: ActivitySuggestionsProps) {
  const [limit, setLimit] = useState(5);

  const {
    data: suggestions = [],
    isLoading,
    error,
  } = useActivitySuggestions({
    suggestFor: outcomeIds.join(','),
    theme: themeId,
    domain,
    subject,
    limit,
  });

  const handleAddToPlanner = (suggestion: ActivityTemplate) => {
    if (onAddToPlanner) {
      onAddToPlanner(suggestion);
    } else {
      // Default behavior - could integrate with planner context
      console.log('Adding to planner:', suggestion);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600">Finding relevant activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-3">
        <p className="text-red-700 text-sm">Failed to load activity suggestions.</p>
      </div>
    );
  }

  if (outcomeIds.length === 0 && !themeId && !domain && !subject) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-gray-600 text-sm">
          Link outcomes or select filters to see activity suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          {suggestions.length > 0
            ? `${suggestions.length} Activity ${suggestions.length === 1 ? 'Suggestion' : 'Suggestions'}`
            : 'Activity Suggestions'}
        </h3>
        {suggestions.length >= limit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLimit((prev) => prev + 5)}
            className="text-xs"
          >
            Show More
          </Button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
          <p className="text-blue-700 text-sm">
            {outcomeIds.length === 0 && !themeId && !domain && !subject
              ? 'Link outcomes or select a theme to see activity suggestions.'
              : 'No matching activity suggestions found. Try broadening your criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-lg shadow-sm border p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{suggestion.titleEn}</h4>
                  <p className="text-xs text-gray-600">{suggestion.titleFr}</p>
                </div>
              </div>

              <p className="text-xs text-gray-700 mb-2 line-clamp-2">{suggestion.descriptionEn}</p>

              <div className="flex flex-wrap gap-1 mb-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {suggestion.domain}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {suggestion.subject}
                </span>
                {suggestion.groupType && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {suggestion.groupType === 'Individual'
                      ? '👤'
                      : suggestion.groupType === 'Small group'
                        ? '👥'
                        : '🎓'}{' '}
                    {suggestion.groupType}
                  </span>
                )}
                {suggestion.prepTimeMin && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏱️ {suggestion.prepTimeMin}min
                  </span>
                )}
              </div>

              {suggestion.outcomeIds && suggestion.outcomeIds.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Linked Outcomes:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.outcomeIds.slice(0, 3).map((outcomeId) => (
                      <span
                        key={outcomeId}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {outcomeId}
                      </span>
                    ))}
                    {suggestion.outcomeIds.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{suggestion.outcomeIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {suggestion.theme && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600">
                    Theme:{' '}
                    <span className="font-medium">
                      {suggestion.theme.titleEn || suggestion.theme.title}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToPlanner(suggestion)}
                  className="flex-1 text-xs"
                >
                  Add to Planner
                </Button>
                <Button variant="secondary" size="sm" className="text-xs">
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
