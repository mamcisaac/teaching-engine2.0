import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppError } from '../../utils/errors';
import { logger } from '../../logger';

type Context = Record<string, unknown>;

interface UserContext {
  id: string | number;
  email?: string;
  name?: string;
  role?: string;
  organizationId?: string | number;
}

interface ErrorCategory {
  category: string;
  severity: Sentry.SeverityLevel;
  tags: Record<string, string>;
}

interface BreadcrumbData {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}

export class ErrorReportingService {
  private enabled: boolean = false;
  private mockMode: boolean = false;
  private sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'creditCard',
    'credit_card',
    'ssn',
    'socialSecurityNumber',
    'bankAccount',
    'bank_account',
    'pin',
    'cvv',
    'cvc',
    'securityCode',
    'security_code',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'privateKey',
    'private_key',
    'sessionId',
    'session_id',
    'cookie',
    'phone',
    'phoneNumber',
    'phone_number',
    'address',
    'streetAddress',
    'street_address',
    'zipCode',
    'zip_code',
    'postalCode',
    'postal_code',
  ];

  private piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone number
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Bearer tokens
  ];

  constructor() {
    this.mockMode = process.env.SENTRY_MOCK === 'true';
  }

  init(): void {
    if (this.mockMode) {
      logger.info('Using mock error reporting service');
      this.enabled = true;
      return;
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      logger.info('Error reporting disabled in development');
      return;
    }

    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
      logger.warn('SENTRY_DSN not configured, error reporting disabled');
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'production',
        integrations: [
          // Automatically capture console errors
          new Sentry.Integrations.Console(),
          // HTTP request tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // Express middleware tracing
          new Sentry.Integrations.Express(),
          // Performance profiling (optional, can be removed to reduce overhead)
          nodeProfilingIntegration(),
        ],
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend: (event, hint) => this.beforeSend(event, hint),
        beforeBreadcrumb: (breadcrumb, hint) => this.beforeBreadcrumb(breadcrumb, hint),
      });

      this.enabled = true;
      logger.info('Error reporting service initialized');
    } catch (error) {
      logger.error('Failed to initialize error reporting:', error);
    }
  }

  captureError(error: Error | unknown, context?: Record<string, unknown>): void {
    if (!this.enabled) {
      logger.debug(`Error reporting disabled, skipping error: ${error}`);
      return;
    }

    if (this.mockMode) {
      logger.info(
        `[MOCK] Would capture error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    const errorCategory = this.categorizeError(error);
    const sanitizedContext = this.sanitizeData(context || {});

    Sentry.withScope((scope) => {
      // Set error category and severity
      scope.setLevel(errorCategory.severity);
      scope.setTags(errorCategory.tags);
      scope.setContext('category', { type: errorCategory.category });

      // Add custom context
      if (sanitizedContext) {
        scope.setContext('custom', sanitizedContext as Context);
      }

      // Capture the exception
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info(`[MOCK] Would capture message: ${message} (level: ${level})`);
      return;
    }

    Sentry.captureMessage(message, level);
  }

  setUserContext(user: UserContext | null): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info(`[MOCK] Would set user context for user: ${user?.id}`);
      return;
    }

    if (!user) {
      Sentry.configureScope((scope) => scope.clear());
      return;
    }

    const sanitizedUser = {
      id: String(user.id),
      email: user.email ? this.maskEmail(user.email) : undefined,
      username: user.name,
      role: user.role,
      organizationId: user.organizationId ? String(user.organizationId) : undefined,
    };

    Sentry.setUser(sanitizedUser);
  }

  addBreadcrumb(breadcrumb: BreadcrumbData): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info(`[MOCK] Would add breadcrumb: ${breadcrumb.message}`);
      return;
    }

    const sanitizedData = this.sanitizeData(breadcrumb.data || {});

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level || 'info',
      data: sanitizedData as Record<string, unknown>,
      timestamp: Date.now() / 1000,
    });
  }

  setErrorContext(key: string, context: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info(`[MOCK] Would set error context: ${key}`);
      return;
    }

    const sanitizedContext = this.sanitizeData(context);
    Sentry.setContext(key, sanitizedContext as Context);
  }

  categorizeError(error: unknown): ErrorCategory {
    // Default category
    const category: ErrorCategory = {
      category: 'system',
      severity: 'error',
      tags: {},
    };

    if (error instanceof AppError) {
      // Categorize based on status code and error code
      const statusCode = error.statusCode;
      const errorCode = error.code;

      category.tags = {
        error_code: errorCode || 'UNKNOWN',
        status_code: String(statusCode),
      };

      if (statusCode >= 400 && statusCode < 500) {
        category.severity = 'warning';

        if (statusCode === 400 || errorCode?.includes('VALIDATION')) {
          category.category = 'validation';
        } else if (statusCode === 401 || statusCode === 403) {
          category.category = 'authentication';
        } else if (statusCode === 404) {
          category.category = 'not_found';
        } else if (statusCode === 429) {
          category.category = 'rate_limit';
        } else {
          category.category = 'client_error';
        }
      } else if (statusCode >= 500) {
        category.severity = 'error';
        category.category = 'server_error';
      }
    } else if (error instanceof Error) {
      category.tags = {
        error_type: error.constructor.name,
      };

      // Check for specific error patterns
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        category.category = 'network';
        category.severity = 'warning';
      } else if (
        message.includes('database') ||
        message.includes('prisma') ||
        message.includes('sql')
      ) {
        category.category = 'database';
        category.severity = 'error';
      } else if (message.includes('permission') || message.includes('unauthorized')) {
        category.category = 'authorization';
        category.severity = 'warning';
      }
    }

    return category;
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  private beforeSend(event: Sentry.Event, _hint: Sentry.EventHint): Sentry.Event | null {
    // Sanitize the entire event
    return this.sanitizeEvent(event);
  }

  private beforeBreadcrumb(
    breadcrumb: Sentry.Breadcrumb,
    _hint?: Sentry.BreadcrumbHint,
  ): Sentry.Breadcrumb | null {
    // Sanitize breadcrumb
    if (breadcrumb.message) {
      breadcrumb.message = this.sanitizeString(breadcrumb.message);
    }

    if (breadcrumb.data) {
      breadcrumb.data = this.sanitizeData(breadcrumb.data) as Record<string, unknown>;
    }

    return breadcrumb;
  }

  private sanitizeEvent(event: Sentry.Event): Sentry.Event {
    // Deep clone to avoid modifying original
    const sanitized = JSON.parse(JSON.stringify(event));

    // Sanitize message
    if (sanitized.message) {
      sanitized.message = this.sanitizeString(sanitized.message);
    }

    // Sanitize extra data
    if (sanitized.extra) {
      sanitized.extra = this.sanitizeData(sanitized.extra);
    }

    // Sanitize request data
    if (sanitized.request) {
      if (sanitized.request.headers) {
        sanitized.request.headers = this.sanitizeHeaders(sanitized.request.headers);
      }
      if (sanitized.request.data) {
        sanitized.request.data = this.sanitizeData(sanitized.request.data);
      }
      if (sanitized.request.query_string) {
        sanitized.request.query_string = this.sanitizeString(sanitized.request.query_string);
      }
    }

    // Sanitize user data
    if (sanitized.user && sanitized.user.email) {
      sanitized.user.email = this.maskEmail(sanitized.user.email);
    }

    // Sanitize contexts
    if (sanitized.contexts) {
      for (const key in sanitized.contexts) {
        sanitized.contexts[key] = this.sanitizeData(sanitized.contexts[key]);
      }
    }

    return sanitized;
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};

      for (const key in data as Record<string, unknown>) {
        const lowerKey = key.toLowerCase();
        const value = (data as Record<string, unknown>)[key];

        // Check if field should be redacted
        if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else if (key === 'email') {
          sanitized[key] = this.maskEmail(value as string);
        } else if (key === 'ip' || key === 'ipAddress' || key === 'ip_address') {
          sanitized[key] = this.maskIP(value as string);
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }

      return sanitized;
    }

    return data;
  }

  private sanitizeString(str: string): string {
    let sanitized = str;

    // Remove PII patterns
    for (const pattern of this.piiPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    // Remove sensitive keywords with their values
    const sensitivePattern = new RegExp(
      `(${this.sensitiveFields.join('|')})\\s*[:=]\\s*[^\\s,;}]+`,
      'gi',
    );
    sanitized = sanitized.replace(sensitivePattern, '$1=[REDACTED]');

    return sanitized;
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const key in headers) {
      const lowerKey = key.toLowerCase();

      if (
        lowerKey.includes('authorization') ||
        lowerKey.includes('x-api-key') ||
        lowerKey.includes('x-auth-token') ||
        lowerKey.includes('cookie')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = headers[key];
      }
    }

    return sanitized;
  }

  private maskEmail(email: string): string {
    if (!email || typeof email !== 'string') return '[INVALID_EMAIL]';

    const parts = email.split('@');
    if (parts.length !== 2) return '[INVALID_EMAIL]';

    const [local, domain] = parts;
    const maskedLocal = local.length > 3 ? local.substring(0, 3) + '***' : '***';

    return `${maskedLocal}@${domain}`;
  }

  private maskIP(ip: string): string {
    if (!ip || typeof ip !== 'string') return 'xxx.xxx.xxx.xxx';

    const parts = ip.split('.');
    if (parts.length === 4) {
      // Keep first two octets for general location info
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }

    // IPv6 or invalid format
    return 'xxx.xxx.xxx.xxx';
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();
