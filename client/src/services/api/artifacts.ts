import { apiClient } from '../../api/core/client';

export interface Artifact {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  studentId?: string;
  assessmentIds?: string[];
  tags?: string[];
  description?: string;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtifactDto {
  file: File;
  studentId?: string;
  tags?: string[];
  description?: string;
}

export interface ArtifactSearchParams {
  studentId?: string;
  tags?: string[];
  fileType?: string;
  startDate?: string;
  endDate?: string;
}

export const artifactsApi = {
  async getAll(params?: ArtifactSearchParams): Promise<Artifact[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    const response = await apiClient.get<Artifact[]>(`/api/artifacts?${queryParams.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Artifact> {
    const response = await apiClient.get<Artifact>(`/api/artifacts/${id}`);
    return response.data;
  },

  async upload(data: CreateArtifactDto): Promise<Artifact> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.studentId) formData.append('studentId', data.studentId);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.description) formData.append('description', data.description);

    const response = await apiClient.post<Artifact>('/api/artifacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadBatch(files: File[], studentId?: string): Promise<Artifact[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (studentId) formData.append('studentId', studentId);

    const response = await apiClient.post<Artifact[]>('/api/artifacts/upload-batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: string, data: Partial<Artifact>): Promise<Artifact> {
    const response = await apiClient.put<Artifact>(`/api/artifacts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/artifacts/${id}`);
  },

  async linkToAssessment(artifactId: string, assessmentId: string): Promise<void> {
    await apiClient.post(`/api/artifacts/${artifactId}/link-assessment`, { assessmentId });
  },

  async unlinkFromAssessment(artifactId: string, assessmentId: string): Promise<void> {
    await apiClient.post(`/api/artifacts/${artifactId}/unlink-assessment`, { assessmentId });
  },
};