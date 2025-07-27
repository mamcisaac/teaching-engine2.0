/**
 * Type definitions for Prisma models and query results
 * These types provide type safety for database operations
 */

export interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
  strand: string;
  substrand: string | null;
  grade: number;
  subject: string;
  descriptionFr: string | null;
  strandFr: string | null;
  substrandFr: string | null;
  importId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumExpectationWhereInput {
  id?: string | { not?: string; in?: string[]; notIn?: string[] };
  code?: string | { contains?: string; startsWith?: string; mode?: 'default' | 'insensitive' };
  description?: string | { contains?: string; mode?: 'default' | 'insensitive' };
  strand?: string | { contains?: string; mode?: 'default' | 'insensitive' };
  substrand?: string | null | { contains?: string; mode?: 'default' | 'insensitive' };
  grade?: number | { gte?: number; lte?: number; in?: number[] };
  subject?: string | { contains?: string; mode?: 'default' | 'insensitive' };
  importId?: string | null;
  createdAt?: Date | { gte?: Date; lte?: Date };
  updatedAt?: Date | { gte?: Date; lte?: Date };
  OR?: CurriculumExpectationWhereInput[];
  AND?: CurriculumExpectationWhereInput[];
  NOT?: CurriculumExpectationWhereInput;
}

export interface CurriculumImport {
  id: string;
  userId: number;
  filename: string | null;
  originalName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  filePath: string | null;
  grade: number | null;
  subject: string | null;
  status: ImportStatus;
  sourceFormat: string | null;
  sourceFile: string | null;
  rawText: string | null;
  parsedData: string | null;
  errorMessage: string | null;
  totalOutcomes: number;
  processedOutcomes: number;
  errorLog: unknown | null;
  metadata: unknown | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export enum ImportStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Subject {
  id: number;
  name: string;
  nameEn: string | null;
  nameFr: string | null;
  userId: number | null;
  createdAt: Date;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  preferredLanguage: string;
}

export interface ETFOLessonPlan {
  id: string;
  userId: number;
  title: string;
  unitPlanId: string;
  grade: number | null;
  subject: string | null;
  language: string | null;
  date: Date;
  duration: number;
  mindsOn: string | null;
  action: string | null;
  consolidation: string | null;
  learningGoals: string | null;
  materials: unknown | null;
  grouping: string | null;
  titleFr: string | null;
  mindsOnFr: string | null;
  actionFr: string | null;
  consolidationFr: string | null;
  learningGoalsFr: string | null;
  accommodations: unknown | null;
  modifications: unknown | null;
  extensions: unknown | null;
  assessmentType: string | null;
  assessmentNotes: string | null;
  isSubFriendly: boolean;
  subNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitPlan {
  id: string;
  userId: number;
  title: string;
  longRangePlanId: string;
  description: string | null;
  bigIdeas: string | null;
  essentialQuestions: unknown | null;
  startDate: Date;
  endDate: Date;
  estimatedHours: number | null;
  titleFr: string | null;
  descriptionFr: string | null;
  bigIdeasFr: string | null;
  assessmentPlan: string | null;
  successCriteria: unknown | null;
  crossCurricularConnections: string | null;
  learningSkills: unknown | null;
  culminatingTask: string | null;
  keyVocabulary: unknown | null;
  priorKnowledge: string | null;
  parentCommunicationPlan: string | null;
  fieldTripsAndGuestSpeakers: string | null;
  differentiationStrategies: unknown | null;
  indigenousPerspectives: string | null;
  environmentalEducation: string | null;
  socialJusticeConnections: string | null;
  technologyIntegration: string | null;
  communityConnections: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LongRangePlan {
  id: string;
  userId: number;
  title: string;
  academicYear: string;
  term: string | null;
  grade: number;
  subject: string;
  description: string | null;
  goals: string | null;
  themes: unknown | null;
  overarchingQuestions: string | null;
  assessmentOverview: string | null;
  resourceNeeds: string | null;
  professionalGoals: string | null;
  titleFr: string | null;
  descriptionFr: string | null;
  goalsFr: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Prisma query result types
export interface CurriculumExpectationQueryResult extends CurriculumExpectation {
  [key: string]: unknown;
}

export interface CurriculumExpectationSelectResult {
  id?: string;
  code?: string;
  description?: string;
  strand?: string;
  substrand?: string | null;
  grade?: number;
  subject?: string;
  descriptionFr?: string | null;
  strandFr?: string | null;
  substrandFr?: string | null;
  importId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrismaTransactionClient {
  curriculumExpectation: {
    findMany(args: {
      where?: CurriculumExpectationWhereInput;
      select?: Record<string, boolean>;
      orderBy?: Record<string, 'asc' | 'desc'>[];
      take?: number;
      skip?: number;
    }): Promise<CurriculumExpectationQueryResult[]>;
    findFirst(args: {
      where?: CurriculumExpectationWhereInput;
      select?: Record<string, boolean>;
      orderBy?: Record<string, 'asc' | 'desc'>[];
    }): Promise<CurriculumExpectationQueryResult | null>;
    findUnique(args: {
      where: { id: string } | { code: string };
      select?: Record<string, boolean>;
    }): Promise<CurriculumExpectationQueryResult | null>;
    count(args?: { where?: CurriculumExpectationWhereInput }): Promise<number>;
    create(args: {
      data: Omit<CurriculumExpectation, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<CurriculumExpectation>;
    createMany(args: {
      data: Omit<CurriculumExpectation, 'id' | 'createdAt' | 'updatedAt'>[];
    }): Promise<{ count: number }>;
    update(args: {
      where: { id: string };
      data: Partial<Omit<CurriculumExpectation, 'id' | 'createdAt'>>;
    }): Promise<CurriculumExpectation>;
    updateMany(args: {
      where?: CurriculumExpectationWhereInput;
      data: Partial<Omit<CurriculumExpectation, 'id' | 'createdAt'>>;
    }): Promise<{ count: number }>;
    delete(args: { where: { id: string } }): Promise<CurriculumExpectation>;
    deleteMany(args?: { where?: CurriculumExpectationWhereInput }): Promise<{ count: number }>;
  };
  subject: {
    findFirst(args: {
      where?: {
        name?: string;
        userId?: number;
      };
    }): Promise<Subject | null>;
    create(args: {
      data: Omit<Subject, 'id' | 'createdAt'>;
    }): Promise<Subject>;
  };
  curriculumImport: {
    create(args: {
      data: Omit<CurriculumImport, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<CurriculumImport>;
    update(args: {
      where: { id: string };
      data: Partial<Omit<CurriculumImport, 'id' | 'createdAt'>>;
    }): Promise<CurriculumImport>;
    findMany(args?: {
      where?: Record<string, unknown>;
      select?: Record<string, boolean>;
      orderBy?: Record<string, 'asc' | 'desc'>[];
      take?: number;
      skip?: number;
    }): Promise<CurriculumImport[]>;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ParseError {
  line?: number;
  column?: number;
  message: string;
  code: string;
}

// Search and filtering types
export interface CurriculumSearchFilters {
  subjectId?: number;
  grade?: number;
  strand?: string;
  type?: 'overall' | 'specific';
  includeInactive?: boolean;
}

export interface AutoCompleteEntry {
  code?: string;
  description?: string;
}

// Type guard functions
export function isCurriculumExpectation(obj: unknown): obj is CurriculumExpectation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as CurriculumExpectation).id === 'string' &&
    typeof (obj as CurriculumExpectation).code === 'string' &&
    typeof (obj as CurriculumExpectation).description === 'string' &&
    typeof (obj as CurriculumExpectation).grade === 'number' &&
    typeof (obj as CurriculumExpectation).subject === 'string'
  );
}

export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isStringOrUndefined(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}