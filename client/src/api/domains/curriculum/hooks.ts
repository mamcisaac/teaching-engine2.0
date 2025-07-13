import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { Subject, CurriculumExpectation, ThematicUnit } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { curriculumApi } from './api';

// Subject Query Hooks
export const useSubjects = (): UseQueryResult<Subject[], Error> =>
  useQuery({
    queryKey: queryKeys.curriculum.subjects,
    queryFn: curriculumApi.getSubjects,
  });

export const useSubject = (id: number): UseQueryResult<Subject, Error> =>
  useQuery({
    queryKey: queryKeys.curriculum.subject(id),
    queryFn: () => curriculumApi.getSubject(id),
    enabled: id !== 0,
  });

export const useStrands = (subjectId: number): UseQueryResult<string[], Error> =>
  useQuery({
    queryKey: ['subject-strands', subjectId],
    queryFn: () => curriculumApi.getStrands(subjectId),
    enabled: subjectId !== 0,
  });

export const useTopics = (subjectId: number, strand: string): UseQueryResult<string[], Error> =>
  useQuery({
    queryKey: ['subject-topics', subjectId, strand],
    queryFn: () => curriculumApi.getTopics(subjectId, strand),
    enabled: subjectId !== 0 && strand !== '',
  });

// Curriculum Expectations Query Hooks
export const useCurriculumExpectations = (filters?: {
  subjectId?: number;
  grade?: number;
  strand?: string;
  keyword?: string;
}): UseQueryResult<CurriculumExpectation[], Error> =>
  useQuery({
    queryKey: queryKeys.curriculum.expectations(filters),
    queryFn: () => curriculumApi.getCurriculumExpectations(filters),
  });

export const useCurriculumExpectation = (id: number): UseQueryResult<CurriculumExpectation, Error> =>
  useQuery({
    queryKey: ['curriculum-expectation', id],
    queryFn: () => curriculumApi.getCurriculumExpectation(id),
    enabled: id !== 0,
  });

// Thematic Units Query Hooks
export const useThematicUnits = (filters?: {
  grade?: number;
  subject?: string;
  theme?: string;
  userId?: number;
}): UseQueryResult<ThematicUnit[], Error> =>
  useQuery({
    queryKey: queryKeys.curriculum.thematicUnits(filters),
    queryFn: () => curriculumApi.getThematicUnits(filters),
  });

export const useThematicUnit = (id: number): UseQueryResult<ThematicUnit, Error> =>
  useQuery({
    queryKey: queryKeys.curriculum.thematicUnit(id),
    queryFn: () => curriculumApi.getThematicUnit(id),
    enabled: id !== 0,
  });

// Search Hook
export const useSearchCurriculum = (
  query: string,
  options?: {
    subjects?: string[];
    grades?: number[];
    strands?: string[];
  }
): UseQueryResult<{
  expectations: CurriculumExpectation[];
  units: ThematicUnit[];
}, Error> =>
  useQuery({
    queryKey: ['curriculum-search', query, options],
    queryFn: () => curriculumApi.searchCurriculum(query, options),
    enabled: query.length > 2,
  });

// Subject Mutation Hooks
export const useCreateSubject = (): UseMutationResult<Subject, Error, Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createSubject,
    onSuccess: () => {
      showSuccessToast('Subject created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to create subject'),
  });
};

export const useUpdateSubject = (): UseMutationResult<Subject, Error, Subject> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateSubject,
    onSuccess: (data) => {
      showSuccessToast('Subject updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subject(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update subject'),
  });
};

export const useDeleteSubject = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteSubject,
    onSuccess: () => {
      showSuccessToast('Subject deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to delete subject'),
  });
};

// Curriculum Expectation Mutation Hooks
export const useCreateCurriculumExpectation = (): UseMutationResult<CurriculumExpectation, Error, Omit<CurriculumExpectation, 'id'>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createCurriculumExpectation,
    onSuccess: () => {
      showSuccessToast('Curriculum expectation created successfully');
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create curriculum expectation'),
  });
};

export const useUpdateCurriculumExpectation = (): UseMutationResult<CurriculumExpectation, Error, CurriculumExpectation> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateCurriculumExpectation,
    onSuccess: (data) => {
      showSuccessToast('Curriculum expectation updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectation', data.id] });
    },
    onError: (error) => handleApiError(error, 'Failed to update curriculum expectation'),
  });
};

export const useDeleteCurriculumExpectation = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteCurriculumExpectation,
    onSuccess: () => {
      showSuccessToast('Curriculum expectation deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete curriculum expectation'),
  });
};

// Thematic Unit Mutation Hooks
export const useCreateThematicUnit = (): UseMutationResult<ThematicUnit, Error, Omit<ThematicUnit, 'id' | 'createdAt' | 'updatedAt'>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.createThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit created successfully');
      void queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create thematic unit'),
  });
};

export const useUpdateThematicUnit = (): UseMutationResult<ThematicUnit, Error, ThematicUnit> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.updateThematicUnit,
    onSuccess: (data) => {
      showSuccessToast('Thematic unit updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.thematicUnit(data.id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update thematic unit'),
  });
};

export const useDeleteThematicUnit = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.deleteThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete thematic unit'),
  });
};

export const useDuplicateThematicUnit = (): UseMutationResult<ThematicUnit, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: curriculumApi.duplicateThematicUnit,
    onSuccess: () => {
      showSuccessToast('Thematic unit duplicated successfully');
      void queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
    },
    onError: (error) => handleApiError(error, 'Failed to duplicate thematic unit'),
  });
};

// Import/Export Hooks
export const useImportCurriculum = (): UseMutationResult<{
  imported: number;
  failed: number;
  errors?: string[];
}, Error, { file: File; format: 'csv' | 'pdf' | 'docx' }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'pdf' | 'docx' }) =>
      curriculumApi.importCurriculum(file, format),
    onSuccess: (data) => {
      showSuccessToast(`Imported ${data.imported} curriculum items successfully`);
      if (data.failed > 0) {
        console.warn(`${data.failed} items failed to import`);
      }
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.subjects });
    },
    onError: (error) => handleApiError(error, 'Failed to import curriculum'),
  });
};

export const useExportCurriculum = (): UseMutationResult<Blob, Error, {
  subjectIds?: number[];
  grades?: number[];
  format: 'csv' | 'pdf' | 'json';
}> => useMutation({
    mutationFn: curriculumApi.exportCurriculum,
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(data);
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