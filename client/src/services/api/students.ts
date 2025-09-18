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
  studentId?: string;
  dateOfBirth?: string;
  grade?: number | string;
  program?: string;
  hasIEP?: boolean;
  iepGoals?: string[];
  accommodations?: string[];
  notes?: string;
}

export interface StudentProgress {
  studentId: string;
  overallProgress: number;
  subjects: Record<string, {
    currentLevel: string;
    trend: 'improving' | 'stable' | 'declining';
    assessmentCount: number;
    lastAssessment?: string;
  }>;
  recentAssessments: {
    id: string;
    date: string;
    subject: string;
    outcome: string;
    level: string;
  }[];
}

export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const response = await apiClient.get<{ students: Student[], total: number } | Student[]>('/api/students');
    return Array.isArray(response.data) ? response.data : response.data.students || [];
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

  async deleteAll(): Promise<{ deleted: number } | void> {
    const response = await apiClient.delete<{ deleted: number }>(`/api/students`);
    return response.data;
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

  async getProgress(id: string): Promise<StudentProgress> {
    const response = await apiClient.get<StudentProgress>(`/api/students/${id}/progress`);
    return response.data;
  },
};