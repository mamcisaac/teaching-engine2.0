import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

// Student Query Hooks
export const useStudents = () =>
  useQuery({
    queryKey: queryKeys.student.all,
    queryFn: studentApi.getStudents,
  });

export const useStudent = (id: number) => {
  return useQuery({
    queryKey: queryKeys.student.detail(id),
    queryFn: () => studentApi.getStudent(id),
    enabled: !!id,
  });
};

export const useStudentGoals = (studentId: number) => {
  return useQuery({
    queryKey: queryKeys.student.goals(studentId),
    queryFn: () => studentApi.getStudentGoals(studentId),
    enabled: !!studentId,
  });
};

export const useStudentReflections = (studentId: number) =>
  useQuery({
    queryKey: queryKeys.student.reflections(studentId),
    queryFn: () => studentApi.getStudentReflections(studentId),
    enabled: !!studentId,
  });

export const useStudentParentSummaries = (studentId: number) => {
  return useQuery({
    queryKey: queryKeys.student.parentSummaries(studentId),
    queryFn: () => studentApi.getStudentParentSummaries(studentId),
    enabled: !!studentId,
  });
};

// Student Mutation Hooks
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudent,
    onSuccess: () => {
      showSuccessToast('Student created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create student'),
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateStudent,
    onSuccess: (data) => {
      showSuccessToast('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.student.detail(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update student'),
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudent,
    onSuccess: () => {
      showSuccessToast('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete student'),
  });
};

// Student Goal Mutation Hooks
export const useCreateStudentGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudentGoal,
    onSuccess: (data) => {
      showSuccessToast('Goal created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.goals(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to create goal'),
  });
};

export const useUpdateStudentGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateStudentGoal,
    onSuccess: (data) => {
      showSuccessToast('Goal updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.goals(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to update goal'),
  });
};

export const useDeleteStudentGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudentGoal,
    onSuccess: () => {
      showSuccessToast('Goal deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete goal'),
  });
};

// Student Reflection Mutation Hooks
export const useCreateStudentReflection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.createStudentReflection,
    onSuccess: (data) => {
      showSuccessToast('Reflection created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.reflections(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to create reflection'),
  });
};

export const useDeleteStudentReflection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteStudentReflection,
    onSuccess: () => {
      showSuccessToast('Reflection deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete reflection'),
  });
};

// Parent Summary Mutation Hooks
export const useGenerateParentSummary = () => {
  return useMutation({
    mutationFn: studentApi.generateParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary generated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to generate parent summary'),
  });
};

export const useSaveParentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.saveParentSummary,
    onSuccess: (data) => {
      showSuccessToast('Parent summary saved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.parentSummaries(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to save parent summary'),
  });
};

export const useUpdateParentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateParentSummary,
    onSuccess: (data) => {
      showSuccessToast('Parent summary updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.parentSummaries(data.studentId) });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent summary'),
  });
};

export const useRegenerateParentSummary = () => {
  return useMutation({
    mutationFn: studentApi.regenerateParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary regenerated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to regenerate parent summary'),
  });
};

export const useDeleteParentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.deleteParentSummary,
    onSuccess: () => {
      showSuccessToast('Parent summary deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent summary'),
  });
};