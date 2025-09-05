import { apiClient } from '../api/core/client';
import type {
  StudentAssessment,
  CreateStudentAssessmentRequest,
  UpdateStudentAssessmentRequest,
  DifferentiationGroups,
  DifferentiationGroupsRequest,
  StudentAssessmentFilters
} from '../types/studentAssessment';

const STUDENT_ASSESSMENTS_BASE_URL = '/api/student-assessments';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentAssessmentFiltersWithPagination extends StudentAssessmentFilters {
  page?: number;
  limit?: number;
}

export const quickAssessmentAPI = {
  // Get assessments with optional filters and pagination
  async getAssessments(filters?: StudentAssessmentFiltersWithPagination): Promise<PaginatedResponse<StudentAssessment>> {
    const params = new URLSearchParams();
    
    if (filters?.studentId) {
      params.append('studentId', filters.studentId);
    }
    if (filters?.subject) {
      params.append('subject', filters.subject);
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    
    const url = params.toString() 
      ? `${STUDENT_ASSESSMENTS_BASE_URL}?${params.toString()}`
      : STUDENT_ASSESSMENTS_BASE_URL;
      
    const response = await apiClient.get(url);
    return response.data;
  },

  // Create a new assessment
  async createAssessment(assessment: CreateStudentAssessmentRequest): Promise<StudentAssessment> {
    const response = await apiClient.post(STUDENT_ASSESSMENTS_BASE_URL, assessment);
    return response.data;
  },

  // Update an existing assessment
  async updateAssessment(id: string, updates: UpdateStudentAssessmentRequest): Promise<StudentAssessment> {
    const response = await apiClient.put(`${STUDENT_ASSESSMENTS_BASE_URL}/${id}`, updates);
    return response.data;
  },

  // Delete an assessment
  async deleteAssessment(id: string): Promise<void> {
    await apiClient.delete(`${STUDENT_ASSESSMENTS_BASE_URL}/${id}`);
  },

  // Generate differentiation groups
  async getDifferentiationGroups(request: DifferentiationGroupsRequest): Promise<DifferentiationGroups> {
    const response = await apiClient.post(`${STUDENT_ASSESSMENTS_BASE_URL}/differentiation-groups`, request);
    return response.data;
  },

  // Batch operations
  async createMultipleAssessments(assessments: CreateStudentAssessmentRequest[]): Promise<StudentAssessment[]> {
    const promises = assessments.map(assessment => this.createAssessment(assessment));
    return Promise.all(promises);
  },

  async updateMultipleAssessments(updates: Array<{ id: string; data: UpdateStudentAssessmentRequest }>): Promise<StudentAssessment[]> {
    const promises = updates.map(({ id, data }) => this.updateAssessment(id, data));
    return Promise.all(promises);
  }
};