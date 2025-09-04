/**
 * TypeScript Types for ETFO Student Assessment System
 * Interfaces matching backend API structures for type safety
 */

// Core entity types
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  grade: number;
  homeroom?: string;
  specialNeeds?: string;
  parentContact?: ParentContact[];
  enrollmentDate: string;
  withdrawalDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  relationship: 'parent' | 'guardian' | 'emergency';
  isEmergencyContact: boolean;
}

export interface StudentSummary extends Student {
  artifactCount?: number;
  progressCount?: number;
  stats?: {
    artifactCount: number;
    progressCount: number;
    recentArtifacts: RecentArtifact[];
  };
}

export interface RecentArtifact {
  id: string;
  title: string;
  artifactType: ArtifactType;
  dateCollected: string;
  processingStatus: ProcessingStatus;
}

// Artifact types
export type ArtifactType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'NOTE';
export type ProcessingStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';

export interface StudentArtifact {
  id: string;
  title: string;
  description?: string;
  artifactType: ArtifactType;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  textContent?: string;
  metadata?: Record<string, any>;
  collectionContext?: string;
  dateCollected: string;
  isPrivate: boolean;
  tags?: string[];
  processingStatus: ProcessingStatus;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    grade: number;
  };
  outcomes?: ArtifactOutcome[];
}

export interface ArtifactOutcome {
  outcomeId: string;
  evidenceType: EvidenceType;
  teacherNote?: string;
  confidenceLevel: ConfidenceLevel;
  contextualFactors?: string;
  dateAssessed: string;
  outcome: CurriculumOutcome;
}

// Assessment types
export type EvidenceType = 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type MasteryLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

export interface CurriculumOutcome {
  id: string;
  code: string;
  description: string;
  subject: string;
  strand: string;
  substrand?: string;
  grade: number;
  title?: string;
}

export interface StudentOutcomeProgress {
  id: string;
  studentId: string;
  outcomeId: string;
  currentLevel: MasteryLevel;
  previousLevel?: MasteryLevel;
  lastAssessmentDate: string;
  totalEvidencePieces: number;
  strongestEvidence?: {
    artifactId: string;
    evidenceType: EvidenceType;
    description: string;
  };
  areasForGrowth?: string;
  strengths?: string;
  teacherNotes?: string;
  parentShared: boolean;
  parentShareDate?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  outcome?: CurriculumOutcome;
}

// API request/response types
export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  studentNumber?: string;
  grade: number;
  homeroom?: string;
  specialNeeds?: string;
  parentContact?: ParentContact[];
  enrollmentDate?: string;
  notes?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  isActive?: boolean;
  withdrawalDate?: string;
}

export interface CreateArtifactRequest {
  studentId: string;
  title: string;
  description?: string;
  collectionContext?: string;
  tags?: string[];
  textContent?: string; // For notes
  isPrivate?: boolean;
  dateCollected?: string;
  outcomes?: {
    outcomeId: string;
    evidenceType: EvidenceType;
    teacherNote?: string;
    confidenceLevel?: ConfidenceLevel;
    contextualFactors?: string;
  }[];
}

export interface UpdateMasteryRequest {
  studentId: string;
  outcomeId: string;
  currentLevel: MasteryLevel;
  areasForGrowth?: string;
  strengths?: string;
  teacherNotes?: string;
  strongestEvidence?: {
    artifactId: string;
    evidenceType: EvidenceType;
    description: string;
  };
}

export interface BatchMasteryUpdateRequest {
  updates: UpdateMasteryRequest[];
}

export interface TagOutcomeRequest {
  outcomeId: string;
  evidenceType: EvidenceType;
  teacherNote?: string;
  confidenceLevel?: ConfidenceLevel;
  contextualFactors?: string;
}

// Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentsResponse {
  students: StudentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArtifactsResponse {
  artifacts: StudentArtifact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentMasteryResponse {
  student: Student;
  summary: {
    totalAssessed: number;
    masteryPercentage: number;
    masteryStats: Record<MasteryLevel, number>;
    subjectCount: number;
    lastUpdated?: string;
  };
  progressBySubject: SubjectProgress[];
}

export interface SubjectProgress {
  subject: string;
  totalOutcomes: number;
  mastery: Record<MasteryLevel, number>;
  records: StudentOutcomeProgress[];
}

export interface OutcomeMasteryResponse {
  outcome: CurriculumOutcome;
  classStats: {
    totalStudents: number;
    assessed: number;
    notAssessed: number;
    mastery: Record<MasteryLevel, number>;
    masteryPercentage: number;
  };
  studentProgress: StudentOutcomeProgress[];
}

export interface MasteryAnalyticsResponse {
  summary: {
    totalStudents: number;
    totalOutcomes: number;
    totalAssessments: number;
    masteryPercentage: number;
    coveragePercentage: number;
    recentUpdatesCount: number;
  };
  masteryStats: Record<MasteryLevel, number>;
  subjectBreakdown: SubjectAnalytics[];
  recentUpdates: RecentUpdate[];
  evidenceBreakdown: Record<ArtifactType, { count: number; totalSize: number }>;
  timeframe: number;
}

export interface SubjectAnalytics {
  subject: string;
  strand: string;
  total_assessments: number;
  exceeding: number;
  meeting: number;
  approaching: number;
  not_yet: number;
  avg_evidence: number;
}

export interface RecentUpdate {
  id: string;
  studentName: string;
  outcomeCode: string;
  outcomeDescription: string;
  subject: string;
  currentLevel: MasteryLevel;
  previousLevel?: MasteryLevel;
  lastAssessmentDate: string;
  totalEvidencePieces: number;
}

// Filter and query types
export interface StudentsFilters {
  grade?: number;
  homeroom?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArtifactsFilters {
  studentId?: string;
  artifactType?: ArtifactType;
  outcomeId?: string;
  search?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  isPrivate?: boolean;
  page?: number;
  limit?: number;
}

export interface MasteryFilters {
  subject?: string;
  currentLevel?: MasteryLevel;
  includeArchived?: boolean;
}

export interface AnalyticsFilters {
  grade?: number;
  subject?: string;
  timeframe?: number;
  includeArchived?: boolean;
}

// Upload types
export interface UploadResult {
  id: string;
  title: string;
  artifactType: ArtifactType;
  filePath?: string;
  url?: string;
  dateCollected: string;
  processingStatus: ProcessingStatus;
  createdAt: string;
}

export interface BatchUploadResult {
  message: string;
  artifacts: UploadResult[];
}

// Error types
export interface APIError {
  error: string;
  details?: any;
}

export interface ValidationError {
  error: string;
  details: {
    msg: string;
    param: string;
    location: string;
  }[];
}

// Loading and state types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface MutationState extends LoadingState {
  isSuccess: boolean;
}

// UI helper types
export interface MasteryLevelInfo {
  level: MasteryLevel;
  label: string;
  color: string;
  description: string;
  icon: string;
}

export interface EvidenceTypeInfo {
  type: EvidenceType;
  label: string;
  description: string;
  icon: string;
}

export interface ArtifactTypeInfo {
  type: ArtifactType;
  label: string;
  description: string;
  icon: string;
  acceptedFormats: string[];
}

// Quick Assessment Grid Types (AchievementLevel-based)
export type AchievementLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

export interface StudentAssessment {
  id: string;
  userId: number;
  studentId: string;
  lessonId?: string;
  expectationId?: string;
  subject: string;
  title: string;
  level: AchievementLevel;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    title: string;
    titleFr?: string;
    date: string;
  };
}

export interface CreateStudentAssessmentRequest {
  studentId: string;
  lessonId?: string;
  expectationId?: string;
  subject: string;
  title: string;
  level: AchievementLevel;
  notes?: string;
  date?: string;
}

export interface UpdateStudentAssessmentRequest {
  level?: AchievementLevel;
  notes?: string;
  title?: string;
}

export interface DifferentiationGroups {
  reteaching: string[];    // NOT_YET students
  support: string[];       // APPROACHING students  
  independent: string[];   // MEETING students
  extension: string[];     // EXCEEDING students
}

export interface DifferentiationGroupsRequest {
  subject: string;
  date?: string;
}

export interface StudentAssessmentFilters {
  studentId?: string;
  subject?: string;
  date?: string;
}