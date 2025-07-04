import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';
import DOMPurify from 'isomorphic-dompurify';
import logger from '../logger.js';

/**
 * Input sanitization middleware
 * Cleans and validates user input to prevent XSS and injection attacks
 */

// Configure DOMPurify for different sanitization levels
const strictConfig = {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

const moderateConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

const lenientConfig = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'target', 'class', 'id', 'style'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
};

/**
 * Remove dangerous patterns from strings
 */
function removeDangerousPatterns(input: string): string {
  // Remove javascript: protocols
  let sanitized = input.replace(/javascript\s*:/gi, '');

  // Remove data: protocols (potential for XSS)
  sanitized = sanitized.replace(/data\s*:/gi, '');

  // Remove vbscript: protocols
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');

  // Remove onload, onerror, onclick and other event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');

  // Remove expression() CSS (IE specific but still dangerous)
  sanitized = sanitized.replace(/expression\s*\(/gi, '');

  // Remove eval() calls
  sanitized = sanitized.replace(/eval\s*\(/gi, '');

  return sanitized;
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: unknown, config: Record<string, unknown> = strictConfig): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    try {
      // First remove dangerous patterns
      let sanitized = removeDangerousPatterns(obj);

      // Then apply DOMPurify for HTML sanitization
      sanitized = DOMPurify.sanitize(sanitized, config).toString();

      // Additional XSS prevention for edge cases
      sanitized = sanitized.replace(/javascript\s*:/gi, '');
      sanitized = sanitized.replace(/data\s*:/gi, '');
      sanitized = sanitized.replace(/vbscript\s*:/gi, '');

      return sanitized;
    } catch (_error) {
      // If sanitization fails, return empty string to be safe
      logger.warn({ obj: obj.substring(0, 100), error }, 'Failed to sanitize string');
      return '';
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, config));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize the key itself to prevent property injection
        const sanitizedKey = typeof key === 'string' ? removeDangerousPatterns(key) : key;
        sanitized[sanitizedKey] = sanitizeObject((obj as Record<string, unknown>)[key], config);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Detect potential SQL injection patterns
 */
function containsSQLInjectionPattern(input: string): boolean {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b[\s\S]*\b(from|where|into|table|database)\b)/i,
    /(--|#|\/\*|\*\/|;)\s*$/,
    /\b(or|and)\b\s*\d+\s*=\s*\d+/i,
    /\b(or|and)\b\s*'[^']*'\s*=\s*'[^']*'/i,
    /\bexec\s*\(/i,
    /\bcast\s*\(/i,
    /\bconvert\s*\(/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect potential NoSQL injection patterns
 */
function containsNoSQLInjectionPattern(input: string): boolean {
  const noSqlPatterns = [
    /\$\s*(where|ne|eq|gt|gte|lt|lte|in|nin|exists|type|mod|regex|text|where)/,
    /\{\s*\$\s*(where|ne|eq|gt|gte|lt|lte|in|nin|exists|type|mod|regex|text|where)/,
    /process\s*\.\s*env/i,
    /require\s*\(/,
    /Function\s*\(/,
    /eval\s*\(/,
  ];

  return noSqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Strict sanitization middleware - removes all HTML
 */
export function strictSanitization(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check for potentially dangerous content before sanitization
    const detectXSS = (value: unknown): boolean => {
      if (typeof value === 'string') {
        const xssPatterns = [
          /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
          /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
          /javascript\s*:/gi,
          /on\w+\s*=/gi,
          /<img[\s\S]*?onerror[\s\S]*?>/gi,
        ];
        return xssPatterns.some((pattern) => pattern.test(value));
      }
      return false;
    };

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      // Log detected XSS attempts for security monitoring
      const bodyString = JSON.stringify(req.body);
      if (detectXSS(bodyString)) {
        logger.warn(
          {
            path: req.path,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            body: bodyString.substring(0, 200),
          },
          'XSS attempt detected in request body',
        );
      }

      req.body = sanitizeObject(req.body, strictConfig);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const queryString = JSON.stringify(req.query);
      if (detectXSS(queryString)) {
        logger.warn(
          {
            path: req.path,
            ip: req.ip,
            query: queryString.substring(0, 200),
          },
          'XSS attempt detected in query parameters',
        );
      }

      req.query = sanitizeObject(req.query, strictConfig) as ParsedQs;
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, strictConfig) as ParamsDictionary;
    }

    next();
  } catch (_error) {
    logger.error({ error, path: req.path, ip: req.ip }, 'Input sanitization error');
    res.status(400).json({
      error: 'Invalid Input',
      message: 'Request contains invalid characters or format',
    });
  }
}

/**
 * Moderate sanitization middleware - allows basic HTML formatting
 */
export function moderateSanitization(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, moderateConfig);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, moderateConfig) as ParsedQs;
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, moderateConfig) as ParamsDictionary;
    }

    next();
  } catch (_error) {
    logger.error({ error, path: req.path }, 'Input sanitization error');
    res.status(400).json({
      error: 'Invalid Input',
      message: 'Request contains invalid characters or format',
    });
  }
}

/**
 * Lenient sanitization middleware - allows more HTML for rich content
 */
export function lenientSanitization(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, lenientConfig);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, lenientConfig) as ParsedQs;
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, lenientConfig) as ParamsDictionary;
    }

    next();
  } catch (_error) {
    logger.error({ error, path: req.path }, 'Input sanitization error');
    res.status(400).json({
      error: 'Invalid Input',
      message: 'Request contains invalid characters or format',
    });
  }
}

