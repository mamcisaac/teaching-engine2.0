// Newsletter types for parent communication system

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
}

export interface StudentWithData extends Student {
  artifacts: StudentArtifact[];
  reflections: StudentReflection[];
}

export interface StudentArtifact {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export interface StudentReflection {
  id: number;
  content: string;
  createdAt: string;
}

export type NewsletterTone = 'friendly' | 'formal' | 'informative';

export interface NewsletterSection {
  id: string;
  title: string;
  titleFr: string;
  content: string;
  contentFr: string;
  isEditable: boolean;
  order: number;
}

export interface NewsletterGenerationParams {
  studentIds: number[];
  from: Date;
  to: Date;
  tone: NewsletterTone;
  focusAreas?: string[];
  includeArtifacts?: boolean;
  includeReflections?: boolean;
  includeLearningGoals?: boolean;
  includeUpcomingEvents?: boolean;
}

export interface NewsletterDraft {
  id?: string;
  title: string;
  titleFr: string;
  studentIds: number[];
  dateFrom: Date;
  dateTo: Date;
  tone: NewsletterTone;
  sections: NewsletterSection[];
  isDraft: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GeneratedNewsletter {
  sections: NewsletterSection[];
  metadata: {
    studentsIncluded: number;
    dateRange: {
      from: string;
      to: string;
    };
    tone: NewsletterTone;
    generatedAt: string;
  };
}

export interface ParentSummary {
  id: number;
  studentId: number;
  dateFrom: string;
  dateTo: string;
  focus?: string[];
  contentFr: string;
  contentEn: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}