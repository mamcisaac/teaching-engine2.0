import { useState } from 'react';
import { useActivitySuggestions, ActivityTemplate } from '../api';
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

  const getRelevanceColor = (score: number) => {
    if (score > 0.7) return 'bg-green-100 text-green-800';
    if (score > 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRelevanceText = (score: number) => {
    if (score > 0.7) return 'High Match';
    if (score > 0.3) return 'Partial Match';
    return 'General';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded animate-pulse"></div>
          <h3 className="text-sm font-medium text-gray-700">Activity Suggestions</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700 text-sm">Failed to load suggestions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          🧩 Activity Suggestions
          {suggestions.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          )}
        </h3>
        {suggestions.length >= limit && (
          <Button variant="outline" size="sm" onClick={() => setLimit((prev) => prev + 5)}>
            Show More
          </Button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
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
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(suggestion.relevanceScore || 0)}`}
                >
                  {getRelevanceText(suggestion.relevanceScore || 0)}
                </span>
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

              {suggestion.outcomeIds.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {suggestion.outcomeIds.slice(0, 3).map((outcomeId: string, index: number) => (
                      <span
                        key={index}
                        className={`text-xs px-1 py-0.5 rounded ${
                          outcomeIds.includes(outcomeId)
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {outcomeId}
                      </span>
                    ))}
                    {suggestion.outcomeIds.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                        +{suggestion.outcomeIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {suggestion.theme && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">
                    Theme: {suggestion.theme.titleEn || suggestion.theme.title}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToPlanner(suggestion)}
                  className="flex-1 text-xs"
                >
                  📅 Add to Plan
                </Button>
                <Button variant="outline" size="sm" className="px-2 text-xs" title="View details">
                  👁️
                </Button>
                <Button variant="outline" size="sm" className="px-2 text-xs" title="Save for later">
                  ⭐
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Information */}
      {(outcomeIds.length > 0 || themeId || domain || subject) && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Suggestions based on:</p>
          <div className="flex flex-wrap gap-1">
            {outcomeIds.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {outcomeIds.length} outcome{outcomeIds.length !== 1 ? 's' : ''}
              </span>
            )}
            {domain && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                {domain} domain
              </span>
            )}
            {subject && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {subject} subject
              </span>
            )}
            {themeId && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                Current theme
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
