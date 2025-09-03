/**
 * Student Assessment API Client
 * Type-safe API functions for ETFO student assessment system
 */

import type {
  Student,
  StudentSummary,
  StudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentsFilters,
  StudentArtifact,
  ArtifactsResponse,
  CreateArtifactRequest,
  ArtifactsFilters,
  StudentOutcomeProgress,
  UpdateMasteryRequest,
  BatchMasteryUpdateRequest,
  StudentMasteryResponse,
  OutcomeMasteryResponse,
  MasteryAnalyticsResponse,
  MasteryFilters,
  AnalyticsFilters,
  TagOutcomeRequest,
  UploadResult,
  BatchUploadResult,
  APIError
} from '../types/studentAssessment';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Generic API client function with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData: APIError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(errorData.error || 'API request failed');
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Students API
export const studentsAPI = {
  // Get all students with filtering
  async getStudents(filters: StudentsFilters = {}): Promise<StudentsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<StudentsResponse>(`/students${queryString ? `?${queryString}` : ''}`);
  },

  // Get specific student by ID
  async getStudent(id: string): Promise<StudentSummary> {
    return apiRequest<StudentSummary>(`/students/${id}`);
  },

  // Create new student
  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return apiRequest<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update student
  async updateStudent(id: string, data: UpdateStudentRequest): Promise<Student> {
    return apiRequest<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deactivate student (soft delete)
  async deactivateStudent(id: string): Promise<void> {
    return apiRequest<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Get student's artifacts
  async getStudentArtifacts(
    studentId: string, 
    filters: Omit<ArtifactsFilters, 'studentId'> = {}
  ): Promise<ArtifactsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<ArtifactsResponse>(
      `/students/${studentId}/artifacts${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get student's progress
  async getStudentProgress(
    studentId: string, 
    filters: MasteryFilters = {}
  ): Promise<StudentMasteryResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<StudentMasteryResponse>(
      `/students/${studentId}/progress${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get student summary
  async getStudentSummary(studentId: string): Promise<any> {
    return apiRequest<any>(`/students/${studentId}/summary`);
  }
};

// Artifacts API
export const artifactsAPI = {
  // Get all artifacts with filtering
  async getArtifacts(filters: ArtifactsFilters = {}): Promise<ArtifactsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<ArtifactsResponse>(`/artifacts${queryString ? `?${queryString}` : ''}`);
  },

  // Get specific artifact by ID
  async getArtifact(id: string): Promise<StudentArtifact> {
    return apiRequest<StudentArtifact>(`/artifacts/${id}`);
  },

  // Upload photo
  async uploadPhoto(formData: FormData): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/upload/photo', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },

  // Upload video
  async uploadVideo(formData: FormData): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/upload/video', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Upload audio
  async uploadAudio(formData: FormData): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/upload/audio', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Upload document
  async uploadDocument(formData: FormData): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/upload/document', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Mobile-friendly upload
  async uploadMobile(formData: FormData): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/upload/mobile', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Batch upload
  async uploadBatch(formData: FormData): Promise<BatchUploadResult> {
    return apiRequest<BatchUploadResult>('/artifacts/upload/batch', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Create text note
  async createNote(data: CreateArtifactRequest): Promise<UploadResult> {
    return apiRequest<UploadResult>('/artifacts/note', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update artifact metadata
  async updateArtifact(
    id: string, 
    data: Partial<CreateArtifactRequest>
  ): Promise<StudentArtifact> {
    return apiRequest<StudentArtifact>(`/artifacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete artifact
  async deleteArtifact(id: string): Promise<void> {
    return apiRequest<void>(`/artifacts/${id}`, {
      method: 'DELETE',
    });
  },

  // Tag artifact with outcome
  async tagWithOutcome(
    artifactId: string, 
    data: TagOutcomeRequest
  ): Promise<any> {
    return apiRequest<any>(`/artifacts/${artifactId}/outcomes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update outcome tagging
  async updateOutcomeTag(
    artifactId: string,
    outcomeId: string,
    data: Partial<TagOutcomeRequest>
  ): Promise<any> {
    return apiRequest<any>(`/artifacts/${artifactId}/outcomes/${outcomeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove outcome tagging
  async removeOutcomeTag(artifactId: string, outcomeId: string): Promise<void> {
    return apiRequest<void>(`/artifacts/${artifactId}/outcomes/${outcomeId}`, {
      method: 'DELETE',
    });
  }
};

// Mastery Tracking API
export const masteryAPI = {
  // Update mastery progress
  async updateProgress(data: UpdateMasteryRequest): Promise<StudentOutcomeProgress> {
    return apiRequest<StudentOutcomeProgress>('/mastery/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Batch update mastery progress
  async batchUpdateProgress(data: BatchMasteryUpdateRequest): Promise<{
    message: string;
    updated: number;
    total: number;
    results: Partial<StudentOutcomeProgress>[];
  }> {
    return apiRequest('/mastery/batch-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get student mastery overview
  async getStudentMastery(
    studentId: string,
    filters: MasteryFilters = {}
  ): Promise<StudentMasteryResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<StudentMasteryResponse>(
      `/mastery/student/${studentId}${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get outcome mastery across all students
  async getOutcomeMastery(
    outcomeId: string,
    includeArchived = false
  ): Promise<OutcomeMasteryResponse> {
    const params = new URLSearchParams();
    if (includeArchived) params.append('includeArchived', 'true');
    
    const queryString = params.toString();
    return apiRequest<OutcomeMasteryResponse>(
      `/mastery/outcome/${outcomeId}${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get mastery analytics
  async getAnalytics(filters: AnalyticsFilters = {}): Promise<MasteryAnalyticsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<MasteryAnalyticsResponse>(`/mastery/analytics${queryString ? `?${queryString}` : ''}`);
  },

  // Share progress with parents
  async shareWithParents(progressIds: string[]): Promise<{
    message: string;
    sharedCount: number;
    totalRequested: number;
  }> {
    return apiRequest('/mastery/share-with-parents', {
      method: 'POST',
      body: JSON.stringify({ progressIds }),
    });
  },

  // Archive progress record
  async archiveProgress(progressId: string): Promise<void> {
    return apiRequest<void>(`/mastery/${progressId}`, {
      method: 'DELETE',
    });
  }
};

// Analytics API
export const analyticsAPI = {
  // Get class overview analytics
  async getClassOverview(): Promise<any> {
    return apiRequest<any>('/analytics/class-overview');
  },

  // Get evidence triangulation analysis
  async getEvidenceTriangulation(): Promise<any> {
    return apiRequest<any>('/analytics/evidence-triangulation');
  },

  // Get progress trends
  async getProgressTrends(filters: {
    timeframe?: 'week' | 'month' | 'term' | 'year';
    subject?: string;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return apiRequest<any>(`/analytics/progress-trends${queryString ? `?${queryString}` : ''}`);
  }
};

// Utility functions for form data creation
export const createArtifactFormData = (
  file: File,
  data: CreateArtifactRequest
): FormData => {
  const formData = new FormData();
  
  // Add file
  const fieldName = getFileFieldName(file.type);
  formData.append(fieldName, file);
  
  // Add metadata
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

// Helper function to determine field name based on file type
function getFileFieldName(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

// Export combined API object for convenience
export const studentAssessmentAPI = {
  students: studentsAPI,
  artifacts: artifactsAPI,
  mastery: masteryAPI,
  analytics: analyticsAPI,
  utils: {
    createArtifactFormData
  }
};