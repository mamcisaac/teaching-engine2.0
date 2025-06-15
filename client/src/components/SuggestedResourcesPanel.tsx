import { useResourceSuggestions, useCreateResource, type ResourceSuggestion } from '../api';

interface Props {
  activityId: number | null;
}

const getResourceIcon = (type: ResourceSuggestion['type']) => {
  switch (type) {
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'worksheet':
      return '📄';
    case 'link':
      return '🌐';
    default:
      return '📎';
  }
};

export default function SuggestedResourcesPanel({ activityId }: Props) {
  const { data: suggestions = [], isLoading } = useResourceSuggestions(activityId);
  const createResource = useCreateResource();

  const handleAttachResource = async (suggestion: ResourceSuggestion) => {
    if (!activityId) return;

    // Create a synthetic resource record from the suggestion
    await createResource.mutateAsync({
      filename: suggestion.title,
      url: suggestion.url,
      type: suggestion.type,
      size: 0, // External resources don't have a size
      activityId,
    });
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!activityId) return null;

  if (isLoading) {
    return (
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Resources</h3>
        <div className="text-sm text-gray-500">Loading suggestions...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Resources</h3>
        <div className="text-sm text-gray-500">
          No suggestions found. Try linking an outcome or adding keywords to your activity title.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Resources</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <span className="text-lg">{getResourceIcon(suggestion.type)}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{suggestion.rationale}</p>
                {suggestion.description && (
                  <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handlePreview(suggestion.url)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Preview
              </button>
              <button
                onClick={() => handleAttachResource(suggestion)}
                disabled={createResource.isPending}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                {createResource.isPending ? 'Attaching...' : 'Attach to Activity'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
