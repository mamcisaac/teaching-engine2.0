import { apiClient } from '../../api/core/client';

export interface Note {
  id: string;
  studentId: string;
  teacherId: number;
  content: string;
  lessonPlanId?: string;
  lessonTitle?: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateNoteDto {
  studentId: string;
  content: string;
  lessonPlanId?: string;
  lessonTitle?: string;
  subject?: string;
}

export interface UpdateNoteDto {
  content?: string;
  lessonPlanId?: string;
  lessonTitle?: string;
  subject?: string;
}

export interface NoteFilters {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotes {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface BulkNoteDto {
  studentIds: string[];
  content: string;
  lessonPlanId?: string;
  lessonTitle?: string;
  subject?: string;
}

export const notesApi = {
  async getAll(filters?: NoteFilters): Promise<PaginatedNotes> {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = `/api/notes${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<PaginatedNotes>(url);
    return response.data;
  },

  async getById(id: string): Promise<Note> {
    const response = await apiClient.get<Note>(`/api/notes/${id}`);
    return response.data;
  },

  async create(note: CreateNoteDto): Promise<Note> {
    const response = await apiClient.post<Note>('/api/notes', note);
    return response.data;
  },

  async createBulk(data: BulkNoteDto): Promise<{ message: string; notes: Note[] }> {
    const response = await apiClient.post<{ message: string; notes: Note[] }>('/api/notes/bulk', data);
    return response.data;
  },

  async update(id: string, note: UpdateNoteDto): Promise<Note> {
    const response = await apiClient.put<Note>(`/api/notes/${id}`, note);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/notes/${id}`);
  },
};