#!/bin/bash

# This script helps migrate components from legacy API to domain-based APIs

echo "Starting API migration..."

# Function to update imports in a file
update_imports() {
    local file=$1
    echo "Processing: $file"
    
    # Check if file imports from legacy API
    if grep -q "from '../api/legacy/api'" "$file" || grep -q "from '../../api/legacy/api'" "$file" || grep -q "from './api/legacy/api'" "$file"; then
        # Create a backup
        cp "$file" "$file.backup"
        
        # Determine which domain APIs are needed based on the hooks/functions used
        local temp_file=$(mktemp)
        cp "$file" "$temp_file"
        
        # Extract all the imported items from legacy API
        local imports=$(grep -E "import.*from.*api/legacy/api" "$file" | sed -E 's/.*\{([^}]+)\}.*/\1/' | tr ',' '\n' | sed 's/^ *//;s/ *$//')
        
        echo "Found imports: $imports"
        
        # Map imports to domains
        local auth_imports=""
        local calendar_imports=""
        local curriculum_imports=""
        local newsletter_imports=""
        local notes_imports=""
        local notification_imports=""
        local parent_imports=""
        local planning_imports=""
        local resource_imports=""
        local routine_imports=""
        local student_imports=""
        local substitute_imports=""
        local teacher_imports=""
        local cognate_imports=""
        local types_imports=""
        
        while IFS= read -r import; do
            import=$(echo "$import" | xargs) # trim whitespace
            
            # Map each import to its domain
            case "$import" in
                # Types
                CalendarEvent|Newsletter|Subject|TeacherPreferencesInput|TimetableSlot|YearPlanEntry|Notification|OralRoutineTemplate|DailyOralRoutine|OralRoutineStats|ThematicUnit|MediaResource|MediaResourceInput|ParentMessage|ParentMessageInput|MaterialList|DailyPlan|Student|StudentInput|StudentGoal|StudentGoalInput|StudentReflection|StudentReflectionInput|ParentSummary|ParentSummaryGeneration|GenerateParentSummaryRequest|SaveParentSummaryRequest|TeacherReflectionInput|CognatePair|CognateInput)
                    types_imports="$types_imports $import"
                    ;;
                    
                # Calendar domain
                useCalendarEvents|useAddCalendarEvent|useHolidays|useAddHoliday|useDeleteHoliday)
                    calendar_imports="$calendar_imports $import"
                    ;;
                    
                # Newsletter domain
                useNewsletter|useCreateNewsletterDraft|useCreateNewsletter|useGenerateNewsletter|fetchNewsletterSuggestions)
                    newsletter_imports="$newsletter_imports $import"
                    ;;
                    
                # Notes domain
                useFilteredNotes|useNotes|useAddNote)
                    notes_imports="$notes_imports $import"
                    ;;
                    
                # Notification domain
                useNotifications|useMarkNotificationRead)
                    notification_imports="$notification_imports $import"
                    ;;
                    
                # Planning domain
                useYearPlan|useShareYearPlan|useDailyPlan|useGenerateDailyPlan|useUpdateDailyPlan|useLessonPlan|useGeneratePlan|useMaterialList|useMaterialDetails|usePlannerSuggestions|downloadPrintables|useDeleteResource)
                    planning_imports="$planning_imports $import"
                    ;;
                    
                # Curriculum domain
                useSubjects|useSubject|useCreateSubject|useUpdateSubject|useDeleteSubject|useCurriculumExpectations|useExpectationCoverage|useTimetable|useSaveTimetable|useThematicUnits|useThematicUnit|useCreateThematicUnit|useUpdateThematicUnit|useDeleteThematicUnit)
                    curriculum_imports="$curriculum_imports $import"
                    ;;
                    
                # Teacher domain
                useUpdateTeacherPreferences|useTeacherReflections|useCreateTeacherReflection|useUpdateTeacherReflection|useDeleteTeacherReflection)
                    teacher_imports="$teacher_imports $import"
                    ;;
                    
                # Student domain
                useStudents|useStudent|useCreateStudent|useUpdateStudent|useDeleteStudent|useStudentGoals|useCreateStudentGoal|useUpdateStudentGoal|useDeleteStudentGoal|useStudentReflections|useCreateStudentReflection|useDeleteStudentReflection|useClassifyReflection|useClassifyAndUpdateReflection|useClassificationStats|useGeneratePrompts|useOutcomePrompts|usePromptStats|useSearchPrompts|useGenerateParentSummary|useRegenerateParentSummary|useSaveParentSummary|useStudentParentSummaries|useUpdateParentSummary|useDeleteParentSummary|useSmartGoals|useCreateSmartGoal|useUpdateSmartGoal|useDeleteSmartGoal)
                    student_imports="$student_imports $import"
                    ;;
                    
                # Routine domain
                useOralRoutineTemplates|useCreateOralRoutineTemplate|useUpdateOralRoutineTemplate|useDeleteOralRoutineTemplate|useDailyOralRoutines|useCreateDailyOralRoutine|useUpdateDailyOralRoutine|useDeleteDailyOralRoutine|useOralRoutineStats)
                    routine_imports="$routine_imports $import"
                    ;;
                    
                # Substitute domain
                fetchSubPlan|generateSubPlan|generateSubPlanWithOptions|getSubPlanRecords|getClassRoutines|saveClassRoutine|deleteClassRoutine|extractWeeklyPlan|extractScenarioTemplates|autoDetectScenario|getScenarioById|extractSchoolContacts|extractDayMaterials|extractWeeklyMaterials|extractComprehensiveSubPlan|useSubstituteInfo|useSaveSubstituteInfo)
                    substitute_imports="$substitute_imports $import"
                    ;;
                    
                # Resource domain
                useMediaResources|useMediaResource|useUploadMediaResource|useUpdateMediaResource|useDeleteMediaResource)
                    resource_imports="$resource_imports $import"
                    ;;
                    
                # Parent domain
                useParentMessages|useParentMessage|useCreateParentMessage|useUpdateParentMessage|useDeleteParentMessage)
                    parent_imports="$parent_imports $import"
                    ;;
                    
                # Cognate domain
                useCognates|useCognate|useCreateCognate|useUpdateCognate|useDeleteCognate)
                    cognate_imports="$cognate_imports $import"
                    ;;
                    
                # Core utilities
                api|getWeekStartISO)
                    if [ "$import" = "api" ]; then
                        # Special handling for api -> apiClient
                        sed -i '' "s/\bapi\b/apiClient/g" "$temp_file"
                        auth_imports="$auth_imports apiClient"
                    else
                        planning_imports="$planning_imports $import"
                    fi
                    ;;
            esac
        done <<< "$imports"
        
        # Remove the old import
        sed -i '' "/import.*from.*api\/legacy\/api/d" "$temp_file"
        
        # Add new imports at the beginning of the file
        local new_imports=""
        
        if [ -n "$types_imports" ]; then
            new_imports="${new_imports}import type {${types_imports} } from '../types';\n"
        fi
        
        if [ -n "$auth_imports" ]; then
            if [[ "$auth_imports" == *"apiClient"* ]]; then
                new_imports="${new_imports}import { apiClient } from '../api/core/client';\n"
            fi
        fi
        
        if [ -n "$calendar_imports" ]; then
            new_imports="${new_imports}import {${calendar_imports} } from '../api/domains/calendar';\n"
        fi
        
        if [ -n "$newsletter_imports" ]; then
            new_imports="${new_imports}import {${newsletter_imports} } from '../api/domains/newsletter';\n"
        fi
        
        if [ -n "$notes_imports" ]; then
            new_imports="${new_imports}import {${notes_imports} } from '../api/domains/notes';\n"
        fi
        
        if [ -n "$notification_imports" ]; then
            new_imports="${new_imports}import {${notification_imports} } from '../api/domains/notification';\n"
        fi
        
        if [ -n "$planning_imports" ]; then
            # Check if we need planningApi
            if [[ "$planning_imports" == *"downloadPrintables"* ]]; then
                new_imports="${new_imports}import { planningApi,${planning_imports//downloadPrintables/} } from '../api/domains/planning';\n"
                # Update function calls
                sed -i '' "s/downloadPrintables(/planningApi.downloadPrintables(/g" "$temp_file"
            else
                new_imports="${new_imports}import {${planning_imports} } from '../api/domains/planning';\n"
            fi
        fi
        
        if [ -n "$curriculum_imports" ]; then
            new_imports="${new_imports}import {${curriculum_imports} } from '../api/domains/curriculum';\n"
        fi
        
        if [ -n "$teacher_imports" ]; then
            new_imports="${new_imports}import {${teacher_imports} } from '../api/domains/teacher';\n"
        fi
        
        if [ -n "$student_imports" ]; then
            new_imports="${new_imports}import {${student_imports} } from '../api/domains/student';\n"
        fi
        
        if [ -n "$routine_imports" ]; then
            new_imports="${new_imports}import {${routine_imports} } from '../api/domains/routine';\n"
        fi
        
        if [ -n "$substitute_imports" ]; then
            # Check if we need substituteApi
            local needs_api=false
            for func in fetchSubPlan generateSubPlan generateSubPlanWithOptions getSubPlanRecords getClassRoutines saveClassRoutine deleteClassRoutine extractWeeklyPlan extractScenarioTemplates autoDetectScenario getScenarioById extractSchoolContacts extractDayMaterials extractWeeklyMaterials extractComprehensiveSubPlan; do
                if [[ "$substitute_imports" == *"$func"* ]]; then
                    needs_api=true
                    break
                fi
            done
            
            if [ "$needs_api" = true ]; then
                new_imports="${new_imports}import { substituteApi,${substitute_imports//fetchSubPlan/} } from '../api/domains/substitute';\n"
                # Update function calls
                sed -i '' "s/fetchSubPlan(/substituteApi.generateSubPlan(/g" "$temp_file"
                sed -i '' "s/generateSubPlan(/substituteApi.generateSubPlanPDF(/g" "$temp_file"
                # Add other mappings as needed
            else
                new_imports="${new_imports}import {${substitute_imports} } from '../api/domains/substitute';\n"
            fi
        fi
        
        if [ -n "$resource_imports" ]; then
            new_imports="${new_imports}import {${resource_imports} } from '../api/domains/resource';\n"
        fi
        
        if [ -n "$parent_imports" ]; then
            new_imports="${new_imports}import {${parent_imports} } from '../api/domains/parent';\n"
        fi
        
        if [ -n "$cognate_imports" ]; then
            new_imports="${new_imports}import {${cognate_imports} } from '../api/domains/cognate';\n"
        fi
        
        # Insert new imports at the beginning
        echo -e "$new_imports" | cat - "$temp_file" > "$file"
        
        echo "Updated: $file"
        echo "Backup saved as: $file.backup"
    else
        echo "No legacy API imports found in: $file"
    fi
}

# Find all files that import from legacy API
echo "Finding files with legacy API imports..."
files=$(grep -r "from.*api/legacy/api" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq)

# Process each file
for file in $files; do
    update_imports "$file"
done

echo "Migration complete!"
echo "Files processed: $(echo "$files" | wc -l)"