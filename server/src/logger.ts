import pino from 'pino';
import { performance } from 'perf_hooks';

// Log levels configuration
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
};

// Base logger configuration
const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Custom serializers for better structured logging
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers?.['user-agent'],
        'content-type': req.headers?.['content-type'],
        'authorization': req.headers?.authorization ? '[REDACTED]' : undefined
      },
      remoteAddress: req.remoteAddress || req.connection?.remoteAddress,
      remotePort: req.remotePort || req.connection?.remotePort
    }),
    
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader?.('content-type'),
        'content-length': res.getHeader?.('content-length')
      }
    }),
    
    err: pino.stdSerializers.err,
    
    user: (user: any) => ({
      id: user?.id,
      email: user?.email ? user.email.substring(0, 3) + '***' : undefined,
      role: user?.role
    })
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
        customColors: 'error:red,warn:yellow,info:green,debug:blue,trace:gray'
      }
    }
  })
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

  // Standard log methods
  fatal(obj: any, msg?: string, ...args: any[]) {
    return this.logger.fatal(this.enhanceLogObject(obj), msg, ...args);
  }

  error(obj: any, msg?: string, ...args: any[]) {
    return this.logger.error(this.enhanceLogObject(obj), msg, ...args);
  }

  warn(obj: any, msg?: string, ...args: any[]) {
    return this.logger.warn(this.enhanceLogObject(obj), msg, ...args);
  }

  info(obj: any, msg?: string, ...args: any[]) {
    return this.logger.info(this.enhanceLogObject(obj), msg, ...args);
  }

  debug(obj: any, msg?: string, ...args: any[]) {
    return this.logger.debug(this.enhanceLogObject(obj), msg, ...args);
  }

  trace(obj: any, msg?: string, ...args: any[]) {
    return this.logger.trace(this.enhanceLogObject(obj), msg, ...args);
  }

  // Performance logging
  time(label: string): void {
    this.debug({ performanceStart: label, timestamp: performance.now() }, `Performance timer started: ${label}`);
  }

  timeEnd(label: string): void {
    this.debug({ performanceEnd: label, timestamp: performance.now() }, `Performance timer ended: ${label}`);
  }

  // Audit logging for sensitive operations
  audit(operation: string, details: any = {}) {
    return this.info({
      audit: true,
      operation,
      details: this.sanitizeAuditDetails(details),
      timestamp: new Date().toISOString()
    }, `Audit: ${operation}`);
  }

  // Security event logging
  security(event: string, details: any = {}) {
    return this.warn({
      security: true,
      event,
      details: this.sanitizeSecurityDetails(details),
      timestamp: new Date().toISOString()
    }, `Security: ${event}`);
  }

  // Business logic logging
  business(action: string, context: any = {}) {
    return this.info({
      business: true,
      action,
      context: this.sanitizeBusinessContext(context),
      timestamp: new Date().toISOString()
    }, `Business: ${action}`);
  }

  // API request/response logging
  apiRequest(req: any, additionalData: any = {}) {
    return this.info({
      api: true,
      type: 'request',
      req,
      ...additionalData
    }, `API Request: ${req.method} ${req.url}`);
  }

  apiResponse(req: any, res: any, duration: number, additionalData: any = {}) {
    return this.info({
      api: true,
      type: 'response',
      req,
      res,
      duration,
      ...additionalData
    }, `API Response: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  }

  // Database operation logging
  database(operation: string, details: any = {}) {
    return this.debug({
      database: true,
      operation,
      details: this.sanitizeDatabaseDetails(details)
    }, `Database: ${operation}`);
  }

  // AI operation logging
  ai(operation: string, model: string, details: any = {}) {
    return this.info({
      ai: true,
      operation,
      model,
      details: this.sanitizeAIDetails(details)
    }, `AI: ${operation} using ${model}`);
  }

  // Create child logger with context
  child(context: any) {
    const childLogger = this.logger.child(this.enhanceLogObject(context));
    const enhanced = new EnhancedLogger(childLogger);
    enhanced.requestId = this.requestId;
    return enhanced;
  }

  // Set request ID for request tracing
  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  // Enhance log object with common fields
  private enhanceLogObject(obj: any): any {
    if (typeof obj === 'string') {
      return {
        message: obj,
        requestId: this.requestId,
        service: 'teaching-engine',
        version: process.env.npm_package_version || 'unknown'
      };
    }

    return {
      ...obj,
      requestId: this.requestId,
      service: 'teaching-engine',
      version: process.env.npm_package_version || 'unknown'
    };
  }

  // Sanitization methods to prevent sensitive data leakage
  private sanitizeAuditDetails(details: any): any {
    const sanitized = { ...details };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;
    
    // Redact email addresses
    if (sanitized.email) {
      sanitized.email = this.redactEmail(sanitized.email);
    }
    
    return sanitized;
  }

  private sanitizeSecurityDetails(details: any): any {
    const sanitized = { ...details };
    
    // Keep only necessary security info
    if (sanitized.ip) {
      sanitized.ip = this.maskIP(sanitized.ip);
    }
    
    if (sanitized.userAgent) {
      sanitized.userAgent = sanitized.userAgent.substring(0, 100);
    }
    
    return sanitized;
  }

  private sanitizeBusinessContext(context: any): any {
    const sanitized = { ...context };
    
    // Remove any PII
    delete sanitized.studentData;
    delete sanitized.personalInfo;
    
    return sanitized;
  }

  private sanitizeDatabaseDetails(details: any): any {
    const sanitized = { ...details };
    
    // Remove sensitive query parameters
    if (sanitized.query) {
      sanitized.query = sanitized.query.replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'");
    }
    
    return sanitized;
  }

  private sanitizeAIDetails(details: any): any {
    const sanitized = { ...details };
    
    // Limit prompt size and remove sensitive content
    if (sanitized.prompt) {
      sanitized.prompt = sanitized.prompt.substring(0, 500) + (sanitized.prompt.length > 500 ? '...' : '');
    }
    
    return sanitized;
  }

  private redactEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private maskIP(ip: string): string {
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

export default logger;
