/**
 * Shared validation utilities for routes
 */

import { z } from 'zod';

/**
 * Common validation patterns used across routes
 */
export const commonValidations = {
  // Basic field validations
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .regex(/^[^<>]*$/, 'Title cannot contain HTML tags'),

  titleFr: z
    .string()
    .max(255, 'French title must be 255 characters or less')
    .regex(/^[^<>]*$/, 'French title cannot contain HTML tags')
    .optional(),

  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional(),

  descriptionFr: z
    .string()
    .max(2000, 'French description must be 2000 characters or less')
    .optional(),

  // ID validations
  cuidId: z.string().cuid('Invalid ID format'),
  uuid: z.string().uuid('Invalid UUID format'),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),

  // Date validations
  dateString: z.string().datetime('Invalid date format'),
  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format')
  }).refine(
    (data) => new Date(data.startDate) < new Date(data.endDate),
    {
      message: 'End date must be after start date',
      path: ['endDate']
    }
  ),

  // Grade validations
  grade: z.number().int().min(1).max(12),
  gradeRange: z.object({
    gradeMin: z.number().int().min(1).max(12).optional(),
    gradeMax: z.number().int().min(1).max(12).optional()
  }).refine(
    (data) => !data.gradeMin || !data.gradeMax || data.gradeMin <= data.gradeMax,
    {
      message: 'Maximum grade must be greater than or equal to minimum grade',
      path: ['gradeMax']
    }
  ),

  // Subject validation
  subject: z.string().max(100, 'Subject must be 100 characters or less').optional(),

  // Array validations
  tags: z.array(z.string().max(50, 'Tag must be 50 characters or less')).max(20, 'Maximum 20 tags allowed').optional(),
  keywords: z.array(z.string().max(50, 'Keyword must be 50 characters or less')).max(20, 'Maximum 20 keywords allowed').optional(),

  // Time validations
  estimatedMinutes: z.number().int().positive('Estimated minutes must be positive').max(480, 'Estimated minutes cannot exceed 480 (8 hours)').optional(),
  estimatedWeeks: z.number().int().positive('Estimated weeks must be positive').max(52, 'Estimated weeks cannot exceed 52').optional(),

  // Enum validations
  planType: z.enum(['UNIT_PLAN', 'LESSON_PLAN']),
  category: z.enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),

  // Pagination
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Search and filtering
  searchQuery: z.string().max(255).optional(),
  filters: z.object({
    subject: z.string().max(100).optional(),
    grade: z.number().int().min(1).max(12).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
  }).optional()
};

/**
 * Common query parameter schemas
 */
export const commonQuerySchemas = {
  // Basic list query
  list: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    offset: z.coerce.number().int().min(0).default(0),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().max(255).optional()
  }),

  // Educational content query
  educational: z.object({
    subject: z.string().max(100).optional(),
    grade: z.coerce.number().int().min(1).max(12).optional(),
    category: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
      if (val === null || val === undefined || val === '') {
return undefined;
}
      if (Array.isArray(val)) {
return val;
}
      // Split comma-separated string into array
      return val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    })
  }),

  // Date range query
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
};

/**
 * Helper function to create validation schemas with common patterns
 */
export const createValidationSchema = {
  /**
   * Create a basic CRUD schema set
   */
  crud: <T extends z.ZodRawShape>(fields: T) => {
    const baseSchema = z.object(fields);
    return {
      create: baseSchema,
      update: baseSchema.partial(),
      query: commonQuerySchemas.list
    };
  },

  /**
   * Create educational content schema set
   */
  educational: <T extends z.ZodRawShape>(fields: T) => {
    const baseObjectSchema = z.object({
      ...fields,
      gradeMin: z.number().int().min(1).max(12).optional(),
      gradeMax: z.number().int().min(1).max(12).optional(),
      subject: commonValidations.subject,
      tags: commonValidations.tags,
      keywords: commonValidations.keywords
    });
    
    const baseSchema = baseObjectSchema.refine(
      (data) => !data.gradeMin || !data.gradeMax || data.gradeMin <= data.gradeMax,
      {
        message: 'Maximum grade must be greater than or equal to minimum grade',
        path: ['gradeMax']
      }
    );
    
    return {
      create: baseSchema,
      update: baseObjectSchema.partial(),
      query: commonQuerySchemas.list.merge(commonQuerySchemas.educational)
    };
  },

  /**
   * Create a schema with title and description
   */
  withTitleDescription: <T extends z.ZodRawShape>(fields: T) => {
    const baseSchema = z.object({
      ...fields,
      title: commonValidations.title,
      titleFr: commonValidations.titleFr,
      description: commonValidations.description,
      descriptionFr: commonValidations.descriptionFr
    });
    return {
      create: baseSchema,
      update: baseSchema.partial(),
      query: commonQuerySchemas.list
    };
  }
};

/**
 * Sanitization functions
 */
export const sanitize = {
  /**
   * Remove HTML tags from string
   */
  removeHtmlTags: (input: string): string => input.replace(/<[^>]*>/g, ''),

  /**
   * Trim and normalize whitespace
   */
  normalizeWhitespace: (input: string): string => input.trim().replace(/\s+/g, ' '),

  /**
   * Sanitize array of strings
   */
  stringArray: (input: string[]): string[] => input
      .map(str => {
        // First remove script tags and their content completely
        let cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // Then remove any other HTML tags
        cleaned = sanitize.removeHtmlTags(cleaned);
        // Finally normalize whitespace
        return sanitize.normalizeWhitespace(cleaned);
      })
      .filter(str => str.length > 0)
};

/**
 * Validation error formatter
 */
export const formatValidationError = (error: z.ZodError): {
  message: string;
  errors: { field: string; message: string }[];
} => ({
    message: 'Validation failed',
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  });