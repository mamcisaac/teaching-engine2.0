import { apiClient } from '../../api/core/client';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  dateOfBirth: string;
  grade: number;
  program: string;
  hasIEP: boolean;
  iepGoals?: string[];
  accommodations?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assessmentCount?: number;
  lastAssessment?: string;
  status: 'active' | 'archived';
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  studentId: string;
  dateOfBirth: string;
  grade: number;
  program: string;
  hasIEP: boolean;
  iepGoals?: string[];
  accommodations?: string[];
  notes?: string;
}

export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const response = await apiClient.get<Student[]>('/api/students');
    return response.data;
  },

  async getById(id: string): Promise<Student> {
    const response = await apiClient.get<Student>(`/api/students/${id}`);
    return response.data;
  },

  async create(student: CreateStudentDto): Promise<Student> {
    const response = await apiClient.post<Student>('/api/students', student);
    return response.data;
  },

  async update(id: string, student: Partial<CreateStudentDto>): Promise<Student> {
    const response = await apiClient.put<Student>(`/api/students/${id}`, student);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/students/${id}`);
  },

  async importFromCSV(file: File): Promise<Student[]> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Student[]>('/api/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProgress(id: string): Promise<any> {
    const response = await apiClient.get(`/api/students/${id}/progress`);
    return response.data;
  },
};