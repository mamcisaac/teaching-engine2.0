# Legacy API to Domain API Mapping

This document maps legacy API functions to their new domain-based equivalents.

## Newsletter Domain (`api/domains/newsletter`)
- `useNewsletter` → `useNewsletter` (same name)
- `useCreateNewsletterDraft` → `useCreateNewsletterDraft`
- `useCreateNewsletter` → `useCreateNewsletter`
- `useGenerateNewsletter` → `useGenerateNewsletter`
- `fetchNewsletterSuggestions` → `newsletterApi.getSuggestions`

## Notes Domain (`api/domains/notes`)
- `useFilteredNotes` → `useFilteredNotes`
- `useNotes` → `useNotes`
- `useAddNote` → `useAddNote`

## Notification Domain (`api/domains/notification`)
- `useNotifications` → `useNotifications`
- `useMarkNotificationRead` → `useMarkNotificationRead`

## Calendar Domain (`api/domains/calendar`)
- `useCalendarEvents` → `useCalendarEvents`
- `useAddCalendarEvent` → `useAddCalendarEvent`
- `useHolidays` → `useHolidays`
- `useAddHoliday` → `useAddHoliday`
- `useDeleteHoliday` → `useDeleteHoliday`

## Planning Domain (`api/domains/planning`)
- `useYearPlan` → `useYearPlan`
- `useShareYearPlan` → `useShareYearPlan`
- `useDailyPlan` → `useDailyPlan`
- `useGenerateDailyPlan` → `useGenerateDailyPlan`
- `useUpdateDailyPlan` → `useUpdateDailyPlan`
- `useLessonPlan` → `useLessonPlan`
- `useGeneratePlan` → `useGeneratePlan`
- `useMaterialList` → `useMaterialList`
- `useMaterialDetails` → `useMaterialDetails`
- `usePlannerSuggestions` → `usePlannerSuggestions`
- `downloadPrintables` → `planningApi.downloadPrintables`
- `useDeleteResource` → `planningApi.deleteResource`

## Curriculum Domain (`api/domains/curriculum`)
- `useSubjects` → `useSubjects`
- `useSubject` → `useSubject`
- `useCreateSubject` → `useCreateSubject`
- `useUpdateSubject` → `useUpdateSubject`
- `useDeleteSubject` → `useDeleteSubject`
- `useCurriculumExpectations` → `useCurriculumExpectations`
- `useExpectationCoverage` → `useExpectationCoverage`
- `useTimetable` → `useTimetable`
- `useSaveTimetable` → `useSaveTimetable`
- `useThematicUnits` → `useThematicUnits`
- `useThematicUnit` → `useThematicUnit`
- `useCreateThematicUnit` → `useCreateThematicUnit`
- `useUpdateThematicUnit` → `useUpdateThematicUnit`
- `useDeleteThematicUnit` → `useDeleteThematicUnit`

## Teacher Domain (`api/domains/teacher`)
- `useUpdateTeacherPreferences` → `useUpdateTeacherPreferences`
- `useTeacherReflections` → `useTeacherReflections`
- `useCreateTeacherReflection` → `useCreateTeacherReflection`
- `useUpdateTeacherReflection` → `useUpdateTeacherReflection`
- `useDeleteTeacherReflection` → `useDeleteTeacherReflection`

## Student Domain (`api/domains/student`)
- `useStudents` → `useStudents`
- `useStudent` → `useStudent`
- `useCreateStudent` → `useCreateStudent`
- `useUpdateStudent` → `useUpdateStudent`
- `useDeleteStudent` → `useDeleteStudent`
- `useStudentGoals` → `useStudentGoals`
- `useCreateStudentGoal` → `useCreateStudentGoal`
- `useUpdateStudentGoal` → `useUpdateStudentGoal`
- `useDeleteStudentGoal` → `useDeleteStudentGoal`
- `useStudentReflections` → `useStudentReflections`
- `useCreateStudentReflection` → `useCreateStudentReflection`
- `useDeleteStudentReflection` → `useDeleteStudentReflection`
- `useClassifyReflection` → `useClassifyReflection`
- `useClassifyAndUpdateReflection` → `useClassifyAndUpdateReflection`
- `useClassificationStats` → `useClassificationStats`
- `useGeneratePrompts` → `useGeneratePrompts`
- `useOutcomePrompts` → `useOutcomePrompts`
- `usePromptStats` → `usePromptStats`
- `useSearchPrompts` → `useSearchPrompts`
- `useGenerateParentSummary` → `useGenerateParentSummary`
- `useRegenerateParentSummary` → `useRegenerateParentSummary`
- `useSaveParentSummary` → `useSaveParentSummary`
- `useStudentParentSummaries` → `useStudentParentSummaries`
- `useUpdateParentSummary` → `useUpdateParentSummary`
- `useDeleteParentSummary` → `useDeleteParentSummary`
- `useSmartGoals` → `useSmartGoals`
- `useCreateSmartGoal` → `useCreateSmartGoal`
- `useUpdateSmartGoal` → `useUpdateSmartGoal`
- `useDeleteSmartGoal` → `useDeleteSmartGoal`

