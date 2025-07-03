// Newsletter types for general communication templates
// This application does not store any student information

export type NewsletterTone = 'friendly' | 'formal' | 'informative';

// Legacy types for backward compatibility
export interface Student {
  id: number;
  name: string;
  parentEmail?: string;
}

export interface ParentSummary {
  id: string;
  studentId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  // Removed studentIds - newsletters are now general templates
  from: Date;
  to: Date;
  tone: NewsletterTone;
  focusAreas?: string[];
  includeUpcomingEvents?: boolean;
  templateType?: 'weekly' | 'monthly' | 'special';
  // Legacy fields for backward compatibility
  studentIds?: number[];
  includeArtifacts?: boolean;
  includeReflections?: boolean;
  includeLearningGoals?: boolean;
}

export interface NewsletterDraft {
  id?: string;
  title: string;
  titleFr: string;
  // Removed studentIds - newsletters are now general templates
  dateFrom: Date;
  dateTo: Date;
  tone: NewsletterTone;
  sections: NewsletterSection[];
  isDraft: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy field for backward compatibility
  studentIds?: number[];
}

export interface GeneratedNewsletter {
  sections: NewsletterSection[];
  metadata: {
    // Removed studentsIncluded - newsletters are now general templates
    dateRange: {
      from: string;
      to: string;
    };
    tone: NewsletterTone;
    generatedAt: string;
    templateType?: string;
  };
}