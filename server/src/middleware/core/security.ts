/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import cors from 'cors';
import type { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import DOMPurify from 'isomorphic-dompurify';

import { logger } from '../../logger';
import { AppError } from '../../utils/errors';

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError(403, 'Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
};

// Apply comprehensive security headers
export const applySecurityMiddleware = (app: Application): void => {
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS
  app.use(cors(corsOptions));

  // Additional security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
};

// Input sanitization middleware
export const inputSanitizationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // Recursive sanitization function
  const sanitize = (data: unknown): unknown => {
    if (typeof data === 'string') {
      // Remove any HTML/script tags
      return DOMPurify.sanitize(data, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      }).trim();
    }

    if (Array.isArray(data)) {
      return data.map(sanitize);
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }

    return data;
  };

  // Sanitize different parts of the request
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query) as any;
  }

  if (req.params) {
    req.params = sanitize(req.params) as any;
  }

  next();
};

// XSS Protection middleware
export const xssProtectionMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  // Additional XSS protection for JSON responses
  const originalJson = res.json;

  res.json = function (data: unknown) {
    // Escape HTML in JSON responses
    const escapeHtml = (str: string): string => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const escapeData = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        return escapeHtml(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(escapeData);
      }
      if (obj && typeof obj === 'object') {
        const escaped: any = {};
        for (const [key, value] of Object.entries(obj)) {
          escaped[key] = escapeData(value);
        }
        return escaped;
      }
      return obj;
    };

    // Only escape HTML in production
    const processedData = process.env.NODE_ENV === 'production' ? escapeData(data) : data;

    return originalJson.call(this, processedData);
  };

  next();
};

// SQL Injection protection (for raw queries)
export const sqlInjectionProtectionMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bor\b\s*\d+\s*=\s*\d+)/gi,
    /(\band\b\s*\d+\s*=\s*\d+)/gi,
  ];

  const checkForSQLInjection = (value: unknown): boolean => {
    if (typeof value !== 'string') {
return false;
}

    return suspiciousPatterns.some((pattern) => pattern.test(value));
  };

  const checkObject = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') {
return;
}

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (checkForSQLInjection(value)) {
        logger.warn(
          {
            key,
            value,
            ip: req.ip,
            path: req.path,
            userId: (req as any).user?.id,
          },
          'Potential SQL injection attempt detected',
        );

        throw new AppError(400, 'Invalid input detected', 'SECURITY_VIOLATION');
      }

      if (value && typeof value === 'object') {
        checkObject(value);
      }
    }
  };

  // Check all input sources
  try {
    if (req.body) {
checkObject(req.body);
}
    if (req.query) {
checkObject(req.query);
}
    if (req.params) {
checkObject(req.params);
}
  } catch (_error) {
    next(_error); return;
  }

  next();
};

// File upload security middleware
export const fileUploadSecurityMiddleware = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
) => (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.file && !req.files) {
      next(); return;
    }

    const files = req.file ? [req.file] : Object.values(req.files ?? {}).flat();

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        next(new AppError(400, 'Invalid file type', 'INVALID_FILE_TYPE')); return;
      }

      // Check file size (10MB default)
      const maxSize = parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10);
      if (file.size > maxSize) {
        next(new AppError(400, 'File size too large', 'FILE_TOO_LARGE')); return;
      }

      // Check file extension
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      const allowedExtensions = allowedTypes.map((type) => {
        const parts = type.split('/');
        return parts[1] ?? parts[0];
      });

      if (!ext || !allowedExtensions.includes(ext)) {
        next(new AppError(400, 'Invalid file extension', 'INVALID_FILE_EXTENSION')); return;
      }
    }

    next();
  };

// Security monitoring middleware
export const securityMonitoringMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // Track security-relevant events
  const securityEvents = {
    suspiciousHeaders: [] as string[],
    suspiciousPatterns: [] as string[],
  };

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      securityEvents.suspiciousHeaders.push(header);
    }
  }

  // Check for path traversal attempts
  if (req.path.includes('../') || req.path.includes('..\\')) {
    securityEvents.suspiciousPatterns.push('path_traversal');
  }

  // Log security events
  if (securityEvents.suspiciousHeaders.length > 0 || securityEvents.suspiciousPatterns.length > 0) {
    logger.warn(
      {
        securityEvents,
        ip: req.ip,
        path: req.path,
        method: req.method,
        headers: req.headers,
      },
      'Security monitoring alert',
    );
  }

  next();
};

// Rate limiting specific to authentication attempts
export const authRateLimitMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // This would integrate with the rate limiting module
  // Placeholder for now - actual implementation in rateLimit module
  next();
};
