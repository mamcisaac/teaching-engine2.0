/**
 * Constants and Utilities for Student Assessment System
 * Shared constants, configurations, and helper functions
 */

import type {
  MasteryLevel,
  EvidenceType,
  ArtifactType,
  MasteryLevelInfo,
  EvidenceTypeInfo,
  ArtifactTypeInfo,
  AchievementLevel
} from '../types/studentAssessment';

// ETFO Mastery Levels Configuration
export const MASTERY_LEVELS: Record<MasteryLevel, MasteryLevelInfo> = {
  NOT_YET: {
    level: 'NOT_YET',
    label: 'Not Yet',
    color: '#ef4444', // red-500
    description: 'Student has not yet demonstrated understanding of this outcome',
    icon: '⭕'
  },
  APPROACHING: {
    level: 'APPROACHING',
    label: 'Approaching',
    color: '#f59e0b', // amber-500
    description: 'Student is beginning to demonstrate understanding with support',
    icon: '🟡'
  },
  MEETING: {
    level: 'MEETING',
    label: 'Meeting',
    color: '#10b981', // emerald-500
    description: 'Student consistently demonstrates understanding independently',
    icon: '🟢'
  },
  EXCEEDING: {
    level: 'EXCEEDING',
    label: 'Exceeding',
    color: '#3b82f6', // blue-500
    description: 'Student demonstrates deep understanding and can apply to new contexts',
    icon: '⭐'
  }
};

// Evidence Types for Triangulation
export const EVIDENCE_TYPES: Record<EvidenceType, EvidenceTypeInfo> = {
  OBSERVATION: {
    type: 'OBSERVATION',
    label: 'Observation',
    description: 'Teacher observes student demonstrating learning in action',
    icon: '👁️'
  },
  CONVERSATION: {
    type: 'CONVERSATION',
    label: 'Conversation',
    description: 'Dialogue between teacher and student about learning',
    icon: '💬'
  },
  PRODUCT: {
    type: 'PRODUCT',
    label: 'Product',
    description: 'Student-created work that demonstrates learning',
    icon: '📄'
  }
};

// Artifact Types Configuration
export const ARTIFACT_TYPES: Record<ArtifactType, ArtifactTypeInfo> = {
  PHOTO: {
    type: 'PHOTO',
    label: 'Photo',
    description: 'Images of student work, activities, or demonstrations',
    icon: '📷',
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  VIDEO: {
    type: 'VIDEO',
    label: 'Video',
    description: 'Video recordings of student presentations or activities',
    icon: '🎥',
    acceptedFormats: ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm', 'video/mov']
  },
  AUDIO: {
    type: 'AUDIO',
    label: 'Audio',
    description: 'Audio recordings of student discussions or oral work',
    icon: '🎵',
    acceptedFormats: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac']
  },
  DOCUMENT: {
    type: 'DOCUMENT',
    label: 'Document',
    description: 'Written work, PDFs, or other document files',
    icon: '📄',
    acceptedFormats: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  },
  NOTE: {
    type: 'NOTE',
    label: 'Note',
    description: 'Text-based observations, anecdotal records, or quick notes',
    icon: '📝',
    acceptedFormats: []
  }
};

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PHOTO: 10 * 1024 * 1024,    // 10MB
  VIDEO: 100 * 1024 * 1024,   // 100MB
  AUDIO: 25 * 1024 * 1024,    // 25MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  NOTE: 0                     // No file size for text notes
};

// Confidence Level Configuration
export const CONFIDENCE_LEVELS = {
  LOW: {
    value: 'LOW' as const,
    label: 'Low',
    description: 'Uncertain about this assessment',
    color: '#ef4444'
  },
  MEDIUM: {
    value: 'MEDIUM' as const,
    label: 'Medium',
    description: 'Moderately confident in this assessment',
    color: '#f59e0b'
  },
  HIGH: {
    value: 'HIGH' as const,
    label: 'High',
    description: 'Very confident in this assessment',
    color: '#10b981'
  }
};

// Processing Status Configuration
export const PROCESSING_STATUS = {
  UPLOADING: {
    value: 'UPLOADING' as const,
    label: 'Uploading',
    color: '#6b7280',
    icon: '⬆️'
  },
  PROCESSING: {
    value: 'PROCESSING' as const,
    label: 'Processing',
    color: '#f59e0b',
    icon: '⚙️'
  },
  READY: {
    value: 'READY' as const,
    label: 'Ready',
    color: '#10b981',
    icon: '✅'
  },
  ERROR: {
    value: 'ERROR' as const,
    label: 'Error',
    color: '#ef4444',
    icon: '❌'
  }
};

// Default pagination settings
export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO_DATE: 'yyyy-MM-dd',
  FORM_INPUT: 'yyyy-MM-dd\'T\'HH:mm'
};

