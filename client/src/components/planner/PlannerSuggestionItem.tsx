import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ActivitySuggestion } from '../../api';
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

interface PlannerSuggestionItemProps {
  suggestion: ActivitySuggestion;
}

export function PlannerSuggestionItem({ suggestion }: PlannerSuggestionItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `suggestion-${suggestion.activityId}`,
    data: { type: 'suggestion', suggestion },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  // Determine border color based on coverage status
  const getBorderColor = () => {
    switch (suggestion.coverageStatus) {
      case 'covers_uncovered':
        return 'border-l-green-500';
      case 'general':
        return 'border-l-yellow-500';
      case 'already_covered':
      default:
        return 'border-l-gray-300';
    }
  };

  // Get coverage status text and tooltip
  const getCoverageInfo = () => {
    switch (suggestion.coverageStatus) {
      case 'covers_uncovered':
        return { text: 'New Coverage', tooltip: 'Covers outcomes not yet addressed' };
      case 'general':
        return { text: 'General', tooltip: 'General activity suggestion' };
      case 'already_covered':
      default:
        return { text: 'Covered', tooltip: 'Outcomes already covered' };
    }
  };

  const coverageInfo = getCoverageInfo();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 bg-white rounded shadow-sm border border-gray-200 mb-2',
        'cursor-grab hover:shadow-md transition-shadow',
        getBorderColor(),
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
          <p className="text-sm text-gray-500">{suggestion.milestoneTitle}</p>

          {suggestion.linkedOutcomes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {suggestion.linkedOutcomes.slice(0, 3).map((outcomeId, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {outcomeId}
                </span>
              ))}
              {suggestion.linkedOutcomes.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  +{suggestion.linkedOutcomes.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn('ml-2 px-2 py-1 rounded-full text-xs font-medium', {
            'bg-green-100 text-green-800': suggestion.coverageStatus === 'covers_uncovered',
            'bg-yellow-100 text-yellow-800': suggestion.coverageStatus === 'general',
            'bg-gray-100 text-gray-800': suggestion.coverageStatus === 'already_covered',
          })}
          title={coverageInfo.tooltip}
        >
          {coverageInfo.text}
        </div>
      </div>
    </div>
  );
}
