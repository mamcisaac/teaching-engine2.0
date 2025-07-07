/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

// Common field schemas
export const commonSchemas = {
  // IDs
  id: z.union([z.string().cuid(), z.number().int().positive()]),
  numericId: z.number().int().positive(),
  stringId: z.string().cuid(),
  
  // Strings
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  shortText: z.string().max(100).trim(),
  longText: z.string().max(10000).trim(),
  email: z.string().email().toLowerCase().trim(),
  url: z.string().url().trim(),
  
  // Numbers
  grade: z.number().int().min(1).max(12),
  percentage: z.number().min(0).max(100),
  rating: z.number().int().min(1).max(5),
  duration: z.number().int().min(0), // minutes
  
  // Dates
  date: z.string().datetime().or(z.date()),
  futureDate: z.string().datetime().or(z.date()).refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  ),
  pastDate: z.string().datetime().or(z.date()).refine(
    (date) => new Date(date) < new Date(),
    'Date must be in the past'
  ),
  dateRange: z.object({
    start: z.string().datetime().or(z.date()),
    end: z.string().datetime().or(z.date()),
  }).refine(
    (range) => new Date(range.end) > new Date(range.start),
    'End date must be after start date'
  ),
  
  // Common enums
  language: z.enum(['en', 'fr']),
  subject: z.string().min(1).max(50),
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
  
  // Filters
  dateFilter: z.object({
    from: z.string().datetime().or(z.date()).optional(),
    to: z.string().datetime().or(z.date()).optional(),
  }),
  
  // Arrays
  stringArray: z.array(z.string()),
  numberArray: z.array(z.number()),
  tags: z.array(z.string().min(1).max(50)).max(20),
};

// Query parameter schemas
export const querySchemas = {
  // Basic pagination
  paginationQuery: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
  }),
  
  // Extended pagination with sorting
  sortablePaginationQuery: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
  
  // Date range query
  dateRangeQuery: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    dateField: z.string().default('createdAt'),
  }),
  
  // Search query
  searchQuery: z.object({
    q: z.string().min(1).max(100).optional(),
    fields: z.string().transform(s => s.split(',')).optional(),
  }),
};

// Validation helpers
export const validateId = (id: string | number): number => {
  const result = commonSchemas.numericId.safeParse(
    typeof id === 'string' ? parseInt(id, 10) : id
  );
  
  if (!result.success) {
    throw new Error(`Invalid ID: ${id}`);
  }
  
  return result.data;
};

export const validatePagination = (query: unknown): { page: number; pageSize: number } => {
  const defaultPagination = { page: 1, pageSize: 20 };
  
  if (!query || typeof query !== 'object') {
    return defaultPagination;
  }
  
  const queryObj = query as Record<string, unknown>;
  
  return {
    page: Math.max(1, parseInt(String(queryObj.page), 10) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(String(queryObj.pageSize), 10) || 20)),
  };
};

export const validateDateRange = (from?: string | Date, to?: string | Date): { from?: Date; to?: Date } => {
  const dates: { from?: Date; to?: Date } = {};
  
  if (from) {
    dates.from = new Date(from);
    if (isNaN(dates.from.getTime())) {
      throw new Error('Invalid from date');
    }
  }
  
  if (to) {
    dates.to = new Date(to);
    if (isNaN(dates.to.getTime())) {
      throw new Error('Invalid to date');
    }
  }
  
  if (dates.from && dates.to && dates.from > dates.to) {
    throw new Error('From date must be before to date');
  }
  
  return dates;
};

// Transform helpers
export const transformToNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? undefined : num;
};

export const transformToBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
return value;
}
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return !!value;
};

export const transformToArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
return value;
}
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// Sanitization helpers
export const sanitizeHtml = (html: string): string => 
  // Basic HTML sanitization - in production, use a library like DOMPurify
   html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim()
;

export const sanitizeFilename = (filename: string): string => filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

// Custom validators
export const isValidGrade = (grade: number): boolean => Number.isInteger(grade) && grade >= 1 && grade <= 12;

export const isValidAcademicYear = (year: string): boolean => {
  const pattern = /^\d{4}-\d{4}$/;
  if (!pattern.test(year)) {
return false;
}
  
  const [start, end] = year.split('-').map(Number);
  return end === start + 1;
};

export const isValidCanadianPostalCode = (code: string): boolean => {
  const pattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return pattern.test(code);
};

// Schema builders
export const buildFilterSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  additionalFields?: z.ZodRawShape
) => baseSchema.extend({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.dateFilter.shape,
    search: z.string().optional(),
    ...additionalFields,
  });

export const buildCreateSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  requiredFields: (keyof T)[]
) => {
  const shape: z.ZodRawShape = {};
  
  for (const key of requiredFields) {
    if (baseSchema.shape[key]) {
      shape[key as string] = baseSchema.shape[key];
    }
  }
  
  return z.object(shape);
};

export const buildUpdateSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>
) => {
  const shape: z.ZodRawShape = {};
  
  for (const [key, schema] of Object.entries(baseSchema.shape)) {
    shape[key] = (schema).optional();
  }
  
  return z.object(shape);
};

// Validation middleware factory
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => (req: any, res: any, next: any) => {
    try {
      const data = {
        ...(req.body || {}),
        ...(req.query || {}),
        ...(req.params || {}),
      };
      
      const result = schema.parse(data);
      req.validated = result;
      next();
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: _error.errors,
          },
        });
      } else {
        next(_error);
      }
    }
  };