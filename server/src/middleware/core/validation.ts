/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RequestHandler, Request, NextFunction } from 'express';
import type { ZodSchema, ZodTypeAny } from 'zod';
import { z, ZodError } from 'zod';

import { logger } from '../../logger';
import type { ValidatedRequest } from '../../types/http';
import { ValidationError } from '../../utils/errors';

export type { ValidatedRequest } from '../../types/http';

// Validation source types
export type ValidationSource = 'body' | 'query' | 'params' | 'headers' | 'cookies';

// Validation options
export interface ValidationOptions {
  source?: ValidationSource | ValidationSource[];
  stripUnknown?: boolean;
  abortEarly?: boolean;
  context?: unknown;
  customErrorHandler?: (_error: ZodError, req: Request) => unknown;
}

// Main validation middleware factory
export const validate = <T>(
  schema: ZodSchema<T>,
  options: ValidationOptions = {},
): RequestHandler => {
  const {
    source = ['body', 'query', 'params'],
    stripUnknown = true,
    abortEarly: _abortEarly = false,
    context: _context,
    customErrorHandler,
  } = options;

  return async (req, _res, next): Promise<void> => {
    const validatedReq = req as ValidatedRequest<T>;
    try {
      // Determine sources to validate
      const sources = Array.isArray(source) ? source : [source];
      let dataToValidate: Record<string, unknown> = {};

      // Collect data from specified sources
      for (const src of sources) {
        switch (src) {
          case 'body':
            dataToValidate = { ...dataToValidate, ...(req.body as Record<string, unknown>) };
            break;
          case 'query':
            dataToValidate = { ...dataToValidate, ...(req.query as Record<string, unknown>) };
            break;
          case 'params':
            dataToValidate = { ...dataToValidate, ...(req.params as Record<string, unknown>) };
            break;
          case 'headers':
            dataToValidate = { ...dataToValidate, ...(req.headers as Record<string, unknown>) };
            break;
          case 'cookies':
            dataToValidate = { ...dataToValidate, ...(req.cookies as Record<string, unknown>) };
            break;
        }
      }

      // Parse with schema
      const validated = await schema.parseAsync(dataToValidate);

      // Store validated data
      validatedReq.validated = validated;

      // Also store in specific locations for convenience
      if (sources.includes('body')) {
        validatedReq.validatedBody = validated;
      }
      if (sources.includes('query')) {
        validatedReq.validatedQuery = validated;
      }
      if (sources.includes('params')) {
        validatedReq.validatedParams = validated;
      }

      // Replace original data with validated data if stripUnknown is true
      if (stripUnknown) {
        if (sources.includes('body')) {
          req.body = validated;
        }
        if (sources.includes('query')) {
          req.query = validated as typeof req.query;
        }
        if (sources.includes('params')) {
          req.params = validated as typeof req.params;
        }
      }

      next();
    } catch (_error: unknown) {
      if (_error instanceof ZodError) {
        // Log validation failure
        logger.warn(
          {
            path: req.path,
            method: req.method,
            errors: _error.errors,
            data: { body: req.body as Record<string, unknown>, query: req.query as Record<string, unknown>, params: req.params as Record<string, unknown> },
          },
          'Validation failed',
        );

        // Use custom _error handler if provided
        if (customErrorHandler !== null && customErrorHandler !== undefined) {
          const customError = customErrorHandler(_error, req);
          next(customError); return;
        }

        // Format validation _errors
        const formattedErrors = _error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          ...('expected' in err && err.expected !== undefined && { expected: err.expected }),
          ...('received' in err && err.received !== undefined && { received: err.received }),
        }));

        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(_error as Error);
      }
    }
  };
};

// Validate specific source only
export const validateBody = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>,
): RequestHandler => validate(schema, { ...options, source: 'body' });

export const validateQuery = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>,
): RequestHandler => validate(schema, { ...options, source: 'query' });

export const validateParams = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>,
): RequestHandler => validate(schema, { ...options, source: 'params' });

// Conditional validation
export const validateIf = <T>(
  condition: (req: Request) => boolean,
  schema: ZodSchema<T>,
  options?: ValidationOptions,
): RequestHandler => (req, res, next): void => {
    if (condition(req)) {
      validate(schema, options)(req, res, next); return;
    }
    next();
  };

