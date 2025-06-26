import { UnitPlanFormData } from '../components/forms/UnitPlanForm';
import { LessonPlanFormData } from '../components/forms/LessonPlanForm';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates unit plan form data
 */
export function validateUnitPlan(data: UnitPlanFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Required field validation
  if (!data.title?.trim()) {
    errors.title = 'Unit title is required';
  }

  if (!data.longRangePlanId) {
    errors.longRangePlanId = 'Long-range plan selection is required';
  }

  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }

  // Date validation
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }

    // Check if dates are reasonable (not too far in past/future)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    if (startDate < oneYearAgo) {
      errors.startDate = 'Start date cannot be more than one year in the past';
    }

    if (endDate > twoYearsFromNow) {
      errors.endDate = 'End date cannot be more than two years in the future';
    }
  }

  // Expectation validation - CRITICAL for Forms & Data Agent
  if (!data.expectationIds || data.expectationIds.length === 0) {
    errors.expectationIds = 'At least one curriculum expectation must be selected';
  }

  // Duration validation
  if (!data.estimatedHours || data.estimatedHours <= 0) {
    errors.estimatedHours = 'Estimated hours must be greater than 0';
  }

  if (data.estimatedHours && data.estimatedHours > 500) {
    errors.estimatedHours = 'Estimated hours seems unreasonably high (max 500)';
  }

  // Content validation
  if (data.title && data.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  if (data.description && data.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or less';
  }

  // Array validation - ensure at least one meaningful entry
  const hasEssentialQuestions = data.essentialQuestions?.some((q) => q.trim().length > 0);
  if (!hasEssentialQuestions) {
    errors.essentialQuestions = 'At least one essential question is required';
  }

  const hasSuccessCriteria = data.successCriteria?.some((c) => c.trim().length > 0);
  if (!hasSuccessCriteria) {
    errors.successCriteria = 'At least one success criteria is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates lesson plan form data
 */
export function validateLessonPlan(data: LessonPlanFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Required field validation
  if (!data.title?.trim()) {
    errors.title = 'Lesson title is required';
  }

  if (!data.unitPlanId) {
    errors.unitPlanId = 'Unit plan selection is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  // Date validation
  if (data.date) {
    const lessonDate = new Date(data.date);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    if (lessonDate < oneYearAgo) {
      errors.date = 'Lesson date cannot be more than one year in the past';
    }

    if (lessonDate > oneYearFromNow) {
      errors.date = 'Lesson date cannot be more than one year in the future';
    }
  }

  // Duration validation
  if (!data.duration || data.duration <= 0) {
    errors.duration = 'Duration must be greater than 0 minutes';
  }

  if (data.duration && data.duration > 480) {
    // 8 hours
    errors.duration = 'Duration cannot exceed 480 minutes (8 hours)';
  }

  // Expectation validation - CRITICAL for Forms & Data Agent
  if (!data.expectationIds || data.expectationIds.length === 0) {
    errors.expectationIds = 'At least one curriculum expectation must be selected';
  }

  // Lesson structure validation - at least one component must have content
  const hasMindsOn = data.mindsOn?.trim();
  const hasAction = data.action?.trim();
  const hasConsolidation = data.consolidation?.trim();

  if (!hasMindsOn && !hasAction && !hasConsolidation) {
    errors.lessonStructure =
      'At least one lesson component (Minds On, Action, or Consolidation) must have content';
  }

  // Content length validation
  if (data.title && data.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  if (data.learningGoals && data.learningGoals.length > 1000) {
    errors.learningGoals = 'Learning goals must be 1000 characters or less';
  }

  // Materials validation - at least one meaningful material
  const hasMaterials = data.materials?.some((m) => m.trim().length > 0);
  if (!hasMaterials) {
    errors.materials = 'At least one material or resource is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates expectation selection specifically
 */
export function validateExpectationSelection(
  expectationIds: string[],
  context: 'unit' | 'lesson' = 'unit',
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!expectationIds || expectationIds.length === 0) {
    errors.expectationIds = `At least one curriculum expectation must be selected for this ${context}`;
  }

  if (expectationIds && expectationIds.length > 20) {
    errors.expectationIds = `Too many expectations selected. Consider limiting to 20 or fewer for a ${context}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Real-time validation for form fields
 */
export function validateField(
  fieldName: string,
  value: unknown,
  context: 'unit' | 'lesson',
): string | null {
  switch (fieldName) {
    case 'title':
      if (typeof value !== 'string' || !value.trim()) return 'Title is required';
      if (value.length > 200) return 'Title must be 200 characters or less';
      return null;

    case 'startDate':
    case 'endDate':
    case 'date': {
      if (!value) return 'Date is required';
      const date = new Date(value as string | number | Date);
      if (isNaN(date.getTime())) return 'Invalid date format';
      return null;
    }

    case 'estimatedHours': {
      const numValue = typeof value === 'number' ? value : Number(value);
      if (!numValue || numValue <= 0) return 'Must be greater than 0';
      if (numValue > 500) return 'Seems unreasonably high (max 500)';
      return null;
    }

    case 'duration': {
      const numValue = typeof value === 'number' ? value : Number(value);
      if (!numValue || numValue <= 0) return 'Duration must be greater than 0';
      if (numValue > 480) return 'Cannot exceed 480 minutes (8 hours)';
      return null;
    }

    case 'expectationIds': {
      if (!Array.isArray(value) || value.length === 0) {
        return `At least one curriculum expectation must be selected for this ${context}`;
      }
      if (value.length > 20) {
        return `Too many expectations selected. Consider limiting to 20 or fewer for a ${context}`;
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Validates email addresses
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone numbers (North American format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[1]?[\s\-.]?[(]?[0-9]{3}[)]?[\s\-.]?[0-9]{3}[\s\-.]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Sanitizes HTML content for security
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Validates file uploads
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB default
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!allowedTypes.includes(file.type)) {
    errors.fileType = `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    errors.fileSize = `File size too large. Maximum size: ${maxSizeMB}MB`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
