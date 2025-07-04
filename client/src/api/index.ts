// Core exports
export * from './core';

// Domain exports
export * from './domains/auth';
export * from './domains/calendar';
export * from './domains/curriculum';
export * from './domains/newsletter';
export * from './domains/notes';
export * from './domains/notification';
export * from './domains/teacher';
// Additional domains - now migrated
export * from './domains/routine';
export * from './domains/substitute';
export * from './domains/cognate';

// Parent domain exports - with prefixed names to avoid conflicts
export {
  useParentMessages,
  useParentMessage,
  useCreateParentMessage,
  useUpdateParentMessage,
  useDeleteParentMessage,
  useParentSummaries,
  useParentSummary,
  useGenerateParentSummary as useGenerateParentSummaryForParent,
  useSaveParentSummary as useSaveParentSummaryForParent,
  useUpdateParentSummary as useUpdateParentSummaryForParent,
  useDeleteParentSummary as useDeleteParentSummaryForParent,
  useSendParentSummary
} from './domains/parent';

// Student domain exports - keeping original names for student-related summaries
export {
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useStudentGoals,
  useCreateStudentGoal,
  useUpdateStudentGoal,
  useDeleteStudentGoal,
  useStudentReflections,
  useCreateStudentReflection,
  useDeleteStudentReflection,
  useStudentParentSummaries,
  useGenerateParentSummary,
  useSaveParentSummary,
  useUpdateParentSummary,
  useRegenerateParentSummary,
  useDeleteParentSummary
} from './domains/student';

// Planning domain exports
export {
  useYearPlan,
  useDailyPlan,
  useLessonPlan,
  useMaterialList,
  useMaterialDetails,
  usePlannerSuggestions,
  useShareYearPlan,
  useUpdateDailyPlan,
  useGenerateDailyPlan,
  useGeneratePlan,
  useDeleteResource as useDeletePlanningResource
} from './domains/planning';

// Resource domain exports
export {
  useMediaResources,
  useMediaResource,
  usePopularResources,
  useRecentResources,
  useSharedResources,
  useResourceStats,
  useResourceTags,
  useResourceCategories,
  useResourceCollections,
  useResourceCollection,
  useResourceSearch,
  useLinkValidation,
  useStorageUsage,
  useSharingStatus,
  useUploadResource,
  useUploadMultipleResources,
  useUpdateResource,
  useDeleteResource,
  useBulkDeleteResources,
  useGenerateThumbnail,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useAddResourcesToCollection,
  useRemoveResourcesFromCollection,
  useAddLink,
  useBulkImportLinks,
  useStorageCleanup,
  useStorageOptimize,
  useShareResource,
  useGeneratePublicLink,
  useRevokePublicLink,
  useDownloadResource,
  useExportResources
} from './domains/resource';

// Legacy compatibility - to be removed after full migration
export { 
  api, 
  fetchNewsletterSuggestions,
  useHolidays,
  useAddHoliday,
  useDeleteHoliday,
  useSubstituteInfo,
  useSaveSubstituteInfo
} from './legacy/api';
export type { PromptGenerationResult, GeneratedPrompt } from './legacy/api';