// Multiple schema validation (OR)
export const validateOneOf = <T extends ZodTypeAny[]>(
  schemas: T,
  options?: ValidationOptions,
): RequestHandler => async (req, res, next): Promise<void> => {
    const errors: ZodError[] = [];

    for (const schema of schemas) {
      try {
        // Create a promise that resolves when validation succeeds
        await new Promise<void>((resolve, reject) => {
          validate(schema, options)(req, res, ((err?: unknown) => {
            if (err) reject(err);
            else resolve();
          }) as NextFunction);
        });
        next(); return; // Success on first valid schema
      } catch (_error: unknown) {
        if (_error instanceof ZodError) {
          errors.push(_error);
        }
      }
    }

    // All schemas failed
    const combinedErrors = errors.flatMap((e) => e.errors);
    const formattedErrors = combinedErrors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    next(new ValidationError('None of the validation schemas passed', formattedErrors));
  };

// Schema composition helpers
export const mergeSchemas = <T extends ZodTypeAny[]>(...schemas: T): ZodTypeAny => {
  const baseObject = z.object({});
  return schemas.reduce((merged, schema) => {
    if (merged instanceof z.ZodObject && schema instanceof z.ZodObject) {
      return merged.merge(schema);
    }
    return schema;
  }, baseObject);
};

// Common validation patterns
export const commonValidators = {
  // Pagination validation
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).optional(),
    pageSize: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  // ID parameter validation
  idParam: z.object({
    id: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
  }),

  // Date range validation
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .refine(
      (data) => !data.from || data.from === '' || (data.to === undefined) || new Date(data.from) <= new Date(data.to),
      'From date must be before or equal to to date',
    ),

  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1).max(100).optional(),
    fields: z
      .string()
      .transform((s) => s.split(','))
      .optional(),
  }),
};

// Request sanitization middleware
export const sanitizeRequest = (
  fieldsToSanitize: {
    body?: string[];
    query?: string[];
    params?: string[];
  } = {},
): RequestHandler => (req, _res, next): void => {
    const sanitizeHtml = (str: string): string => str
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

    // Sanitize specified fields
    if (fieldsToSanitize.body && req.body !== undefined) {
      fieldsToSanitize.body.forEach((field) => {
        const bodyValue = (req.body as Record<string, unknown>)[field];
        if (bodyValue !== null && bodyValue !== undefined && typeof bodyValue === 'string') {
          (req.body as Record<string, unknown>)[field] = sanitizeHtml(bodyValue);
        }
      });
    }

    if (fieldsToSanitize.query && req.query !== undefined) {
      fieldsToSanitize.query.forEach((field) => {
        const queryValue = (req.query as Record<string, unknown>)[field];
        if (queryValue !== null && queryValue !== undefined && typeof queryValue === 'string') {
          (req.query as Record<string, unknown>)[field] = sanitizeHtml(queryValue);
        }
      });
    }

    if (fieldsToSanitize.params && req.params !== undefined) {
      fieldsToSanitize.params.forEach((field) => {
        const paramValue = (req.params as Record<string, unknown>)[field];
        if (paramValue !== null && paramValue !== undefined && typeof paramValue === 'string') {
          (req.params as Record<string, unknown>)[field] = sanitizeHtml(paramValue);
        }
      });
    }

    next();
  };

// Type coercion middleware for query parameters
export const coerceQueryParams = (
  coercions: Record<string, 'number' | 'boolean' | 'array' | 'date'>,
): RequestHandler => (req, _res, next): void => {
    for (const [param, type] of Object.entries(coercions)) {
      if (req.query[param] !== undefined) {
        const value = req.query[param] as string;

        switch (type) {
          case 'number':
            (req.query as Record<string, unknown>)[param] = parseFloat(value);
            break;
          case 'boolean':
            (req.query as Record<string, unknown>)[param] = value === 'true' || value === '1';
            break;
          case 'array':
            (req.query as Record<string, unknown>)[param] = value.split(',');
            break;
          case 'date':
            (req.query as Record<string, unknown>)[param] = new Date(value);
            break;
        }
      }
    }

    next();
  };
