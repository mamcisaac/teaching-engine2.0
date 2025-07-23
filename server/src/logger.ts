/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { performance } from 'perf_hooks';

// eslint-disable-next-line import/no-named-as-default
import pino, { stdSerializers } from 'pino';

// Log levels configuration - kept for future use
// const _LOG_LEVELS = {
//   fatal: 60,
//   error: 50,
//   warn: 40,
//   info: 30,
//   debug: 20,
//   trace: 10
// };

// Base logger configuration
const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Custom serializers for better structured logging
  serializers: {
    req: (req: unknown) => {
      const request = req as Record<string, unknown> & {
        method?: string;
        url?: string;
        headers?: Record<string, unknown>;
        remoteAddress?: string;
        remotePort?: number;
        connection?: { remoteAddress?: string; remotePort?: number };
      };
      return {
        method: request.method,
        url: request.url,
        headers: {
          'user-agent': request.headers?.['user-agent'],
          'content-type': request.headers?.['content-type'],
          authorization: request.headers?.authorization != null && request.headers.authorization !== '' ? '[REDACTED]' : undefined,
        },
        remoteAddress: request.remoteAddress ?? request.connection?.remoteAddress,
        remotePort: (request.remotePort != null && !isNaN(request.remotePort)) ? request.remotePort : request.connection?.remotePort,
      };
    },

    res: (res: unknown) => {
      const response = res as { statusCode?: number; getHeader?: (name: string) => unknown };
      return {
        statusCode: response.statusCode,
        headers: {
          'content-type':
            typeof response.getHeader === 'function'
              ? response.getHeader('content-type')
              : undefined,
          'content-length':
            typeof response.getHeader === 'function'
              ? response.getHeader('content-length')
              : undefined,
        },
      };
    },

    err: stdSerializers.err,

    user: (user: unknown) => {
      const userData = user as { id?: string | number; email?: string; role?: string };
      return {
        id: userData.id,
        email:
          (userData.email != null && userData.email !== '') && typeof userData.email === 'string'
            ? `${userData.email.substring(0, 3)  }***`
            : undefined,
        role: userData.role,
      };
    },
  },

  // Add timestamp and performance info
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Format based on environment
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
        hideObject: false,
        customColors: 'error:red,warn:yellow,info:green,debug:blue,trace:gray',
      },
    },
  }),
};

// Create the base logger
const baseLogger = pino(pinoConfig);

// Enhanced logger with custom methods
class EnhancedLogger {
  private logger: pino.Logger;
  private requestId: string | null = null;

  constructor(logger: pino.Logger) {
    this.logger = logger;
  }

  // Standard log methods (allow both string and object for flexibility)
  fatal(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.fatal(this.enhanceLogObject(obj), msg, ...args);
  }

  error(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.error(this.enhanceLogObject(obj), msg, ...args);
  }

  warn(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.warn(this.enhanceLogObject(obj), msg, ...args);
  }

  info(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.info(this.enhanceLogObject(obj), msg, ...args);
  }

  debug(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.debug(this.enhanceLogObject(obj), msg, ...args);
  }

  trace(obj: Record<string, unknown> | string, msg?: string, ...args: unknown[]): void {
    this.logger.trace(this.enhanceLogObject(obj), msg, ...args);
  }

  // Performance logging
  time(label: string): void {
    this.debug(
      { performanceStart: label, timestamp: performance.now() },
      `Performance timer started: ${label}`,
    );
  }

  timeEnd(label: string): void {
    this.debug(
      { performanceEnd: label, timestamp: performance.now() },
      `Performance timer ended: ${label}`,
    );
  }

  // Audit logging for sensitive operations
  audit(operation: string, details: Record<string, unknown> = {}): void {
    this.info(
      {
        audit: true,
        operation,
        details: this.sanitizeAuditDetails(details),
        timestamp: new Date().toISOString(),
      },
      `Audit: ${operation}`,
    );
  }

  // Security event logging
  security(event: string, details: Record<string, unknown> = {}): void {
    this.warn(
      {
        security: true,
        event,
        details: this.sanitizeSecurityDetails(details),
        timestamp: new Date().toISOString(),
      },
      `Security: ${event}`,
    );
  }

  // Business logic logging
  business(action: string, context: Record<string, unknown> = {}): void {
    this.info(
      {
        business: true,
        action,
        context: this.sanitizeBusinessContext(context),
        timestamp: new Date().toISOString(),
      },
      `Business: ${action}`,
    );
  }

