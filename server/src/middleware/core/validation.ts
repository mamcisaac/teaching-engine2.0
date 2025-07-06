/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { z, ZodError } from 'zod';

import { logger } from '../../logger';
import { ValidationError } from '../../utils/errors';

// Extended request with validated data
export interface ValidatedRequest<T = any> extends Request {
  validated?: T;
  validatedBody?: T;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}

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
): ((req: ValidatedRequest<T>, res: Response, next: NextFunction) => void) => {
  const {
    source = ['body', 'query', 'params'],
    stripUnknown = true,
    abortEarly: _abortEarly = false,
    context: _context,
    customErrorHandler,
  } = options;

  return async (req: ValidatedRequest<T>, _res: Response, next: NextFunction) => {
    try {
      // Determine sources to validate
      const sources = Array.isArray(source) ? source : [source];
      let dataToValidate: any = {};

      // Collect data from specified sources
      for (const src of sources) {
        switch (src) {
          case 'body':
            dataToValidate = { ...dataToValidate, ...req.body };
            break;
          case 'query':
            dataToValidate = { ...dataToValidate, ...req.query };
            break;
          case 'params':
            dataToValidate = { ...dataToValidate, ...req.params };
            break;
          case 'headers':
            dataToValidate = { ...dataToValidate, ...req.headers };
            break;
          case 'cookies':
            dataToValidate = { ...dataToValidate, ...req.cookies };
            break;
        }
      }

      // Parse with schema
      const validated = await schema.parseAsync(dataToValidate);

      // Store validated data
      req.validated = validated;

      // Also store in specific locations for convenience
      if (sources.includes('body')) {
        req.validatedBody = validated;
      }
      if (sources.includes('query')) {
        req.validatedQuery = validated;
      }
      if (sources.includes('params')) {
        req.validatedParams = validated;
      }

      // Replace original data with validated data if stripUnknown is true
      if (stripUnknown) {
        if (sources.includes('body')) {
req.body = validated;
}
        if (sources.includes('query')) {
req.query = validated as any;
}
        if (sources.includes('params')) {
req.params = validated as any;
}
      }

      next();
    } catch (_error) {
      if (_error instanceof ZodError) {
        // Log validation failure
        logger.warn(
          {
            path: req.path,
            method: req.method,
            errors: _error.errors,
            data: { body: req.body, query: req.query, params: req.params },
          },
          'Validation failed',
        );

        // Use custom _error handler if provided
        if (customErrorHandler) {
          const customError = customErrorHandler(_error, req);
          next(customError); return;
        }

        // Format validation _errors
        const formattedErrors = _error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          ...((err as any).expected !== undefined && { expected: (err as any).expected }),
          ...((err as any).received !== undefined && { received: (err as any).received }),
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
) => validate(schema, { ...options, source: 'body' });

export const validateQuery = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>,
) => validate(schema, { ...options, source: 'query' });

export const validateParams = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>,
) => validate(schema, { ...options, source: 'params' });

// Conditional validation
export const validateIf = <T>(
  condition: (req: Request) => boolean,
  schema: ZodSchema<T>,
  options?: ValidationOptions,
) => (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
    if (condition(req)) {
      validate(schema, options)(req, res, next); return;
    }
    next();
  };

// Multiple schema validation (OR)
export const validateOneOf = <T extends ZodSchema<unknown>[]>(
  schemas: T,
  options?: ValidationOptions,
) => async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const errors: ZodError[] = [];

    for (const schema of schemas) {
      try {
        await validate(schema, options)(req, res, () => {});
        next(); return; // Success on first valid schema
      } catch (_error) {
        if (_error instanceof ZodError) {
          errors.push(_error);
        }
      }
    }

    // All schemas failed
    const combinedErrors = errors.flatMap((e) => e.errors);
    next(new ValidationError('None of the validation schemas passed', combinedErrors));
  };

// Schema composition helpers
export const mergeSchemas = <T extends ZodSchema<unknown>[]>(...schemas: T): ZodSchema => schemas.reduce((merged, schema) => {
    if ('merge' in merged && typeof merged.merge === 'function') {
      return merged.merge(schema);
    }
    return schema;
  }, z.object({}));

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
      (data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to),
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
) => (req: Request, _res: Response, next: NextFunction) => {
    const sanitizeHtml = (str: string): string => str
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

    // Sanitize specified fields
    if (fieldsToSanitize.body && req.body) {
      fieldsToSanitize.body.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = sanitizeHtml(req.body[field]);
        }
      });
    }

    if (fieldsToSanitize.query && req.query) {
      fieldsToSanitize.query.forEach((field) => {
        if (req.query[field] && typeof req.query[field] === 'string') {
          req.query[field] = sanitizeHtml(req.query[field]);
        }
      });
    }

    if (fieldsToSanitize.params && req.params) {
      fieldsToSanitize.params.forEach((field) => {
        if (req.params[field] && typeof req.params[field] === 'string') {
          req.params[field] = sanitizeHtml(req.params[field]);
        }
      });
    }

    next();
  };

// Type coercion middleware for query parameters
export const coerceQueryParams = (
  coercions: Record<string, 'number' | 'boolean' | 'array' | 'date'>,
) => (req: Request, _res: Response, next: NextFunction) => {
    for (const [param, type] of Object.entries(coercions)) {
      if (req.query[param] !== undefined) {
        const value = req.query[param] as string;

        switch (type) {
          case 'number':
            (req.query as any)[param] = parseFloat(value);
            break;
          case 'boolean':
            (req.query as any)[param] = value === 'true' || value === '1';
            break;
          case 'array':
            (req.query as any)[param] = value.split(',');
            break;
          case 'date':
            (req.query as any)[param] = new Date(value);
            break;
        }
      }
    }

    next();
  };
