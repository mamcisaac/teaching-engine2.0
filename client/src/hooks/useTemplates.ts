import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  PlanTemplate,
  TemplateSearchOptions,
  TemplateSearchResult,
  TemplateCreateData,
  AppliedTemplateData,
  TemplateFilterOptions,
} from '../types/template';

const API_BASE = '/api/templates';

// Template API functions
export const templatesApi = {
  // Search and get templates
  searchTemplates: async (options: TemplateSearchOptions = {}): Promise<TemplateSearchResult> => {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(`${API_BASE}?${params.toString()}`);
    return response.data;
  },

  // Get a single template
  getTemplate: async (id: string): Promise<PlanTemplate> => {
    const response = await api.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Create a new template
  createTemplate: async (data: TemplateCreateData): Promise<PlanTemplate> => {
    const response = await api.post(API_BASE, data);
    return response.data;
  },

  // Update a template
  updateTemplate: async (id: string, data: Partial<TemplateCreateData>): Promise<PlanTemplate> => {
    const response = await api.put(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE}/${id}`);
  },

  // Duplicate a template
  duplicateTemplate: async (id: string, title?: string, isPublic?: boolean): Promise<PlanTemplate> => {
    const response = await api.post(`${API_BASE}/${id}/duplicate`, { title, isPublic });
    return response.data;
  },

  // Apply a template
  applyTemplate: async (id: string, customizations?: Record<string, unknown>): Promise<AppliedTemplateData> => {
    const response = await api.post(`${API_BASE}/${id}/apply`, { customizations });
    return response.data;
  },

  // Rate a template
  rateTemplate: async (id: string, rating: number, comment?: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`${API_BASE}/${id}/rate`, { rating, comment });
    return response.data;
  },

  // Get filter options
  getFilterOptions: async (): Promise<TemplateFilterOptions> => {
    const response = await api.get(`${API_BASE}/metadata/options`);
    return response.data;
  },
};

// Query keys for React Query
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (options: TemplateSearchOptions) => [...templateKeys.lists(), options] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  filterOptions: () => [...templateKeys.all, 'filterOptions'] as const,
};

// Hook to search templates
export function useTemplates(options: TemplateSearchOptions = {}) {
  return useQuery({
    queryKey: templateKeys.list(options),
    queryFn: () => templatesApi.searchTemplates(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get a single template
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to get filter options
export function useTemplateFilterOptions() {
  return useQuery({
    queryKey: templateKeys.filterOptions(),
    queryFn: templatesApi.getFilterOptions,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to create a template
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: (newTemplate) => {
      // Invalidate template lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(templateKeys.detail(newTemplate.id), newTemplate);
    },
  });
}

// Hook to update a template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TemplateCreateData>) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: (updatedTemplate) => {
      // Update cache
      queryClient.setQueryData(templateKeys.detail(updatedTemplate.id), updatedTemplate);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Hook to delete a template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Hook to duplicate a template
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title, isPublic }: { id: string; title?: string; isPublic?: boolean }) =>
      templatesApi.duplicateTemplate(id, title, isPublic),
    onSuccess: (duplicatedTemplate) => {
      // Add to cache
      queryClient.setQueryData(templateKeys.detail(duplicatedTemplate.id), duplicatedTemplate);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Hook to apply a template
export function useApplyTemplate() {
  return useMutation({
    mutationFn: ({ id, customizations }: { id: string; customizations?: Record<string, unknown> }) =>
      templatesApi.applyTemplate(id, customizations),
  });
}

// Hook to rate a template
export function useRateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment?: string }) =>
      templatesApi.rateTemplate(id, rating, comment),
    onSuccess: (_, { id }) => {
      // Invalidate the specific template to refetch with updated rating
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      
      // Invalidate lists to update average ratings
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Custom hook for template search with debounced input
export function useTemplateSearch(searchTerm: string, otherOptions: Omit<TemplateSearchOptions, 'search'> = {}, debounceMs = 300) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useTemplates({
    ...otherOptions,
    search: debouncedSearchTerm || undefined,
  });
}

// Custom hook for paginated template loading
export function useTemplatesPaginated(options: TemplateSearchOptions = {}) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const limit = options.limit || 20;
  
  const query = useTemplates({
    ...options,
    limit,
    offset: currentPage * limit,
  });

  const nextPage = React.useCallback(() => {
    if (query.data?.pagination.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [query.data?.pagination.hasMore]);

  const prevPage = React.useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);

  const goToPage = React.useCallback((page: number) => {
    setCurrentPage(Math.max(0, page));
  }, []);

  const resetPage = React.useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    ...query,
    currentPage,
    totalPages: query.data ? Math.ceil(query.data.pagination.total / limit) : 0,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    hasNextPage: query.data?.pagination.hasMore || false,
    hasPrevPage: currentPage > 0,
  };
}

// Custom hook for my templates (created by current user)
export function useMyTemplates(options: Omit<TemplateSearchOptions, 'createdByUserId'> = {}) {
  // Note: The backend will automatically filter to show user's own templates
  // when createdByUserId is not specified but user is authenticated
  return useTemplates({
    ...options,
    // The API will handle filtering to user's templates on the backend
  });
}

// Custom hook for system templates
export function useSystemTemplates(options: Omit<TemplateSearchOptions, 'isSystem'> = {}) {
  return useTemplates({
    ...options,
    isSystem: true,
  });
}

// Custom hook for public templates
export function usePublicTemplates(options: Omit<TemplateSearchOptions, 'isPublic'> = {}) {
  return useTemplates({
    ...options,
    isPublic: true,
  });
}

export default {
  useTemplates,
  useTemplate,
  useTemplateFilterOptions,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useApplyTemplate,
  useRateTemplate,
  useTemplateSearch,
  useTemplatesPaginated,
  useMyTemplates,
  useSystemTemplates,
  usePublicTemplates,
};