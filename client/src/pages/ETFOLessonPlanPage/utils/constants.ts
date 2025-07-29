/**
 * Constants and configuration values for ETFO Lesson Plan Page
 * 
 * Centralized location for all constants, default values, and configuration
 * used throughout the ETFO Lesson Plan planning interface.
 */

// Auto-save configuration
export const AUTO_SAVE_CONFIG = {
  DELAY: 30000, // 30 seconds
  ENABLED_BY_DEFAULT: true,
} as const;

// Modal configuration
export const MODAL_CONFIG = {
  TEMPLATE_FETCH_LIMIT: 20,
  DEFAULT_FORM_RESET_ON_CLOSE: true,
} as const;

// Template integration settings
export const TEMPLATE_CONFIG = {
  DEFAULT_TYPE: 'LESSON_PLAN',
  FETCH_LIMIT: 20,
} as const;

// Form validation constants
export const FORM_VALIDATION = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_DURATION: 5,
  MAX_DURATION: 480, // 8 hours in minutes
  DEFAULT_DURATION: 60,
} as const;

// Default grouping options
export const GROUPING_OPTIONS = [
  { value: 'whole', label: 'Whole Class' },
  { value: 'small', label: 'Small Groups' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'individual', label: 'Individual' },
  { value: 'mixed', label: 'Mixed' },
] as const;

// Assessment type options
export const ASSESSMENT_TYPES = [
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'formative', label: 'Formative' },
  { value: 'summative', label: 'Summative' },
] as const;

// Tab configuration for the lesson form modal
export const LESSON_FORM_TABS = [
  { id: 'overview', label: 'Overview', icon: 'FileText' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: 'Sparkles' },
  { id: 'three-part', label: 'Three-Part Lesson', icon: 'BookOpen' },
  { id: 'materials', label: 'Materials', icon: 'Package' },
  { id: 'differentiation', label: 'Differentiation', icon: 'Users' },
  { id: 'assessment', label: 'Assessment', icon: 'CheckSquare' },
] as const;

// Default empty array values for form fields
export const DEFAULT_ARRAY_VALUES = {
  MATERIALS: [''],
  ACCOMMODATIONS: [''],
  MODIFICATIONS: [''],
  EXTENSIONS: [''],
} as const;

// Navigation and routing
export const NAVIGATION = {
  LESSON_LIST_PATH: (unitId: string) => `/planner/units/${unitId}/lessons`,
  LESSON_DETAIL_PATH: (unitId: string, lessonId: string) => `/planner/units/${unitId}/lessons/${lessonId}`,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_TITLE: 'Lesson title is required',
  INVALID_DURATION: 'Duration must be between 5 and 480 minutes',
  REQUIRED_UNIT_ID: 'Unit ID is required',
  LESSON_NOT_FOUND: 'Lesson not found',
  SAVE_FAILED: 'Failed to save lesson plan',
  DELETE_FAILED: 'Failed to delete lesson plan',
  TEMPLATE_APPLY_FAILED: 'Failed to apply template',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LESSON_CREATED: 'Lesson plan created successfully',
  LESSON_UPDATED: 'Lesson plan updated successfully',
  LESSON_DELETED: 'Lesson plan deleted successfully',
  TEMPLATE_APPLIED: 'Template applied successfully',
  AUTO_SAVED: 'Changes saved automatically',
} as const;

// Dialog and confirmation messages
export const DIALOG_MESSAGES = {
  DELETE_CONFIRMATION: {
    TITLE: 'Are you sure?',
    DESCRIPTION: 'This action cannot be undone. This will permanently delete the lesson plan.',
    CANCEL: 'Cancel',
    CONFIRM: 'Delete',
  },
  UNSAVED_CHANGES: {
    TITLE: 'Unsaved Changes',
    DESCRIPTION: 'You have unsaved changes. Are you sure you want to leave?',
    CANCEL: 'Stay',
    CONFIRM: 'Leave',
  },
} as const;

// Component display preferences
export const DISPLAY_CONFIG = {
  LESSON_CARD: {
    SHOW_DURATION: true,
    SHOW_DATE: true,
    SHOW_EXPECTATIONS_COUNT: true,
    TRUNCATE_DESCRIPTION_LENGTH: 150,
  },
  LIST_VIEW: {
    ITEMS_PER_PAGE: 20,
    SHOW_SEARCH: true,
    SHOW_FILTERS: true,
  },
} as const;

// Time and date formatting
export const DATE_CONFIG = {
  DEFAULT_FORMAT: 'YYYY-MM-DD',
  DISPLAY_FORMAT: 'MMM DD, YYYY',
  RELATIVE_TIME_THRESHOLD: 7, // days
} as const;