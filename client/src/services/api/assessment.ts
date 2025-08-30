import { apiClient } from '../../api/core/client';

export interface Assessment {
  id: string;
  studentId: string;
  teacherId: number;
  subject: string;
  expectation: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  evidenceType: 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
  artifacts?: string[];
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentDto {
  studentId: string;
  subject: string;
  expectation: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  evidenceType: 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
  artifacts?: string[];
  notes?: string;
  date?: string;
}

export interface EvidenceBalance {
  observation: number;
  conversation: number;
  product: number;
  total: number;
}

export const assessmentApi = {
  async getAll(studentId?: string): Promise<Assessment[]> {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await apiClient.get<Assessment[]>(`/api/assessments${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Assessment> {
    const response = await apiClient.get<Assessment>(`/api/assessments/${id}`);
    return response.data;
  },

  async create(assessment: CreateAssessmentDto): Promise<Assessment> {
    const response = await apiClient.post<Assessment>('/api/assessments', assessment);
    return response.data;
  },

  async createBulk(assessments: CreateAssessmentDto[]): Promise<Assessment[]> {
    const response = await apiClient.post<Assessment[]>('/api/assessments/bulk', { assessments });
    return response.data;
  },

  async update(id: string, assessment: Partial<CreateAssessmentDto>): Promise<Assessment> {
    const response = await apiClient.put<Assessment>(`/api/assessments/${id}`, assessment);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/assessments/${id}`);
  },

  async getEvidenceBalance(studentId: string): Promise<EvidenceBalance> {
    const response = await apiClient.get<EvidenceBalance>(`/api/assessments/evidence-balance/${studentId}`);
    return response.data;
  },

  async getByExpectation(expectationId: string): Promise<Assessment[]> {
    const response = await apiClient.get<Assessment[]>(`/api/assessments/by-expectation/${expectationId}`);
    return response.data;
  },
};