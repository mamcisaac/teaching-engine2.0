/**
 * ETFO Lesson Plan Page Components - Barrel Export
 * 
 * Following the printUtils.tsx pattern for clean, modular exports.
 * This file provides a single entry point for all components used
 * in the ETFO Lesson Plan Page functionality.
 */

// Main view components
export { LessonDetailView } from './LessonDetailView';
export { LessonListView } from './LessonListView';
export { LessonFormModal } from './LessonFormModal';
export { TemplateSelectionModal } from './TemplateSelectionModal';

// Shared components
export { ArrayField } from './ArrayField';
export { CurriculumExpectationsDisplay } from './CurriculumExpectationsDisplay';
export { ThreePartLessonDisplay } from './ThreePartLessonDisplay';

// Tab components
export { OverviewTab } from './tabs/OverviewTab';
export { AIAssistantTab } from './tabs/AIAssistantTab';
export { ThreePartLessonTab } from './tabs/ThreePartLessonTab';
export { MaterialsTab } from './tabs/MaterialsTab';
export { DifferentiationTab } from './tabs/DifferentiationTab';
export { AssessmentTab } from './tabs/AssessmentTab';