import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../../utils/errors';
import { logger } from '../../logger';

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
  customErrorHandler?: (error: ZodError, req: Request) => unknown;
}

// Main validation middleware factory
export const validate = <T>(
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
): ((req: ValidatedRequest<T>, res: Response, next: NextFunction) => void) => {
  const {
    source = ['body', 'query', 'params'],
    stripUnknown = true,
    abortEarly = false,
    context,
    customErrorHandler,
  } = options;

  return async (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
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
        if (sources.includes('body')) req.body = validated;
        if (sources.includes('query')) req.query = validated as unknown;
        if (sources.includes('params')) req.params = validated as unknown;
      }

      next();
    } catch (_error) {
      if (error instanceof ZodError) {
        // Log validation failure
        logger.warn({
          path: req.path,
          method: req.method,
          errors: error.errors,
          data: { body: req.body, query: req.query, params: req.params },
        }, 'Validation failed');

        // Use custom error handler if provided
        if (customErrorHandler) {
          const customError = customErrorHandler(error, req);
          return next(customError);
        }

        // Format validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          ...(err.expected !== undefined && { expected: err.expected }),
          ...(err.received !== undefined && { received: err.received }),
        }));

        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};

// Validate specific source only
export const validateBody = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>
) => validate(schema, { ...options, source: 'body' });

export const validateQuery = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>
) => validate(schema, { ...options, source: 'query' });

export const validateParams = <T>(
  schema: ZodSchema<T>,
  options?: Omit<ValidationOptions, 'source'>
) => validate(schema, { ...options, source: 'params' });

// Conditional validation
export const validateIf = <T>(
  condition: (req: Request) => boolean,
  schema: ZodSchema<T>,
  options?: ValidationOptions
) => {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return validate(schema, options)(req, res, next);
    }
    next();
  };
};

// Multiple schema validation (OR)
export const validateOneOf = <T extends ZodSchema<unknown>[]>(
  schemas: T,
  options?: ValidationOptions
) => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const errors: ZodError[] = [];

    for (const schema of schemas) {
      try {
        await validate(schema, options)(req, res, () => {});
        return next(); // Success on first valid schema
      } catch (_error) {
        if (error instanceof ZodError) {
          errors.push(error);
        }
      }
    }

    // All schemas failed
    const combinedErrors = errors.flatMap(e => e.errors);
    next(new ValidationError('None of the validation schemas passed', combinedErrors));
  };
};

// Schema composition helpers
export const mergeSchemas = <T extends ZodSchema<unknown>[]>(
  ...schemas: T
): ZodSchema => {
  return schemas.reduce((merged, schema) => merged.merge(schema), z.object({}));
};

// Common validation patterns
export const commonValidators = {
  // Pagination validation
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).optional(),
    pageSize: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  // ID parameter validation
  idParam: z.object({
    id: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
  }),

  // Date range validation
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).refine(
    (data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to),
    'From date must be before or equal to to date'
  ),

  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1).max(100).optional(),
    fields: z.string().transform(s => s.split(',')).optional(),
  }),
};

// Request sanitization middleware
export const sanitizeRequest = (
  fieldsToSanitize: {
    body?: string[];
    query?: string[];
    params?: string[];
  } = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const sanitizeHtml = (str: string): string => {
      return str
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    };

    // Sanitize specified fields
    if (fieldsToSanitize.body && req.body) {
      fieldsToSanitize.body.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = sanitizeHtml(req.body[field]);
        }
      });
    }

    if (fieldsToSanitize.query && req.query) {
      fieldsToSanitize.query.forEach(field => {
        if (req.query[field] && typeof req.query[field] === 'string') {
          req.query[field] = sanitizeHtml(req.query[field] as string);
        }
      });
    }

    if (fieldsToSanitize.params && req.params) {
      fieldsToSanitize.params.forEach(field => {
        if (req.params[field] && typeof req.params[field] === 'string') {
          req.params[field] = sanitizeHtml(req.params[field]);
        }
      });
    }

    next();
  };
};

// Type coercion middleware for query parameters
export const coerceQueryParams = (
  coercions: Record<string, 'number' | 'boolean' | 'array' | 'date'>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const [param, type] of Object.entries(coercions)) {
      if (req.query[param] !== undefined) {
        const value = req.query[param] as string;

        switch (type) {
          case 'number':
            req.query[param] = parseFloat(value) as unknown;
            break;
          case 'boolean':
            req.query[param] = (value === 'true' || value === '1') as unknown;
            break;
          case 'array':
            req.query[param] = value.split(',') as unknown;
            break;
          case 'date':
            req.query[param] = new Date(value) as unknown;
            break;
        }
      }
    }

    next();
  };
};