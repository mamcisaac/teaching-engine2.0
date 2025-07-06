import { apiClient } from '../../core/client';

export interface MediaResource {
  id: number;
  userId: number;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link' | 'other';
  mimeType?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  originalFileName?: string;
  fileSize?: number; // in bytes
  duration?: number; // for audio/video in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  tags: string[];
  category: 'lesson' | 'assessment' | 'classroom' | 'curriculum' | 'personal' | 'shared';
  visibility: 'private' | 'shared' | 'public';
  isActive: boolean;
  metadata?: Record<string, unknown>;
  sharedWith?: number[]; // user IDs
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResourceInput {
  title: string;
  description?: string;
  tags?: string[];
  category: string;
  visibility?: string;
  metadata?: Record<string, unknown>;
  sharedWith?: number[];
}

export interface ResourceFilters {
  type?: string[];
  category?: string[];
  tags?: string[];
  visibility?: string;
  userId?: number;
  sharedWithMe?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minFileSize?: number;
  maxFileSize?: number;
}

export interface ResourceStats {
  totalResources: number;
  totalSize: number; // in bytes
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  popularTags: { name: string; count: number }[];
  recentUploads: number; // last 7 days
  storageUsed: {
    used: number;
    limit: number;
    percentage: number;
  };
}

export interface ResourceCollection {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isPublic: boolean;
  resourceIds: number[];
  resources?: MediaResource[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: MediaResource;
}

// API endpoints
export const resourceApi = {
  // Media resources
  media: {
    // Get all media resources
    getAll: async (filters?: ResourceFilters) => {
      const { data } = await apiClient.get<{
        resources: MediaResource[];
        total: number;
        hasMore: boolean;
      }>('/api/resources/media', {
        params: filters,
      });
      return data;
    },

    // Get single media resource
    getById: async (id: number) => {
      const { data } = await apiClient.get<MediaResource>(`/api/resources/media/${id}`);
      return data;
    },

    // Upload single file
    upload: async (file: File, metadata: MediaResourceInput) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const { data } = await apiClient.post<MediaResource>('/api/resources/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },

    // Upload multiple files
    uploadMultiple: async (files: File[], metadata: MediaResourceInput[]) => {
      const formData = new FormData();
      
      files.forEach(file => {
 formData.append('files', file); 
});
      formData.append('metadata', JSON.stringify(metadata));

      const { data } = await apiClient.post<MediaResource[]>('/api/resources/media/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },

    // Update resource metadata
    update: async (id: number, updates: Partial<MediaResourceInput>) => {
      const { data } = await apiClient.put<MediaResource>(`/api/resources/media/${id}`, updates);
      return data;
    },

    // Delete resource
    delete: async (id: number) => {
      await apiClient.delete(`/api/resources/media/${id}`);
    },

    // Bulk delete resources
    bulkDelete: async (ids: number[]) => {
      const { data } = await apiClient.post<{ deleted: number; failed: number }>(
        '/api/resources/media/bulk-delete',
        { ids }
      );
      return data;
    },

    // Download resource
    download: async (id: number): Promise<Blob> => {
      const { data } = await apiClient.get<Blob>(`/api/resources/media/${id}/download`, {
        responseType: 'blob',
      });
      return data;
    },

    // Get download URL
    getDownloadUrl: async (id: number) => {
      const { data } = await apiClient.get<{ url: string; expiresAt: string }>(
        `/api/resources/media/${id}/download-url`
      );
      return data;
    },

    // Generate thumbnail
    generateThumbnail: async (id: number, options?: { width?: number; height?: number }) => {
      const { data } = await apiClient.post<{ thumbnailUrl: string }>(
        `/api/resources/media/${id}/thumbnail`,
        options
      );
      return data;
    },

    // Track view/download
    trackView: async (id: number) => {
      await apiClient.post(`/api/resources/media/${id}/view`);
    },

    trackDownload: async (id: number) => {
      await apiClient.post(`/api/resources/media/${id}/download-track`);
    },
  },

  // Collections
  collections: {
    // Get all collections
    getAll: async (includeResources = false) => {
      const { data } = await apiClient.get<ResourceCollection[]>('/api/resources/collections', {
        params: { includeResources },
      });
      return data;
    },

    // Get single collection
    getById: async (id: number, includeResources = true) => {
      const { data } = await apiClient.get<ResourceCollection>(`/api/resources/collections/${id}`, {
        params: { includeResources },
      });
      return data;
    },

    // Create collection
    create: async (collection: Omit<ResourceCollection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<ResourceCollection>('/api/resources/collections', collection);
      return data;
    },

    // Update collection
    update: async (id: number, updates: Partial<ResourceCollection>) => {
      const { data } = await apiClient.put<ResourceCollection>(`/api/resources/collections/${id}`, updates);
      return data;
    },

    // Delete collection
    delete: async (id: number) => {
      await apiClient.delete(`/api/resources/collections/${id}`);
    },

    // Add resources to collection
    addResources: async (collectionId: number, resourceIds: number[]) => {
      const { data } = await apiClient.post<ResourceCollection>(
        `/api/resources/collections/${collectionId}/resources`,
        { resourceIds }
      );
      return data;
    },

    // Remove resources from collection
    removeResources: async (collectionId: number, resourceIds: number[]): Promise<ResourceCollection> => {
      const { data } = await apiClient.delete<ResourceCollection>(`/api/resources/collections/${collectionId}/resources`, {
        data: { resourceIds },
      });
      return data;
    },

    // Share collection
    share: async (collectionId: number, userIds: number[]) => {
      const { data } = await apiClient.post<ResourceCollection>(
        `/api/resources/collections/${collectionId}/share`,
        { userIds }
      );
      return data;
    },
  },

  // Search and discovery
  search: async (query: string, filters?: ResourceFilters) => {
    const { data } = await apiClient.get<{
      resources: MediaResource[];
      collections: ResourceCollection[];
      total: number;
    }>('/api/resources/search', {
      params: { q: query, ...filters },
    });
    return data;
  },

  // Get popular/trending resources
  getPopular: async (timeframe: 'day' | 'week' | 'month' = 'week', limit = 20) => {
    const { data } = await apiClient.get<MediaResource[]>('/api/resources/popular', {
      params: { timeframe, limit },
    });
    return data;
  },

  // Get recently added resources
  getRecent: async (limit = 20, category?: string) => {
    const { data } = await apiClient.get<MediaResource[]>('/api/resources/recent', {
      params: { limit, category },
    });
    return data;
  },

  // Get shared resources
  getSharedWithMe: async () => {
    const { data } = await apiClient.get<MediaResource[]>('/api/resources/shared-with-me');
    return data;
  },

  // Statistics
  getStats: async () => {
    const { data } = await apiClient.get<ResourceStats>('/api/resources/stats');
    return data;
  },

  // Tags and categories
  getTags: async () => {
    const { data } = await apiClient.get<{ name: string; count: number }[]>('/api/resources/tags');
    return data;
  },

  getCategories: async () => {
    const { data } = await apiClient.get<{ name: string; count: number }[]>('/api/resources/categories');
    return data;
  },

  // Import/Export
  import: async (source: 'google-drive' | 'dropbox' | 'onedrive', authToken: string) => {
    const { data } = await apiClient.post<{
      imported: number;
      failed: number;
      errors?: string[];
    }>('/api/resources/import', {
      source,
      authToken,
    });
    return data;
  },

  export: async (resourceIds: number[], format: 'zip' | 'json'): Promise<Blob> => {
    const { data } = await apiClient.post<Blob>('/api/resources/export', {
      resourceIds,
      format,
    }, {
      responseType: 'blob',
    });
    return data;
  },

  // Link resources (external URLs)
  links: {
    // Add external link as resource
    add: async (linkData: {
      url: string;
      title: string;
      description?: string;
      category: string;
      tags?: string[];
    }) => {
      const { data } = await apiClient.post<MediaResource>('/api/resources/links', linkData);
      return data;
    },

    // Validate link and extract metadata
    validate: async (url: string) => {
      const { data } = await apiClient.post<{
        isValid: boolean;
        metadata?: {
          title?: string;
          description?: string;
          imageUrl?: string;
          siteName?: string;
        };
        error?: string;
      }>('/api/resources/links/validate', { url });
      return data;
    },

    // Bulk import links
    importBulk: async (urls: string[], defaultCategory: string) => {
      const { data } = await apiClient.post<{
        imported: MediaResource[];
        failed: { url: string; error: string }[];
      }>('/api/resources/links/bulk-import', {
        urls,
        defaultCategory,
      });
      return data;
    },
  },

  // Storage management
  storage: {
    // Get storage usage
    getUsage: async () => {
      const { data } = await apiClient.get<{
        used: number;
        limit: number;
        percentage: number;
        breakdown: Record<string, number>;
      }>('/api/resources/storage/usage');
      return data;
    },

    // Clean up unused files
    cleanup: async () => {
      const { data } = await apiClient.post<{
        cleaned: number;
        freed: number; // bytes
      }>('/api/resources/storage/cleanup');
      return data;
    },

    // Optimize storage (compress images, etc.)
    optimize: async (resourceIds?: number[]) => {
      const { data } = await apiClient.post<{
        optimized: number;
        saved: number; // bytes
      }>('/api/resources/storage/optimize', { resourceIds });
      return data;
    },
  },

  // Sharing and permissions
  sharing: {
    // Share resource with users
    shareWithUsers: async (resourceId: number, userIds: number[], permission: 'view' | 'download' | 'edit') => {
      const { data } = await apiClient.post<MediaResource>(
        `/api/resources/media/${resourceId}/share`,
        { userIds, permission }
      );
      return data;
    },

    // Generate public sharing link
    generatePublicLink: async (resourceId: number, expiresInDays?: number) => {
      const { data } = await apiClient.post<{
        link: string;
        expiresAt?: string;
      }>(`/api/resources/media/${resourceId}/public-link`, {
        expiresInDays,
      });
      return data;
    },

    // Revoke public link
    revokePublicLink: async (resourceId: number) => {
      await apiClient.delete(`/api/resources/media/${resourceId}/public-link`);
    },

    // Get sharing status
    getSharingStatus: async (resourceId: number) => {
      const { data } = await apiClient.get<{
        isPublic: boolean;
        publicLink?: string;
        sharedWith: {
          userId: number;
          userName: string;
          permission: string;
          sharedAt: string;
        }[];
      }>(`/api/resources/media/${resourceId}/sharing`);
      return data;
    },
  },
};