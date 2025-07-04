import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';
import type {
  MediaResource,
  MediaResourceInput,
  ResourceFilters,
  ResourceCollection,
} from './api';

// Media resource query hooks
export const useMediaResources = (filters?: ResourceFilters) =>
  useQuery({
    queryKey: queryKeys.resource.media(filters?.userId || 0),
    queryFn: () => resourceApi.media.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useMediaResource = (id: number) =>
  useQuery({
    queryKey: queryKeys.resource.detail(id),
    queryFn: () => resourceApi.media.getById(id),
    enabled: !!id,
  });

export const usePopularResources = (timeframe: 'day' | 'week' | 'month' = 'week', limit: number = 20) =>
  useQuery({
    queryKey: ['popular-resources', timeframe, limit],
    queryFn: () => resourceApi.getPopular(timeframe, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const useRecentResources = (limit: number = 20, category?: string) =>
  useQuery({
    queryKey: ['recent-resources', limit, category],
    queryFn: () => resourceApi.getRecent(limit, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useSharedResources = () =>
  useQuery({
    queryKey: ['shared-resources'],
    queryFn: resourceApi.getSharedWithMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useResourceStats = () =>
  useQuery({
    queryKey: ['resource-stats'],
    queryFn: resourceApi.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const useResourceTags = () =>
  useQuery({
    queryKey: ['resource-tags'],
    queryFn: resourceApi.getTags,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

export const useResourceCategories = () =>
  useQuery({
    queryKey: ['resource-categories'],
    queryFn: resourceApi.getCategories,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

// Collection query hooks
export const useResourceCollections = (includeResources: boolean = false) =>
  useQuery({
    queryKey: ['resource-collections', includeResources],
    queryFn: () => resourceApi.collections.getAll(includeResources),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useResourceCollection = (id: number, includeResources: boolean = true) =>
  useQuery({
    queryKey: ['resource-collection', id, includeResources],
    queryFn: () => resourceApi.collections.getById(id, includeResources),
    enabled: !!id,
  });

// Search hooks
export const useResourceSearch = (query: string, filters?: ResourceFilters) =>
  useQuery({
    queryKey: ['resource-search', query, filters],
    queryFn: () => resourceApi.search(query, filters),
    enabled: !!query && query.length > 1,
    staleTime: 30 * 1000, // 30 seconds
  });

// Link validation hook
export const useLinkValidation = (url: string) =>
  useQuery({
    queryKey: ['link-validation', url],
    queryFn: () => resourceApi.links.validate(url),
    enabled: !!url,
    staleTime: 60 * 1000, // 1 minute
  });

// Storage hooks
export const useStorageUsage = () =>
  useQuery({
    queryKey: ['storage-usage'],
    queryFn: resourceApi.storage.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useSharingStatus = (resourceId: number) =>
  useQuery({
    queryKey: ['sharing-status', resourceId],
    queryFn: () => resourceApi.sharing.getSharingStatus(resourceId),
    enabled: !!resourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

// Media resource mutation hooks
export const useUploadResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: MediaResourceInput }) =>
      resourceApi.media.upload(file, metadata),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.media(data.userId) });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['resource-tags'] });
      queryClient.invalidateQueries({ queryKey: ['resource-categories'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      
      showSuccessToast('Resource uploaded successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload resource'),
  });
};

export const useUploadMultipleResources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, metadata }: { files: File[]; metadata: MediaResourceInput[] }) =>
      resourceApi.media.uploadMultiple(files, metadata),
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.resource.media(data[0].userId) });
      }
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['resource-tags'] });
      queryClient.invalidateQueries({ queryKey: ['resource-categories'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      
      showSuccessToast(`${data.length} resources uploaded successfully`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload resources'),
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MediaResourceInput> }) =>
      resourceApi.media.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.resource.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.media(data.userId) });
      queryClient.invalidateQueries({ queryKey: ['resource-tags'] });
      queryClient.invalidateQueries({ queryKey: ['resource-categories'] });
      
      showSuccessToast('Resource updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update resource'),
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resourceApi.media.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.resource.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      
      showSuccessToast('Resource deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete resource'),
  });
};

export const useBulkDeleteResources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => resourceApi.media.bulkDelete(ids),
    onSuccess: (data, ids) => {
      // Remove deleted resources from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: queryKeys.resource.detail(id) });
      });
      
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      
      showSuccessToast(
        `${data.deleted} resources deleted successfully` +
        (data.failed > 0 ? `, ${data.failed} failed` : '')
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to delete resources'),
  });
};

export const useGenerateThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }: { 
      id: number; 
      options?: { width?: number; height?: number };
    }) => resourceApi.media.generateThumbnail(id, options),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.detail(variables.id) });
      
      showSuccessToast('Thumbnail generated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to generate thumbnail'),
  });
};

