import { useState, useMemo } from 'react';
import { useMediaResources, useDeleteMediaResource } from '../api';
import type { MediaResource } from '../types';
import UploadResourceModal from './UploadResourceModal';
import Dialog from './Dialog';

interface ResourceLibraryProps {
  userId: number;
  onSelectResource?: (resource: MediaResource) => void;
  selectMode?: boolean;
}

interface ResourceFilters {
  fileType: string;
  search: string;
  tag: string;
}

export default function ResourceLibrary({
  userId,
  onSelectResource,
  selectMode = false,
}: ResourceLibraryProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ResourceFilters>({
    fileType: '',
    search: '',
    tag: '',
  });
  const [previewResource, setPreviewResource] = useState<MediaResource | null>(null);

  const { data: resources = [], isLoading } = useMediaResources(userId);
  const deleteResource = useDeleteMediaResource();

  // Filter resources based on current filters
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // File type filter
      if (filters.fileType && resource.fileType !== filters.fileType) {
        return false;
      }

      // Search filter (title)
      if (filters.search && !resource.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Tag filter
      if (filters.tag && !resource.tags.includes(filters.tag)) {
        return false;
      }

      return true;
    });
  }, [resources, filters]);

  // Get unique tags from all resources
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    resources.forEach((resource) => {
      resource.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [resources]);

  const getFileIcon = (fileType: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getResourceUrl = (resource: MediaResource) => {
    // Extract filename from path for serving
    const filename = resource.filePath.split('/').pop();
    return `/api/media-resources/file/${resource.userId}/${filename}`;
  };

  const handleDelete = (resource: MediaResource) => {
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      deleteResource.mutate(resource.id);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading resources...</div>;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resource Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            {viewMode === 'grid' ? '📋' : '⊞'} {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Resource
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
        <div>
          <label htmlFor="file-type-filter" className="block text-sm font-medium mb-1">
            File Type
          </label>
          <select
            id="file-type-filter"
            value={filters.fileType}
            onChange={(e) => setFilters((prev) => ({ ...prev, fileType: e.target.value }))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="pdf">PDFs</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            id="search-filter"
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search by title..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="tag-filter" className="block text-sm font-medium mb-1">
            Tag
          </label>
          <select
            id="tag-filter"
            value={filters.tag}
            onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {resources.length === 0
            ? 'No resources uploaded yet.'
            : 'No resources match your filters.'}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }
        >
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={`
                border rounded-lg p-4 hover:shadow-md transition-shadow
                ${selectMode ? 'cursor-pointer hover:bg-blue-50' : ''}
                ${viewMode === 'list' ? 'flex items-center gap-4' : ''}
              `}
              onClick={() => selectMode && onSelectResource?.(resource)}
            >
              {/* Thumbnail/Icon */}
              <div
                className={`
                flex items-center justify-center bg-gray-100 rounded
                ${viewMode === 'grid' ? 'w-full h-32 mb-3' : 'w-16 h-16 flex-shrink-0'}
              `}
              >
                {resource.fileType === 'image' ? (
                  <img
                    src={getResourceUrl(resource)}
                    alt={resource.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-4xl ${resource.fileType === 'image' ? 'hidden' : ''}`}>
                  {getFileIcon(resource.fileType)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{resource.title}</h3>

                <div className="text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{resource.fileType}</span>
                    {resource.fileSize && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(resource.fileSize)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Linked Items */}
                <div className="mt-2 text-xs text-gray-500">
                  {resource.linkedActivities && resource.linkedActivities.length > 0 && (
                    <div>🎯 {resource.linkedActivities.length} activities</div>
                  )}
                  {resource.linkedOutcomes && resource.linkedOutcomes.length > 0 && (
                    <div>📋 {resource.linkedOutcomes.length} outcomes</div>
                  )}
                </div>

                {/* Actions */}
                {!selectMode && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewResource(resource);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Preview
                    </button>
                    <a
                      href={getResourceUrl(resource)}
                      download={resource.title}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Download
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resource);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResourceModal
          userId={userId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => setShowUploadModal(false)}
        />
      )}

      {/* Preview Modal */}
      {previewResource && (
        <Dialog open={!!previewResource} onOpenChange={(open) => !open && setPreviewResource(null)}>
          <div className="max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{previewResource.title}</h3>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="text-center">
              {previewResource.fileType === 'image' && (
                <img
                  src={getResourceUrl(previewResource)}
                  alt={previewResource.title}
                  className="max-w-full max-h-96 mx-auto"
                />
              )}
              {previewResource.fileType === 'video' && (
                <video
                  src={getResourceUrl(previewResource)}
                  controls
                  className="max-w-full max-h-96 mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {previewResource.fileType === 'audio' && (
                <audio src={getResourceUrl(previewResource)} controls className="w-full">
                  Your browser does not support the audio tag.
                </audio>
              )}
              {previewResource.fileType === 'pdf' && (
                <div className="text-gray-500">
                  <p>PDF Preview not available. Use download to view the file.</p>
                  <a
                    href={getResourceUrl(previewResource)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
