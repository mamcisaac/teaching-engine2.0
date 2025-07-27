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
import { apiClient } from '../../core/client';

// API endpoints
export const studentApi = {
  // Students
  getStudents: async (): Promise<Student[]> => {
    const { data } = await apiClient.get<Student[]>('/api/students');
    return data;
  },

  getStudent: async (id: number): Promise<Student> => {
    const { data } = await apiClient.get<Student>(`/api/students/${id}`);
    return data;
  },

  createStudent: async (input: StudentInput): Promise<Student> => {
    const { data } = await apiClient.post<Student>('/api/students', input);
    return data;
  },

  updateStudent: async ({ id, ...input }: StudentInput & { id: number }): Promise<Student> => {
    const { data } = await apiClient.put<Student>(`/api/students/${id}`, input);
    return data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/students/${id}`);
  },

  // Student Goals
  getStudentGoals: async (studentId: number): Promise<StudentGoal[]> => {
    const { data } = await apiClient.get<StudentGoal[]>(`/api/students/${studentId}/goals`);
    return data;
  },

  createStudentGoal: async (input: StudentGoalInput): Promise<StudentGoal> => {
    const { data } = await apiClient.post<StudentGoal>('/api/student-goals', input);
    return data;
  },

  updateStudentGoal: async ({ id, ...input }: StudentGoalInput & { id: number }): Promise<StudentGoal> => {
    const { data } = await apiClient.put<StudentGoal>(`/api/student-goals/${id}`, input);
    return data;
  },

  deleteStudentGoal: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/student-goals/${id}`);
  },

  // Student Reflections
  getStudentReflections: async (studentId: number): Promise<StudentReflection[]> => {
    const { data } = await apiClient.get<StudentReflection[]>(`/api/students/${studentId}/reflections`);
    return data;
  },

  createStudentReflection: async (input: StudentReflectionInput): Promise<StudentReflection> => {
    const { data } = await apiClient.post<StudentReflection>('/api/student-reflections', input);
    return data;
  },

  deleteStudentReflection: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/student-reflections/${id}`);
  },

  // Parent Summaries
  getStudentParentSummaries: async (studentId: number): Promise<ParentSummary[]> => {
    const { data } = await apiClient.get<ParentSummary[]>(`/api/students/${studentId}/parent-summaries`);
    return data;
  },

  generateParentSummary: async (input: GenerateParentSummaryRequest): Promise<ParentSummaryGeneration> => {
    const { data } = await apiClient.post<ParentSummaryGeneration>('/api/parent-summaries/generate', input);
    return data;
  },

  saveParentSummary: async (input: SaveParentSummaryRequest): Promise<ParentSummary> => {
    const { data } = await apiClient.post<ParentSummary>('/api/parent-summaries', input);
    return data;
  },

  updateParentSummary: async ({ id, ...input }: { id: number } & Partial<SaveParentSummaryRequest>): Promise<ParentSummary> => {
    const { data } = await apiClient.put<ParentSummary>(`/api/parent-summaries/${id}`, input);
    return data;
  },

  regenerateParentSummary: async (id: number): Promise<ParentSummaryGeneration> => {
    const { data } = await apiClient.post<ParentSummaryGeneration>(`/api/parent-summaries/${id}/regenerate`);
    return data;
  },

  deleteParentSummary: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/parent-summaries/${id}`);
  },
};