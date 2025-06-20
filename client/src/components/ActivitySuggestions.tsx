import React from 'react';

// TODO: This component needs to be implemented by Agent-Planner
// It requires ActivitySuggestion hooks and types that are not yet available

interface ActivitySuggestionsProps {
  outcomeIds?: string[];
  themeId?: number;
  domain?: string;
  subject?: string;
  onAddToPlanner?: (suggestion: unknown) => void;
}

const ActivitySuggestions: React.FC<ActivitySuggestionsProps> = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Suggestions</h2>
      <p className="text-gray-600">
        This component is being developed by Agent-Planner and will be available soon.
      </p>
    </div>
  );
};

export default ActivitySuggestions;
