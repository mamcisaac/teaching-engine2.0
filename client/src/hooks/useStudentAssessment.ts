/**
 * React Query Hooks for Student Assessment System
 * Custom hooks for data fetching, mutations, and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  studentsAPI,
  artifactsAPI,
  masteryAPI,
  createArtifactFormData
} from '../services/studentAssessmentAPI';
import type {
  StudentsFilters,
  ArtifactsFilters,
  MasteryFilters,
  AnalyticsFilters,
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateArtifactRequest,
  UpdateMasteryRequest,
  BatchMasteryUpdateRequest,
  TagOutcomeRequest
} from '../types/studentAssessment';

// Query Keys
export const QUERY_KEYS = {
  students: {
    all: ['students'] as const,
    lists: () => [...QUERY_KEYS.students.all, 'list'] as const,
    list: (filters: StudentsFilters) => [...QUERY_KEYS.students.lists(), filters] as const,
    details: () => [...QUERY_KEYS.students.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.students.details(), id] as const,
    artifacts: (id: string) => [...QUERY_KEYS.students.detail(id), 'artifacts'] as const,
    progress: (id: string) => [...QUERY_KEYS.students.detail(id), 'progress'] as const,
    summary: (id: string) => [...QUERY_KEYS.students.detail(id), 'summary'] as const,
  },
  artifacts: {
    all: ['artifacts'] as const,
    lists: () => [...QUERY_KEYS.artifacts.all, 'list'] as const,
    list: (filters: ArtifactsFilters) => [...QUERY_KEYS.artifacts.lists(), filters] as const,
    details: () => [...QUERY_KEYS.artifacts.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.artifacts.details(), id] as const,
  },
  mastery: {
    all: ['mastery'] as const,
    student: (studentId: string, filters?: MasteryFilters) => 
      [...QUERY_KEYS.mastery.all, 'student', studentId, filters] as const,
    outcome: (outcomeId: string, includeArchived?: boolean) => 
      [...QUERY_KEYS.mastery.all, 'outcome', outcomeId, includeArchived] as const,
    analytics: (filters?: AnalyticsFilters) => 
      [...QUERY_KEYS.mastery.all, 'analytics', filters] as const,
  }
};

// Student Hooks
export const useStudents = (filters: StudentsFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.students.list(filters),
    queryFn: () => studentsAPI.getStudents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.students.detail(id),
    queryFn: () => studentsAPI.getStudent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentSummary = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.students.summary(id),
    queryFn: () => studentsAPI.getStudentSummary(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStudentRequest) => studentsAPI.createStudent(data),
    onSuccess: () => {
      // Invalidate and refetch students lists
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.lists() });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentRequest }) => 
      studentsAPI.updateStudent(id, data),
    onSuccess: (updatedStudent) => {
      // Update specific student in cache
      queryClient.setQueryData(
        QUERY_KEYS.students.detail(updatedStudent.id),
        updatedStudent
      );
      // Invalidate students lists to reflect changes
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.lists() });
    },
  });
};

export const useDeactivateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => studentsAPI.deactivateStudent(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: QUERY_KEYS.students.detail(id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.lists() });
    },
  });
};

// Artifact Hooks
export const useArtifacts = (filters: ArtifactsFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.artifacts.list(filters),
    queryFn: () => artifactsAPI.getArtifacts(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useStudentArtifacts = (
  studentId: string,
  filters: Omit<ArtifactsFilters, 'studentId'> = {}
) => {
  return useQuery({
    queryKey: QUERY_KEYS.students.artifacts(studentId),
    queryFn: () => studentsAPI.getStudentArtifacts(studentId, filters),
    enabled: !!studentId,
    staleTime: 3 * 60 * 1000,
  });
};

export const useArtifact = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.artifacts.detail(id),
    queryFn: () => artifactsAPI.getArtifact(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadArtifact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      file, 
      data, 
      uploadType = 'auto' 
    }: { 
      file: File; 
      data: CreateArtifactRequest; 
      uploadType?: 'photo' | 'video' | 'audio' | 'document' | 'mobile' | 'auto';
    }) => {
      const formData = createArtifactFormData(file, data);
      
      // Determine upload method
      if (uploadType === 'auto') {
        const mimeType = file.type;
        if (mimeType.startsWith('image/')) uploadType = 'photo';
        else if (mimeType.startsWith('video/')) uploadType = 'video';
        else if (mimeType.startsWith('audio/')) uploadType = 'audio';
        else uploadType = 'document';
      }
      
      switch (uploadType) {
        case 'photo': return artifactsAPI.uploadPhoto(formData);
        case 'video': return artifactsAPI.uploadVideo(formData);
        case 'audio': return artifactsAPI.uploadAudio(formData);
        case 'document': return artifactsAPI.uploadDocument(formData);
        case 'mobile': return artifactsAPI.uploadMobile(formData);
        default: throw new Error('Invalid upload type');
      }
    },
    onSuccess: (result, { data }) => {
      // Invalidate related queries
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts.lists() });
      if (data.studentId) {
        void queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.students.artifacts(data.studentId) 
        });
        void queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.students.summary(data.studentId) 
        });
      }
    },
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateArtifactRequest) => artifactsAPI.createNote(data),
    onSuccess: (result, data) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts.lists() });
      if (data.studentId) {
        void queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.students.artifacts(data.studentId) 
        });
      }
    },
  });
};

export const useUpdateArtifact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateArtifactRequest> }) => 
      artifactsAPI.updateArtifact(id, data),
    onSuccess: (updatedArtifact) => {
      // Update cache
      queryClient.setQueryData(
        QUERY_KEYS.artifacts.detail(updatedArtifact.id),
        updatedArtifact
      );
      // Invalidate lists
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts.lists() });
    },
  });
};

export const useDeleteArtifact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => artifactsAPI.deleteArtifact(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.artifacts.detail(id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts.lists() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useTagArtifactWithOutcome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ artifactId, data }: { artifactId: string; data: TagOutcomeRequest }) =>
      artifactsAPI.tagWithOutcome(artifactId, data),
    onSuccess: (_, { artifactId }) => {
      // Refresh artifact details to show new tagging
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.artifacts.detail(artifactId) 
      });
      // Refresh mastery data as this affects progress
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mastery.all });
    },
  });
};

// Mastery Tracking Hooks
export const useStudentMastery = (studentId: string, filters: MasteryFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.mastery.student(studentId, filters),
    queryFn: () => masteryAPI.getStudentMastery(studentId, filters),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes (assessment data changes frequently)
  });
};

export const useOutcomeMastery = (outcomeId: string, includeArchived = false) => {
  return useQuery({
    queryKey: QUERY_KEYS.mastery.outcome(outcomeId, includeArchived),
    queryFn: () => masteryAPI.getOutcomeMastery(outcomeId, includeArchived),
    enabled: !!outcomeId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMasteryAnalytics = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.mastery.analytics(filters),
    queryFn: () => masteryAPI.getAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes for analytics
  });
};

export const useUpdateMastery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateMasteryRequest) => masteryAPI.updateProgress(data),
    onSuccess: (result, data) => {
      // Invalidate all mastery-related queries for this student and outcome
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.mastery.student(data.studentId) 
      });
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.mastery.outcome(data.outcomeId) 
      });
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.mastery.analytics() 
      });
      // Update student summary
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.students.summary(data.studentId) 
      });
    },
  });
};

export const useBatchUpdateMastery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BatchMasteryUpdateRequest) => masteryAPI.batchUpdateProgress(data),
    onSuccess: (result, data) => {
      // Invalidate all mastery queries as batch update can affect multiple students/outcomes
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mastery.all });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useShareWithParents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (progressIds: string[]) => masteryAPI.shareWithParents(progressIds),
    onSuccess: () => {
      // Refresh mastery data to show updated sharing status
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mastery.all });
    },
  });
};

export const useArchiveMastery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (progressId: string) => masteryAPI.archiveProgress(progressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mastery.all });
    },
  });
};

// Optimistic Updates Hook
export const useOptimisticMasteryUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateMasteryRequest) => masteryAPI.updateProgress(data),
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.mastery.student(data.studentId) 
      });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(
        QUERY_KEYS.mastery.student(data.studentId)
      );
      
      // Optimistically update
      queryClient.setQueryData(
        QUERY_KEYS.mastery.student(data.studentId),
        (old: any) => {
          if (!old) return old;
          
          // Update the specific progress record
          const updatedProgressBySubject = old.progressBySubject.map((subject: any) => ({
            ...subject,
            records: subject.records.map((record: any) => 
              record.outcomeId === data.outcomeId
                ? {
                    ...record,
                    currentLevel: data.currentLevel,
                    previousLevel: record.currentLevel,
                    lastAssessmentDate: new Date().toISOString(),
                    areasForGrowth: data.areasForGrowth,
                    strengths: data.strengths,
                    teacherNotes: data.teacherNotes,
                  }
                : record
            )
          }));
          
          return {
            ...old,
            progressBySubject: updatedProgressBySubject,
          };
        }
      );
      
      return { previousData };
    },
    onError: (error, data, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.mastery.student(data.studentId),
          context.previousData
        );
      }
    },
    onSettled: (result, error, data) => {
      // Refresh data regardless of success/failure
      void queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.mastery.student(data.studentId) 
      });
    },
  });
};

// Custom hook for managing upload progress
export const useUploadProgress = () => {
  return {
    // Could integrate with a global upload progress state here
    // For now, just return the mutation status
  };
};

// Export all hooks for convenience
export const studentAssessmentHooks = {
  // Students
  useStudents,
  useStudent,
  useStudentSummary,
  useCreateStudent,
  useUpdateStudent,
  useDeactivateStudent,
  
  // Artifacts
  useArtifacts,
  useStudentArtifacts,
  useArtifact,
  useUploadArtifact,
  useCreateNote,
  useUpdateArtifact,
  useDeleteArtifact,
  useTagArtifactWithOutcome,
  
  // Mastery
  useStudentMastery,
  useOutcomeMastery,
  useMasteryAnalytics,
  useUpdateMastery,
  useBatchUpdateMastery,
  useOptimisticMasteryUpdate,
  useShareWithParents,
  useArchiveMastery,
  
  // Utilities
  useUploadProgress,
};