/**
 * SQL injection prevention middleware
 */
export function preventSQLInjection(req: Request, res: Response, next: NextFunction): void {
  try {
    const checkValue = (value: unknown, path: string): boolean => {
      if (typeof value === 'string' && containsSQLInjectionPattern(value)) {
        logger.warn(
          {
            path: req.path,
            value: value.substring(0, 100),
            location: path,
            ip: req.ip,
          },
          'Potential SQL injection attempt detected',
        );
        return true;
      }
      return false;
    };

    // Check body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (checkValue(req.body[key], `body.${key}`)) {
          res.status(400).json({
            error: 'Invalid Input',
            message: 'Request contains potentially dangerous patterns',
          });
          return;
        }
      }
    }

    // Check query params
    for (const key in req.query) {
      if (checkValue(req.query[key], `query.${key}`)) {
        res.status(400).json({
          error: 'Invalid Input',
          message: 'Request contains potentially dangerous patterns',
        });
        return;
      }
    }

    // Check URL params
    for (const key in req.params) {
      if (checkValue(req.params[key], `params.${key}`)) {
        res.status(400).json({
          error: 'Invalid Input',
          message: 'Request contains potentially dangerous patterns',
        });
        return;
      }
    }

    next();
  } catch (_error) {
    logger.error({ error }, 'SQL injection prevention error');
    next(error);
  }
}

/**
 * NoSQL injection prevention middleware
 */
export function preventNoSQLInjection(req: Request, res: Response, next: NextFunction): void {
  try {
    const checkValue = (value: unknown, path: string): boolean => {
      if (typeof value === 'string' && containsNoSQLInjectionPattern(value)) {
        logger.warn(
          {
            path: req.path,
            value: value.substring(0, 100),
            location: path,
            ip: req.ip,
          },
          'Potential NoSQL injection attempt detected',
        );
        return true;
      }
      return false;
    };

    // Deep check for objects that might contain MongoDB operators
    const deepCheck = (obj: unknown, path: string = ''): boolean => {
      if (obj === null || obj === undefined) return false;

      if (typeof obj === 'string') {
        return checkValue(obj, path);
      }

      if (typeof obj === 'object') {
        for (const key in obj) {
          if (key.startsWith('$')) {
            logger.warn(
              {
                path: req.path,
                key,
                location: path,
                ip: req.ip,
              },
              'MongoDB operator detected in request',
            );
            return true;
          }
          if (deepCheck(obj[key], `${path}.${key}`)) {
            return true;
          }
        }
      }

      return false;
    };

    if (req.body && deepCheck(req.body, 'body')) {
      res.status(400).json({
        error: 'Invalid Input',
        message: 'Request contains potentially dangerous patterns',
      });
      return;
    }

    next();
  } catch (_error) {
    logger.error({ error }, 'NoSQL injection prevention error');
    next(error);
  }
}

/**
 * Combined security middleware for maximum protection
 */
export function fullSecuritySanitization(req: Request, res: Response, next: NextFunction): void {
  strictSanitization(req, res, (err?: unknown) => {
    if (err) return next(err);
    preventSQLInjection(req, res, (err?: unknown) => {
      if (err) return next(err);
      preventNoSQLInjection(req, res, next);
    });
  });
}

// Export default as strict sanitization
export default strictSanitization;

// Export sanitizeInput as an alias for backward compatibility
export const sanitizeInput = strictSanitization;
