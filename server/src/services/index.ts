// Core services - Modern modular curriculum services
export { 
  curriculumImportOrchestrator as curriculumImportService,
  curriculumExportService,
  curriculumSearchService,
  curriculumStatsService,
  CurriculumImportService
} from './curriculum';

// Template services - Modern modular template architecture
export { 
  templateOrchestrator as templateService,
  templateRegistry,
  templateCache,
  templateHelpers,
  partialManager,
  renderCoordinator,
  renderLessonPlan,
  renderNewsletter,
  renderProgressReport
} from './templates';

// AI services - Modern AI planning and drafting
export * from './ai';

// Authentication services - Modern secure authentication
export * from './auth';

// LLM services - OpenAI integration and content generation
export * from './llmService';

// Service types - Modern curriculum service types
export type { 
  ImportOptions,
  ImportResult,
  ExportOptions,
  SearchOptions,
  SearchResult,
  CurriculumStats,
  SubjectStats,
  GradeStats
} from './curriculum';
