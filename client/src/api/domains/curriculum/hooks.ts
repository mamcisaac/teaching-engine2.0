import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curriculumApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core';

// Subject Query Hooks
export const useSubjects = () =>
  useQuery({
    queryKey: queryKeys.curriculum.subjects,
    queryFn: curriculumApi.getSubjects,
  });

export const useSubject = (id: number) =>
  useQuery({
    queryKey: queryKeys.curriculum.subject(id),
    queryFn: () => curriculumApi.getSubject(id),
    enabled: !!id,
  });

export const useStrands = (subjectId: number) =>
  useQuery({
    queryKey: ['subject-strands', subjectId],
    queryFn: () => curriculumApi.getStrands(subjectId),
    enabled: !!subjectId,
  });

export const useTopics = (subjectId: number, strand: string) =>
  useQuery({
    queryKey: ['subject-topics', subjectId, strand],
    queryFn: () => curriculumApi.getTopics(subjectId, strand),
    enabled: !!subjectId && !!strand,
  });

// Curriculum Expectations Query Hooks
export const useCurriculumExpectations = (filters?: {
  subjectId?: number;
  grade?: number;
  strand?: string;
  keyword?: string;
}) =>
  useQuery({
    queryKey: queryKeys.curriculum.expectations(filters),
    queryFn: () => curriculumApi.getCurriculumExpectations(filters),
  });

export const useCurriculumExpectation = (id: number) =>
  useQuery({
    queryKey: ['curriculum-expectation', id],
    queryFn: () => curriculumApi.getCurriculumExpectation(id),
    enabled: !!id,
  });

// Thematic Units Query Hooks
export const useThematicUnits = (filters?: {
  grade?: number;
  subject?: string;
  theme?: string;
  userId?: number;
}) =>
  useQuery({
    queryKey: queryKeys.curriculum.thematicUnits(filters),
    queryFn: () => curriculumApi.getThematicUnits(filters),
  });

export const useThematicUnit = (id: number) =>
  useQuery({
    queryKey: queryKeys.curriculum.thematicUnit(id),
    queryFn: () => curriculumApi.getThematicUnit(id),
    enabled: !!id,
  });

// Search Hook
export const useSearchCurriculum = (
  query: string,
  options?: {
    subjects?: string[];
    grades?: number[];
    strands?: string[];
  }
) =>
  useQuery({
    queryKey: ['curriculum-search', query, options],
    queryFn: () => curriculumApi.searchCurriculum(query, options),
    enabled: !!query && query.length > 2,
  });

// Subject Mutation Hooks
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createSubject,
    onSuccess: () => {
      showSuccessToast('Subject created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to create subject'),
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateSubject,
    onSuccess: (data) => {
      showSuccessToast('Subject updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subject(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update subject'),
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteSubject,
    onSuccess: () => {
      showSuccessToast('Subject deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to delete subject'),
  });
};

// Curriculum Expectation Mutation Hooks
export const useCreateCurriculumExpectation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createCurriculumExpectation,
    onSuccess: () => {
      showSuccessToast('Curriculum expectation created successfully');
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create curriculum expectation'),
  });
};

export const useUpdateCurriculumExpectation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateCurriculumExpectation,
    onSuccess: (data) => {
      showSuccessToast('Curriculum expectation updated successfully');
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectation', data.id] });
    },
    onError: (error) => handleApiError(error, 'Failed to update curriculum expectation'),
  });
};

export const useDeleteCurriculumExpectation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteCurriculumExpectation,
    onSuccess: () => {
      showSuccessToast('Curriculum expectation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete curriculum expectation'),
  });
};

// Thematic Unit Mutation Hooks
export const useCreateThematicUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit created successfully');
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create thematic unit'),
  });
};

export const useUpdateThematicUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateThematicUnit,
    onSuccess: (data) => {
      showSuccessToast('Thematic unit updated successfully');
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.thematicUnit(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update thematic unit'),
  });
};

export const useDeleteThematicUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete thematic unit'),
  });
};

export const useDuplicateThematicUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.duplicateThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to duplicate thematic unit'),
  });
};

// Import/Export Hooks
export const useImportCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'pdf' | 'docx' }) =>
      curriculumApi.importCurriculum(file, format),
    onSuccess: (data) => {
      showSuccessToast(`Imported ${data.imported} curriculum items successfully`);
      if (data.failed > 0) {
        showSuccessToast(`${data.failed} items failed to import`);
      }
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to import curriculum'),
  });
};

export const useExportCurriculum = () => {
  return useMutation({
    mutationFn: curriculumApi.exportCurriculum,
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `curriculum-export.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Curriculum exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export curriculum'),
  });
};