## Routine Domain (`api/domains/routine`)
- `useOralRoutineTemplates` → `useOralRoutineTemplates`
- `useCreateOralRoutineTemplate` → `useCreateOralRoutineTemplate`
- `useUpdateOralRoutineTemplate` → `useUpdateOralRoutineTemplate`
- `useDeleteOralRoutineTemplate` → `useDeleteOralRoutineTemplate`
- `useDailyOralRoutines` → `useDailyOralRoutines`
- `useCreateDailyOralRoutine` → `useCreateDailyOralRoutine`
- `useUpdateDailyOralRoutine` → `useUpdateDailyOralRoutine`
- `useDeleteDailyOralRoutine` → `useDeleteDailyOralRoutine`
- `useOralRoutineStats` → `useOralRoutineStats`

## Substitute Domain (`api/domains/substitute`)
- `fetchSubPlan` → `substituteApi.generateSubPlan`
- `generateSubPlan` → `substituteApi.generateSubPlanPDF`
- `generateSubPlanWithOptions` → `substituteApi.generateSubPlanWithOptions`
- `getSubPlanRecords` → `substituteApi.getSubPlanRecords`
- `getClassRoutines` → `substituteApi.getClassRoutines`
- `saveClassRoutine` → `substituteApi.saveClassRoutine`
- `deleteClassRoutine` → `substituteApi.deleteClassRoutine`
- `extractWeeklyPlan` → `substituteApi.extractWeeklyPlan`
- `extractScenarioTemplates` → `substituteApi.extractScenarioTemplates`
- `autoDetectScenario` → `substituteApi.autoDetectScenario`
- `getScenarioById` → `substituteApi.getScenarioById`
- `extractSchoolContacts` → `substituteApi.extractSchoolContacts`
- `extractDayMaterials` → `substituteApi.extractDayMaterials`
- `extractWeeklyMaterials` → `substituteApi.extractWeeklyMaterials`
- `extractComprehensiveSubPlan` → `substituteApi.extractComprehensiveSubPlan`
- `useSubstituteInfo` → `useSubstituteInfo`
- `useSaveSubstituteInfo` → `useSaveSubstituteInfo`

## Resource Domain (`api/domains/resource`)
- `useMediaResources` → `useMediaResources`
- `useMediaResource` → `useMediaResource`
- `useUploadMediaResource` → `useUploadMediaResource`
- `useUpdateMediaResource` → `useUpdateMediaResource`
- `useDeleteMediaResource` → `useDeleteMediaResource`

## Parent Domain (`api/domains/parent`)
- `useParentMessages` → `useParentMessages`
- `useParentMessage` → `useParentMessage`
- `useCreateParentMessage` → `useCreateParentMessage`
- `useUpdateParentMessage` → `useUpdateParentMessage`
- `useDeleteParentMessage` → `useDeleteParentMessage`

## Cognate Domain (`api/domains/cognate`)
- `useCognates` → `useCognates`
- `useCognate` → `useCognate`
- `useCreateCognate` → `useCreateCognate`
- `useUpdateCognate` → `useUpdateCognate`
- `useDeleteCognate` → `useDeleteCognate`

## Core Utilities
- `api` → `apiClient` (from `api/core/client`)
- `getWeekStartISO` → `getWeekStartISO` (from `api/core/utils`)