  // API request/response logging
  apiRequest(req: Record<string, unknown>, additionalData: Record<string, unknown> = {}): void {
    this.info(
      {
        api: true,
        type: 'request',
        req,
        ...additionalData,
      },
      `API Request: ${req.method} ${req.url}`,
    );
  }

  apiResponse(
    req: Record<string, unknown>,
    res: Record<string, unknown>,
    duration: number,
    additionalData: Record<string, unknown> = {},
  ): void {
    this.info(
      {
        api: true,
        type: 'response',
        req,
        res,
        duration,
        ...additionalData,
      },
      `API Response: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
    );
  }

  // Database operation logging
  database(operation: string, details: Record<string, unknown> = {}): void {
    this.debug(
      {
        database: true,
        operation,
        details: this.sanitizeDatabaseDetails(details),
      },
      `Database: ${operation}`,
    );
  }

  // AI operation logging
  ai(operation: string, model: string, details: Record<string, unknown> = {}): void {
    this.info(
      {
        ai: true,
        operation,
        model,
        details: this.sanitizeAIDetails(details),
      },
      `AI: ${operation} using ${model}`,
    );
  }

  // Create child logger with context
  child(context: Record<string, unknown>): EnhancedLogger {
    const childLogger = this.logger.child(this.enhanceLogObject(context));
    const enhanced = new EnhancedLogger(childLogger);
    enhanced.requestId = this.requestId;
    return enhanced;
  }

  // Set request ID for request tracing
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  // Enhance log object with common fields
  private enhanceLogObject(obj: unknown): Record<string, unknown> {
    if (typeof obj === 'string') {
      return {
        message: obj,
        requestId: this.requestId,
        service: 'teaching-engine',
        version: (process.env.npm_package_version != null && process.env.npm_package_version !== '') ? process.env.npm_package_version : 'unknown',
      };
    }

    if (obj != null && typeof obj === 'object') {
      return {
        ...(obj as Record<string, unknown>),
        requestId: this.requestId,
        service: 'teaching-engine',
        version: (process.env.npm_package_version != null && process.env.npm_package_version !== '') ? process.env.npm_package_version : 'unknown',
      };
    }

    return {
      data: obj,
      requestId: this.requestId,
      service: 'teaching-engine',
      version: process.env.npm_package_version ?? 'unknown',
    };
  }

  // Sanitization methods to prevent sensitive data leakage
  private sanitizeAuditDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;

    // Redact email addresses
    if (sanitized.email != null) {
      sanitized.email = this.redactEmail(sanitized.email);
    }

    return sanitized;
  }

  private sanitizeSecurityDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    // Keep only necessary security info
    if (sanitized.ip != null) {
      sanitized.ip = this.maskIP(sanitized.ip);
    }

    if (sanitized.userAgent != null && typeof sanitized.userAgent === 'string') {
      sanitized.userAgent = sanitized.userAgent.substring(0, 100);
    }

    return sanitized;
  }

  private sanitizeBusinessContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...context };

    // Remove any PII
    delete sanitized.studentData;
    delete sanitized.personalInfo;

    return sanitized;
  }

  private sanitizeDatabaseDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    // Remove sensitive query parameters
    if (sanitized.query != null && typeof sanitized.query === 'string') {
      sanitized.query = sanitized.query.replace(
        /password\s*=\s*'[^']*'/gi,
        "password='[REDACTED]'",
      );
    }

    return sanitized;
  }

  private sanitizeAIDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    // Limit prompt size and remove sensitive content
    if (sanitized.prompt != null && typeof sanitized.prompt === 'string') {
      sanitized.prompt =
        sanitized.prompt.substring(0, 500) + (sanitized.prompt.length > 500 ? '...' : '');
    }

    return sanitized;
  }

  private redactEmail(email: unknown): string {
    if (typeof email !== 'string') {
return '[INVALID_EMAIL]';
}
    const [local, domain] = email.split('@');
    if (local == null || local === '' || domain == null || domain === '') {
return '[INVALID_EMAIL]';
}
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private maskIP(ip: unknown): string {
    if (typeof ip !== 'string') {
return 'xxx.xxx.xxx.xxx';
}
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }
}

// Create and export enhanced logger instance
const logger = new EnhancedLogger(baseLogger);

// Export types for TypeScript
export type Logger = EnhancedLogger;
export { EnhancedLogger };

export { logger };
