import { LessonPlanContent, UnitPlanContent } from './template';

// French Immersion specific content extensions
export interface FrenchImmersionLessonContent extends LessonPlanContent {
  // Bilingual objectives
  objectivesEn?: string[];
  objectivesFr?: string[];
  
  // Language development
  languageFocus?: {
    targetVocabulary?: BilingualVocabulary[];
    sentenceStructures?: string[];
    grammarPoints?: string[];
    pronunciationFocus?: string[];
  };
  
  // Language transition activities
  languageTransitions?: {
    fromEnglishToFrench?: string[];
    fromFrenchToEnglish?: string[];
    codeswitchingStrategies?: string[];
  };
  
  // Cultural integration
  culturalConnections?: {
    francophoneCulture?: string[];
    canadianContent?: string[];
    globalPerspectives?: string[];
  };
  
  // Assessment in both languages
  bilingualAssessment?: {
    oralFrench?: AssessmentCriteria;
    writtenFrench?: AssessmentCriteria;
    comprehension?: AssessmentCriteria;
    languageUse?: AssessmentCriteria;
  };
  
  // Parent communication
  parentCommunication?: {
    englishMessage?: string;
    frenchMessage?: string;
    homeActivities?: BilingualActivity[];
  };
}

export interface FrenchImmersionUnitContent extends UnitPlanContent {
  // Extended bilingual content
  overviewEn?: string;
  overviewFr?: string;
  learningGoalsEn?: string[];
  learningGoalsFr?: string[];
  
  // Language progression
  languageProgression?: {
    week1Focus?: LanguageWeekFocus;
    week2Focus?: LanguageWeekFocus;
    week3Focus?: LanguageWeekFocus;
    week4Focus?: LanguageWeekFocus;
  };
  
  // Cross-curricular French integration
  crossCurricularFrench?: {
    mathematics?: string[];
    science?: string[];
    socialStudies?: string[];
    arts?: string[];
    physicalEducation?: string[];
  };
  
  // Cultural themes
  culturalThemes?: {
    theme?: string;
    themeFr?: string;
    culturalActivities?: string[];
    culturalResources?: string[];
  };
}

// Supporting interfaces
export interface BilingualVocabulary {
  english: string;
  french: string;
  pronunciation?: string;
  context?: string;
  visualSupport?: string;
}

export interface AssessmentCriteria {
  criteria: string[];
  rubric?: RubricLevel[];
  successIndicators?: string[];
}

export interface RubricLevel {
  level: 'Emerging' | 'Developing' | 'Proficient' | 'Extending';
  levelFr: 'Émergent' | 'En développement' | 'Compétent' | 'Avancé';
  description: string;
  descriptionFr: string;
}

export interface BilingualActivity {
  titleEn: string;
  titleFr: string;
  instructions: string;
  instructionsFr: string;
  materials?: string[];
  duration?: string;
}

export interface LanguageWeekFocus {
  vocabulary: BilingualVocabulary[];
  structures: string[];
  communicationGoals: string[];
  culturalElements: string[];
}

// PEI Curriculum specific
export interface PEICurriculumAlignment {
  grade: number;
  subject: string;
  strand?: string;
  outcomes: PEILearningOutcome[];
}

export interface PEILearningOutcome {
  code: string;
  descriptionEn: string;
  descriptionFr: string;
  indicators?: string[];
  frenchLanguageSupport?: string[];
}

// Template metadata for French Immersion
export interface FrenchImmersionTemplateMetadata {
  gradeLevel: 1 | 2 | 3 | 4 | 5 | 6;
  frenchProficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timeOfYear?: 'September' | 'October' | 'November' | 'December' | 'January' | 'February' | 'March' | 'April' | 'May' | 'June';
  thematicUnit?: string;
  peiCurriculumAlignment?: PEICurriculumAlignment[];
}

// Helper functions
export function createBilingualVocabulary(
  english: string,
  french: string,
  pronunciation?: string,
  context?: string
): BilingualVocabulary {
  return {
    english,
    french,
    pronunciation,
    context,
  };
}

export function createBilingualActivity(
  titleEn: string,
  titleFr: string,
  instructions: string,
  instructionsFr: string,
  materials?: string[],
  duration?: string
): BilingualActivity {
  return {
    titleEn,
    titleFr,
    instructions,
    instructionsFr,
    materials,
    duration,
  };
}