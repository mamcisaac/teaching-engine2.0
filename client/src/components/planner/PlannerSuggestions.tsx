import { usePlannerSuggestions } from '../../api';
import { PlannerSuggestionItem } from './PlannerSuggestionItem';

// Simple utility to conditionally join class names
const cn = (...args: unknown[]): string => {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
};
// Simple loading skeleton
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

export function PlannerSuggestions({
  weekStart,
  filters,
}: {
  weekStart: string;
  filters?: Record<string, boolean>;
}) {
  const { data: suggestions, isLoading, error } = usePlannerSuggestions(weekStart, filters);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
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

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
        <p className="text-blue-700 text-sm">
          No activity suggestions available for this week. Try adjusting your filters.
        </p>
      </div>
    );
  }

  // Group suggestions by coverage status for better organization
  const groupedSuggestions = suggestions.reduce<{
    uncovered: typeof suggestions;
    general: typeof suggestions;
    covered: typeof suggestions;
  }>(
    (acc, suggestion) => {
      if (suggestion.coverageStatus === 'covers_uncovered') {
        acc.uncovered.push(suggestion);
      } else if (suggestion.coverageStatus === 'general') {
        acc.general.push(suggestion);
      } else {
        acc.covered.push(suggestion);
      }
      return acc;
    },
    { uncovered: [], general: [], covered: [] },
  );

  return (
    <div className="space-y-6">
      {groupedSuggestions.uncovered.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-700 mb-2">New Coverage</h3>
          <div className="space-y-3">
            {groupedSuggestions.uncovered.map((suggestion) => (
              <PlannerSuggestionItem key={suggestion.activityId} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {groupedSuggestions.general.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-yellow-700 mb-2">General Suggestions</h3>
          <div className="space-y-3">
            {groupedSuggestions.general.map((suggestion) => (
              <PlannerSuggestionItem key={suggestion.activityId} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {groupedSuggestions.covered.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Already Covered</h3>
          <div className="space-y-3">
            {groupedSuggestions.covered.map((suggestion) => (
              <PlannerSuggestionItem key={suggestion.activityId} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
