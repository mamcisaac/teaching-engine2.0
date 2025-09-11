import { apiClient } from '../../core/client';

export interface ArtifactUploadResponse {
  id: string;
  title: string;
  artifactType: string;
  filePath: string;
  url?: string;
  dateCollected: string;
  processingStatus: string;
  createdAt: string;
}

export interface ArtifactUploadParams {
  studentId: string;
  file: File;
  title?: string;
  description?: string;
  collectionContext?: string;
  dateCollected?: string;
  isPrivate?: boolean;
  lessonId?: string;
  expectationId?: string;
}

export const artifactsApi = {
  /**
   * Upload a photo artifact
   */
  uploadPhoto: async (params: ArtifactUploadParams): Promise<ArtifactUploadResponse> => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('studentId', params.studentId);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.collectionContext) formData.append('collectionContext', params.collectionContext);
    if (params.dateCollected) formData.append('dateCollected', params.dateCollected);
    if (params.isPrivate !== undefined) formData.append('isPrivate', String(params.isPrivate));
    if (params.lessonId) formData.append('lessonId', params.lessonId);
    if (params.expectationId) formData.append('expectationId', params.expectationId);

    const { data } = await apiClient.post<ArtifactUploadResponse>(
      '/api/artifacts/upload/photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Upload a video artifact
   */
  uploadVideo: async (params: ArtifactUploadParams): Promise<ArtifactUploadResponse> => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('studentId', params.studentId);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.collectionContext) formData.append('collectionContext', params.collectionContext);
    if (params.dateCollected) formData.append('dateCollected', params.dateCollected);
    if (params.isPrivate !== undefined) formData.append('isPrivate', String(params.isPrivate));
    if (params.lessonId) formData.append('lessonId', params.lessonId);
    if (params.expectationId) formData.append('expectationId', params.expectationId);

    const { data } = await apiClient.post<ArtifactUploadResponse>(
      '/api/artifacts/upload/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Upload an audio artifact
   */
  uploadAudio: async (params: ArtifactUploadParams): Promise<ArtifactUploadResponse> => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('studentId', params.studentId);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.collectionContext) formData.append('collectionContext', params.collectionContext);
    if (params.dateCollected) formData.append('dateCollected', params.dateCollected);
    if (params.isPrivate !== undefined) formData.append('isPrivate', String(params.isPrivate));
    if (params.lessonId) formData.append('lessonId', params.lessonId);
    if (params.expectationId) formData.append('expectationId', params.expectationId);

    const { data } = await apiClient.post<ArtifactUploadResponse>(
      '/api/artifacts/upload/audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Upload a document artifact
   */
  uploadDocument: async (params: ArtifactUploadParams): Promise<ArtifactUploadResponse> => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('studentId', params.studentId);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.collectionContext) formData.append('collectionContext', params.collectionContext);
    if (params.dateCollected) formData.append('dateCollected', params.dateCollected);
    if (params.isPrivate !== undefined) formData.append('isPrivate', String(params.isPrivate));
    if (params.lessonId) formData.append('lessonId', params.lessonId);
    if (params.expectationId) formData.append('expectationId', params.expectationId);

    const { data } = await apiClient.post<ArtifactUploadResponse>(
      '/api/artifacts/upload/document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Upload artifact with automatic type detection
   */
  uploadArtifact: async (params: ArtifactUploadParams): Promise<ArtifactUploadResponse> => {
    const fileType = params.file.type;
    
    // Determine upload endpoint based on file type
    if (fileType.startsWith('image/')) {
      return artifactsApi.uploadPhoto(params);
    } else if (fileType.startsWith('video/')) {
      return artifactsApi.uploadVideo(params);
    } else if (fileType.startsWith('audio/')) {
      return artifactsApi.uploadAudio(params);
    } else if (
      fileType === 'application/pdf' ||
      fileType.startsWith('application/msword') ||
      fileType.startsWith('application/vnd.openxmlformats-officedocument') ||
      fileType.startsWith('text/')
    ) {
      return artifactsApi.uploadDocument(params);
    } else {
      // Default to document for unknown types
      return artifactsApi.uploadDocument(params);
    }
  },
};