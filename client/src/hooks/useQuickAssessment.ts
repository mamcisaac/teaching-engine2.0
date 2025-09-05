import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { quickAssessmentAPI, type StudentAssessmentFiltersWithPagination } from '../services/quickAssessmentAPI';
import type {
  StudentAssessment,
  CreateStudentAssessmentRequest,
  UpdateStudentAssessmentRequest,
  DifferentiationGroupsRequest,
  StudentAssessmentFilters
} from '../types/studentAssessment';

export const QUICK_ASSESSMENT_QUERY_KEYS = {
  all: ['student-assessments'] as const,
  lists: () => [...QUICK_ASSESSMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: StudentAssessmentFilters) => [...QUICK_ASSESSMENT_QUERY_KEYS.lists(), filters] as const,
  differentiationGroups: (filters: DifferentiationGroupsRequest) => [...QUICK_ASSESSMENT_QUERY_KEYS.all, 'differentiation', filters] as const,
};

export function useQuickAssessments(filters?: StudentAssessmentFiltersWithPagination) {
  return useQuery({
    queryKey: QUICK_ASSESSMENT_QUERY_KEYS.list(filters),
    queryFn: () => quickAssessmentAPI.getAssessments(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assessment: CreateStudentAssessmentRequest) => 
      quickAssessmentAPI.createAssessment(assessment),
    onSuccess: (newAssessment) => {
      // Invalidate and refetch assessment lists
      void queryClient.invalidateQueries({ 
        queryKey: QUICK_ASSESSMENT_QUERY_KEYS.lists() 
      });
      
      // Optionally add the new assessment to existing cache
      queryClient.setQueryData<StudentAssessment[]>(
        QUICK_ASSESSMENT_QUERY_KEYS.list(),
        (oldData) => oldData ? [newAssessment, ...oldData] : [newAssessment]
      );
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentAssessmentRequest }) =>
      quickAssessmentAPI.updateAssessment(id, data),
    onSuccess: (updatedAssessment) => {
      // Update specific assessment in cache
      queryClient.setQueryData<StudentAssessment[]>(
        QUICK_ASSESSMENT_QUERY_KEYS.list(),
        (oldData) => 
          oldData?.map(assessment => 
            assessment.id === updatedAssessment.id ? updatedAssessment : assessment
          ) || []
      );
      
      // Invalidate lists to be safe
      void queryClient.invalidateQueries({ 
        queryKey: QUICK_ASSESSMENT_QUERY_KEYS.lists() 
      });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => quickAssessmentAPI.deleteAssessment(id),
    onSuccess: (_, deletedId) => {
      // Remove assessment from cache
      queryClient.setQueryData<StudentAssessment[]>(
        QUICK_ASSESSMENT_QUERY_KEYS.list(),
        (oldData) => oldData?.filter(assessment => assessment.id !== deletedId) || []
      );
      
      // Invalidate lists to be safe
      void queryClient.invalidateQueries({ 
        queryKey: QUICK_ASSESSMENT_QUERY_KEYS.lists() 
      });
    },
  });
}

export function useDifferentiationGroups(request: DifferentiationGroupsRequest) {
  return useQuery({
    queryKey: QUICK_ASSESSMENT_QUERY_KEYS.differentiationGroups(request),
    queryFn: () => quickAssessmentAPI.getDifferentiationGroups(request),
    enabled: Boolean(request.subject), // Only fetch when subject is provided
    staleTime: 60000, // 1 minute
  });
}

export function useBatchCreateAssessments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assessments: CreateStudentAssessmentRequest[]) =>
      quickAssessmentAPI.createMultipleAssessments(assessments),
    onSuccess: () => {
      // Invalidate all assessment lists
      void queryClient.invalidateQueries({ 
        queryKey: QUICK_ASSESSMENT_QUERY_KEYS.lists() 
      });
    },
  });
}

export function useBatchUpdateAssessments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{ id: string; data: UpdateStudentAssessmentRequest }>) =>
      quickAssessmentAPI.updateMultipleAssessments(updates),
    onSuccess: () => {
      // Invalidate all assessment lists
      void queryClient.invalidateQueries({ 
        queryKey: QUICK_ASSESSMENT_QUERY_KEYS.lists() 
      });
    },
  });
}

// Utility hook for quick assessment management in a specific context
export function useQuickAssessmentManager(
  initialFilters?: StudentAssessmentFiltersWithPagination
) {
  const assessments = useQuickAssessments(initialFilters);
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const deleteAssessment = useDeleteAssessment();
  const batchCreate = useBatchCreateAssessments();
  const batchUpdate = useBatchUpdateAssessments();

  return {
    // Data
    assessments: assessments.data?.data || [],
    pagination: assessments.data?.pagination,
    isLoading: assessments.isLoading,
    error: assessments.error,
    
    // Actions
    createAssessment: createAssessment.mutate,
    updateAssessment: updateAssessment.mutate,
    deleteAssessment: deleteAssessment.mutate,
    batchCreateAssessments: batchCreate.mutate,
    batchUpdateAssessments: batchUpdate.mutate,
    
    // Loading states
    isCreating: createAssessment.isPending,
    isUpdating: updateAssessment.isPending,
    isDeleting: deleteAssessment.isPending,
    isBatchCreating: batchCreate.isPending,
    isBatchUpdating: batchUpdate.isPending,
    
    // Refetch
    refetch: assessments.refetch,
  };
}