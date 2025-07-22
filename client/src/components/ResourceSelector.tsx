
import { useState } from 'react';

import { useMediaResources } from '../api/domains/resource';
import type { MediaResource } from '../api/domains/resource/api';

import { Dialog } from './Dialog';

interface ResourceSelectorProps {
  userId: number;
  onSelect: (resource: MediaResource) => void;
  onClose: () => void;
  fileTypeFilter?: string;
  title?: string;
}

export function ResourceSelector({
  userId,
  onSelect,
  onClose,
  fileTypeFilter,
  title = 'Select Resource',
}: ResourceSelectorProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [selectedFileType, setSelectedFileType] = useState((fileTypeFilter !== undefined && fileTypeFilter !== '') ? fileTypeFilter : '');

  const { data: mediaData, isLoading } = useMediaResources({ userId });
  const resources = mediaData?.resources ?? [];

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    // File type filter
    if (selectedFileType !== '' && resource.type !== selectedFileType) {
      return false;
    }

    // Search filter
    if (search !== '' && !resource.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
return '0 Bytes';
}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  const getResourceUrl = (resource: MediaResource): string => {
    if (resource.fileUrl !== '') {
      return resource.fileUrl;
    }
    if (resource.thumbnailUrl !== undefined && resource.thumbnailUrl !== '') {
      return resource.thumbnailUrl;
    }
    return '/placeholder-image.png';
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }} open>
      <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="resource-search">Search</label>
              <input
                className="w-full border rounded px-3 py-2"
                id="resource-search"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search resources..."
                type="text"
                value={search}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="file-type-select">File Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                disabled={!!(fileTypeFilter !== undefined && fileTypeFilter !== '')} // Disable if filtered from props
                id="file-type-select"
                onChange={(e) => {
                  setSelectedFileType(e.target.value);
                }}
                value={selectedFileType}
              >
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-6">
          {((): React.ReactElement => {
            if (isLoading) {
              return <div className="text-center py-8">Loading resources...</div>;
            }
            
            if (filteredResources.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  {resources.length === 0 ? 'No resources available' : 'No resources match your search'}
                </div>
              );
            }
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource, _index) => (
                <div
                  aria-label={`Select resource: ${resource.title}`}
                  className="border rounded-lg p-4 hover:shadow-md hover:bg-blue-50 cursor-pointer transition-all"
                  key={resource.id}
                  onClick={() => {
                    onSelect(resource);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(resource);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-32 mb-3 flex items-center justify-center bg-gray-100 rounded">
                    {resource.type === 'image' ? (
                      <img
                        alt={resource.title}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        src={getResourceUrl(resource)}
                      />
                    ) : (
                      <div className="text-4xl">
                        {getFileIcon(resource.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-medium truncate mb-1">{resource.title}</h3>

                  <div className="text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{resource.type}</span>
                      {resource.fileSize !== undefined && resource.fileSize > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(resource.fileSize)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 2).map((tag, _index) => (
                        <span
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{resource.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredResources.length} of {resources.length} resources
            </div>
            <button
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