// Validation constants
export const VALIDATION_LIMITS = {
  STUDENT_NAME: { min: 1, max: 50 },
  STUDENT_NUMBER: { min: 1, max: 20 },
  ARTIFACT_TITLE: { min: 1, max: 200 },
  ARTIFACT_DESCRIPTION: { max: 2000 },
  TEACHER_NOTES: { max: 2000 },
  COLLECTION_CONTEXT: { max: 500 },
  TEXT_CONTENT: { max: 5000 },
  AREAS_FOR_GROWTH: { max: 1000 },
  STRENGTHS: { max: 1000 },
  TAG_LENGTH: { min: 1, max: 50 },
  MAX_TAGS: 10,
  BATCH_UPLOAD_MAX: 5,
  BATCH_UPDATE_MAX: 20
};

// Grade options (for filtering and display)
export const GRADE_OPTIONS = [
  { value: 1, label: 'Grade 1' },
  { value: 2, label: 'Grade 2' },
  { value: 3, label: 'Grade 3' },
  { value: 4, label: 'Grade 4' },
  { value: 5, label: 'Grade 5' },
  { value: 6, label: 'Grade 6' },
  { value: 7, label: 'Grade 7' },
  { value: 8, label: 'Grade 8' },
];

// Subject configurations (these should match your curriculum data)
export const SUBJECT_OPTIONS = [
  { value: 'Mathématiques', label: 'Mathematics (French)' },
  { value: 'Français (Immersion)', label: 'French Language Arts' },
  { value: 'Sciences de la nature', label: 'Science (French)' },
  { value: 'Sciences humaines', label: 'Social Studies (French)' },
  { value: 'Arts visuels', label: 'Visual Arts (French)' },
  { value: 'Formation personnelle et sociale', label: 'Health/Personal Development (French)' },
];

// Utility Functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

export const getArtifactTypeFromMimeType = (mimeType: string): ArtifactType => {
  if (mimeType.startsWith('image/')) return 'PHOTO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
};

export const getMasteryColor = (level: MasteryLevel): string => {
  return MASTERY_LEVELS[level].color;
};

export const getMasteryLabel = (level: MasteryLevel): string => {
  return MASTERY_LEVELS[level].label;
};

export const calculateMasteryPercentage = (
  masteryStats: Record<MasteryLevel, number>
): number => {
  const total = Object.values(masteryStats).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  const mastered = masteryStats.MEETING + masteryStats.EXCEEDING;
  return Math.round((mastered / total) * 100);
};

export const formatStudentName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export const formatStudentNameLastFirst = (firstName: string, lastName: string): string => {
  return `${lastName}, ${firstName}`;
};

export const sortStudentsByName = <T extends { firstName: string; lastName: string }>(
  students: T[]
): T[] => {
  return [...students].sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.firstName.localeCompare(b.firstName);
  });
};

export const filterUniqueValues = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

// Debounce utility for search
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Date utilities
export const formatDate = (date: string | Date, _format = DATE_FORMATS.DISPLAY): string => {
  // This would typically use a library like date-fns
  // For now, return a basic format
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const isRecentDate = (date: string | Date, daysThreshold = 7): boolean => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = now.getTime() - targetDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= daysThreshold;
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && 
         (error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('Failed to fetch'));
};

// Achievement Levels for Quick Assessment Grid (matches AchievementLevel enum)
export const ACHIEVEMENT_LEVELS: Record<AchievementLevel, {
  level: AchievementLevel;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  NOT_YET: {
    level: 'NOT_YET',
    label: 'Not Yet',
    color: '#dc2626', // red-600
    bgColor: '#fee2e2', // red-100
    icon: '⭕',
    description: 'Student has not yet demonstrated understanding'
  },
  APPROACHING: {
    level: 'APPROACHING',
    label: 'Approaching',
    color: '#d97706', // amber-600
    bgColor: '#fef3c7', // amber-100
    icon: '🟡',
    description: 'Student is beginning to show understanding with support'
  },
  MEETING: {
    level: 'MEETING',
    label: 'Meeting',
    color: '#059669', // emerald-600
    bgColor: '#d1fae5', // emerald-100
    icon: '🟢',
    description: 'Student consistently demonstrates understanding'
  },
  EXCEEDING: {
    level: 'EXCEEDING',
    label: 'Exceeding',
    color: '#2563eb', // blue-600
    bgColor: '#dbeafe', // blue-100
    icon: '⭐',
    description: 'Student demonstrates deep understanding and application'
  }
};

// Export grouped constants for convenience
export const ASSESSMENT_CONSTANTS = {
  MASTERY_LEVELS,
  EVIDENCE_TYPES,
  ARTIFACT_TYPES,
  CONFIDENCE_LEVELS,
  PROCESSING_STATUS,
  FILE_SIZE_LIMITS,
  VALIDATION_LIMITS,
  DEFAULT_PAGINATION,
  DATE_FORMATS,
  GRADE_OPTIONS,
  SUBJECT_OPTIONS,
  ACHIEVEMENT_LEVELS
};