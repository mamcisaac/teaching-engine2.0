import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { studentApi } from './api';

import type { 
  Student, 
  StudentInput, 
  StudentGoal, 
  StudentGoalInput,
  StudentReflection,
  StudentReflectionInput,
  ParentSummary,
  ParentSummaryGeneration,
  GenerateParentSummaryRequest,
  SaveParentSummaryRequest
} from '../../../types';

// Student Query Hooks
export const useStudents = (): UseQueryResult<Student[], Error> =>
  useQuery({
    queryKey: queryKeys.student.all,
    queryFn: studentApi.getStudents,
  });

export const useStudent = (id: number): UseQueryResult<Student, Error> => useQuery({
    queryKey: queryKeys.student.detail(id),
    queryFn: () => studentApi.getStudent(id),
    enabled: !!id,
  });

export const useStudentGoals = (studentId: number): UseQueryResult<StudentGoal[], Error> => useQuery({
    queryKey: queryKeys.student.goals(studentId),
    queryFn: () => studentApi.getStudentGoals(studentId),
    enabled: !!studentId,
  });

export const useStudentReflections = (studentId: number): UseQueryResult<StudentReflection[], Error> =>
  useQuery({
    queryKey: queryKeys.student.reflections(studentId),
    queryFn: () => studentApi.getStudentReflections(studentId),
    enabled: !!studentId,
  });

export const useStudentParentSummaries = (studentId: number): UseQueryResult<ParentSummary[], Error> => useQuery({
    queryKey: queryKeys.student.parentSummaries(studentId),
    queryFn: () => studentApi.getStudentParentSummaries(studentId),
    enabled: !!studentId,
  });

// Student Mutation Hooks
export const useCreateStudent = (): UseMutationResult<Student, Error, StudentInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudent,
    onSuccess: () => {
      showSuccessToast('Student created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create student'),
  });
};

export const useUpdateStudent = (): UseMutationResult<Student, Error, StudentInput & { id: number }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateStudent,
    onSuccess: (data) => {
      showSuccessToast('Student updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.detail(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update student'),
  });
};

export const useDeleteStudent = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudent,
    onSuccess: () => {
      showSuccessToast('Student deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete student'),
  });
};

// Student Goal Mutation Hooks
export const useCreateStudentGoal = (): UseMutationResult<StudentGoal, Error, StudentGoalInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudentGoal,
    onSuccess: (data) => {
      showSuccessToast('Goal created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.goals(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to create goal'),
  });
};

export const useUpdateStudentGoal = (): UseMutationResult<StudentGoal, Error, StudentGoalInput & { id: number }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateStudentGoal,
    onSuccess: (data) => {
      showSuccessToast('Goal updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.goals(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to update goal'),
  });
};

export const useDeleteStudentGoal = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudentGoal,
    onSuccess: () => {
      showSuccessToast('Goal deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete goal'),
  });
};

// Student Reflection Mutation Hooks
export const useCreateStudentReflection = (): UseMutationResult<StudentReflection, Error, StudentReflectionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudentReflection,
    onSuccess: (data) => {
      showSuccessToast('Reflection created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.reflections(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to create reflection'),
  });
};

export const useDeleteStudentReflection = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudentReflection,
    onSuccess: () => {
      showSuccessToast('Reflection deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete reflection'),
  });
};

// Parent Summary Mutation Hooks
export const useGenerateParentSummary = (): UseMutationResult<ParentSummaryGeneration, Error, GenerateParentSummaryRequest> => useMutation({
    mutationFn: studentApi.generateParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary generated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to generate parent summary'),
  });

export const useSaveParentSummary = (): UseMutationResult<ParentSummary, Error, SaveParentSummaryRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.saveParentSummary,
    onSuccess: (data) => {
      showSuccessToast('Parent summary saved successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.parentSummaries(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to save parent summary'),
  });
};

export const useUpdateParentSummary = (): UseMutationResult<ParentSummary, Error, { id: number; content: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateParentSummary,
    onSuccess: (data) => {
      showSuccessToast('Parent summary updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.parentSummaries(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent summary'),
  });
};

export const useRegenerateParentSummary = (): UseMutationResult<ParentSummaryGeneration, Error, number> => useMutation({
    mutationFn: studentApi.regenerateParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary regenerated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to regenerate parent summary'),
  });

export const useDeleteParentSummary = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent summary'),
  });
};