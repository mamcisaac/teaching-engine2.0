/**
 * 🎓 PERFECT LESSON PLAN TEMPLATE TYPES
 * Grade 1 French Immersion - ETFO Compliant
 * 
 * Based on analysis of Emily McIsaac's teaching requirements:
 * - 975 total lessons needed (195 days × 5 subjects daily)
 * - ETFO three-part structure (Minds On, Action, Consolidation)
 * - Grade 1 French Immersion appropriate
 * - 45-minute duration
 * - Integration with perfect unit plans (title/description only)
 */

export type SubjectType = 
  | 'Français (Immersion)'
  | 'Mathématiques'
  | 'Sciences de la nature'
  | 'Arts visuels'
  | 'Sciences humaines'
  | 'Formation personnelle et sociale';

export type LessonPhase = 'minds-on' | 'action' | 'consolidation';

export type DifferentiationLevel = 'support' | 'core' | 'extension';

export type AssessmentType = 'formative' | 'summative' | 'diagnostic';

export type SafetyLevel = 'low' | 'medium' | 'high';

export interface LearningGoal {
  id: string;
  statement: string;
  curriculumExpectationId?: string; // Links to curriculum expectations
  successCriteria: string[];
}

export interface Activity {
  id: string;
  phase: LessonPhase;
  title: string;
  description: string;
  duration: number; // minutes
  instructions: string[];
  materials: string[];
  grouping: 'individual' | 'pairs' | 'small-groups' | 'whole-class';
  differentiation: {
    support: string[]; // For struggling learners
    core: string[];    // For on-level learners  
    extension: string[]; // For advanced learners
  };
  safetyConsiderations?: string[];
  indigenousPerspectives?: string;
  isCritical?: boolean;   // Must complete even if short on time
}

export interface Assessment {
  id: string;
  type: AssessmentType;
  method: string;
  description: string;
  phase: LessonPhase;
  successCriteria: string[];
}

export interface Vocabulary {
  term: string;
  definition: string;
  visualSupport?: string;
  gestures?: string;
  cognates?: string; // For French immersion
}

export interface MaterialsAndResources {
  essential: string[];  // Must-have materials
  optional: string[];   // Nice-to-have materials
  technology?: string[]; // Digital resources
  books?: string[];     // Literature connections
  manipulatives?: string[]; // Hands-on materials
}

export interface SafetyProtocol {
  level: SafetyLevel;
  considerations: string[];
  procedures: string[];
}

// NEW: Practical planning interfaces
export interface PrepRequirements {
  prepTimeMinutes: number;        // Realistic prep time needed
  setupNeeded: string[];          // Physical room setup required
  techSetup?: string[];           // Technology to prepare/test
}

export interface TimingFlexibility {
  criticalElements: string[];     // Must complete even if short on time
  optionalEnhancements: string[]; // Can skip if needed
  earlyFinisherActivities?: string[]; // If individuals finish early
}

export interface ContingencyPlans {
  ifShortOnTime?: string;         // Quick path to completion
  ifInterrupted?: string;         // Fire drill, announcement, etc.
  ifMaterialsMissing?: string;    // Backup plan for missing materials
}

export interface LessonPlanTemplate {
  // Metadata
  id: string;
  subject: SubjectType;
  unitPlanId: string; // Links to protected unit plan
  title: string;
  titleEn?: string; // English translation for reference
  
  // CRITICAL FOR AI: Generation context
  generationContext?: any; // LessonGenerationContext from LessonContext.ts
  
  // Duration and Structure
  duration: number; // Total minutes (45)
  
  // Learning Framework
  learningGoals: LearningGoal[];
  bigIdeas: string[]; // Self-contained since unit plans lack this
  essentialQuestions: string[]; // Self-contained since unit plans lack this
  
  // Vocabulary (Grade 1 French Immersion specific)
  vocabulary: Vocabulary[];
  
  // ETFO Three-Part Structure
  activities: {
    mindsOn: Activity[];    // 10-15 minutes
    action: Activity[];     // 25-30 minutes  
    consolidation: Activity[]; // 5-10 minutes
  };
  
  // Assessment Integration
  assessments: Assessment[];
  
  // Resources and Materials
  materials: MaterialsAndResources;
  
  // Safety and Protocols
  safety: SafetyProtocol;
  
  // Indigenous Perspectives (Mandatory for PEI)
  indigenousPerspectives: string;
  
  // Differentiation Strategies
  differentiation: {
    universalDesign: string[];
    accommodations: string[];
    modifications: string[];
  };
  
  // Cross-Curricular Connections
  crossCurricular?: {
    subject: SubjectType;
    connection: string;
  }[];
  
  // Home-School Connection
  homeConnection?: string;
  
  // NEW: Practical Planning Support
  prepRequirements?: PrepRequirements;
  timingFlexibility?: TimingFlexibility;
  contingencyPlans?: ContingencyPlans;
  curriculumCodes?: string[]; // Links to official curriculum expectations
  
  // Teacher Notes
  teacherNotes?: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  templateVersion: string;
}

export interface LessonPlanInstance extends LessonPlanTemplate {
  // Instance-specific fields (when template is used for actual lesson)
  plannedDate: Date;
  actualDate?: Date;
  lessonNotes?: string; // Quick notes about how it went
}