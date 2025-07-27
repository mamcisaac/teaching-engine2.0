/**
 * Curriculum Services Index
 * Centralized exports for all curriculum-related services
 */

// Main orchestrator service
export { CurriculumImportOrchestrator, curriculumImportOrchestrator } from './CurriculumImportOrchestrator';

// Specialized services
export { CurriculumExportService, curriculumExportService } from './CurriculumExportService';
export { CurriculumSearchService, curriculumSearchService } from './CurriculumSearchService';
export { CurriculumStatsService, curriculumStatsService } from './CurriculumStatsService';

// Legacy compatibility
export { CurriculumImportService } from './CurriculumImportOrchestrator';

// Re-export types and interfaces
export type { ImportOptions, ImportResult } from './CurriculumImportOrchestrator';
export type { ExportOptions } from './CurriculumExportService';
export type { SearchOptions, SearchResult, SearchFilters } from './CurriculumSearchService';
export type { CurriculumStats, SubjectStats, GradeStats } from './CurriculumStatsService';

// Re-export existing services
export * from './parsers';
export * from './transformers';
export * from './validators';