// Collection mutation hooks
export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collection: Omit<ResourceCollection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      resourceApi.collections.create(collection),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resource-collections'] });
      
      showSuccessToast('Collection created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create collection'),
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ResourceCollection> }) =>
      resourceApi.collections.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['resource-collection', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['resource-collections'] });
      
      showSuccessToast('Collection updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update collection'),
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resourceApi.collections.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['resource-collection', id] });
      queryClient.invalidateQueries({ queryKey: ['resource-collections'] });
      
      showSuccessToast('Collection deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete collection'),
  });
};

export const useAddResourcesToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, resourceIds }: { collectionId: number; resourceIds: number[] }) =>
      resourceApi.collections.addResources(collectionId, resourceIds),
    onSuccess: (data) => {
      queryClient.setQueryData(['resource-collection', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['resource-collections'] });
      
      showSuccessToast('Resources added to collection');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to add resources to collection'),
  });
};

export const useRemoveResourcesFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, resourceIds }: { collectionId: number; resourceIds: number[] }) =>
      resourceApi.collections.removeResources(collectionId, resourceIds),
    onSuccess: (data) => {
      queryClient.setQueryData(['resource-collection', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['resource-collections'] });
      
      showSuccessToast('Resources removed from collection');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to remove resources from collection'),
  });
};

// Link mutation hooks
export const useAddLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkData: {
      url: string;
      title: string;
      description?: string;
      category: string;
      tags?: string[];
    }) => resourceApi.links.add(linkData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.media(data.userId) });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['resource-tags'] });
      
      showSuccessToast('Link added successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to add link'),
  });
};

export const useBulkImportLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ urls, defaultCategory }: { urls: string[]; defaultCategory: string }) =>
      resourceApi.links.importBulk(urls, defaultCategory),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['resource-tags'] });
      
      showSuccessToast(
        `${data.imported.length} links imported successfully` +
        (data.failed.length > 0 ? `, ${data.failed.length} failed` : '')
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import links'),
  });
};

// Storage mutation hooks
export const useStorageCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceApi.storage.cleanup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      queryClient.invalidateQueries({ queryKey: ['resource-stats'] });
      
      showSuccessToast(`Cleaned up ${data.cleaned} files, freed ${(data.freed / 1024 / 1024).toFixed(2)} MB`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to cleanup storage'),
  });
};

export const useStorageOptimize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceIds?: number[]) => resourceApi.storage.optimize(resourceIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      
      showSuccessToast(`Optimized ${data.optimized} files, saved ${(data.saved / 1024 / 1024).toFixed(2)} MB`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to optimize storage'),
  });
};

// Sharing mutation hooks
export const useShareResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      resourceId, 
      userIds, 
      permission 
    }: { 
      resourceId: number; 
      userIds: number[]; 
      permission: 'view' | 'download' | 'edit';
    }) => resourceApi.sharing.shareWithUsers(resourceId, userIds, permission),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.resource.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['sharing-status', data.id] });
      
      showSuccessToast('Resource shared successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to share resource'),
  });
};

export const useGeneratePublicLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, expiresInDays }: { resourceId: number; expiresInDays?: number }) =>
      resourceApi.sharing.generatePublicLink(resourceId, expiresInDays),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sharing-status', variables.resourceId] });
      
      showSuccessToast('Public link generated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to generate public link'),
  });
};

export const useRevokePublicLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: number) => resourceApi.sharing.revokePublicLink(resourceId),
    onSuccess: (_, resourceId) => {
      queryClient.invalidateQueries({ queryKey: ['sharing-status', resourceId] });
      
      showSuccessToast('Public link revoked successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to revoke public link'),
  });
};

// Download hooks
export const useDownloadResource = () => {
  return useMutation({
    mutationFn: (id: number) => resourceApi.media.download(id),
    onSuccess: (data, id) => {
      // Track download
      resourceApi.media.trackDownload(id);
      
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resource');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => handleApiError(error, 'Failed to download resource'),
  });
};

export const useExportResources = () => {
  return useMutation({
    mutationFn: ({ resourceIds, format }: { resourceIds: number[]; format: 'zip' | 'json' }) =>
      resourceApi.export(resourceIds, format),
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resources.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Resources exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export resources'),
  });
};