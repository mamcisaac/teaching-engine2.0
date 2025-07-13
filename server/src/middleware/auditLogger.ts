import type { Request, Response, NextFunction } from 'express';

import { logger } from '../logger.js';

// Define audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_CREATION = 'account_creation',
  ACCOUNT_DELETION = 'account_deletion',

  // Authorization events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_ELEVATION = 'permission_elevation',

  // Data access events
  DATA_VIEW = 'data_view',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_BACKUP = 'data_backup',

  // Sensitive operations
  PLAN_CREATION = 'plan_creation',
  PLAN_MODIFICATION = 'plan_modification',
  PLAN_DELETION = 'plan_deletion',
  CURRICULUM_IMPORT = 'curriculum_import',
  AI_GENERATION = 'ai_generation',
  TEMPLATE_CREATION = 'template_creation',

  // System operations
  CACHE_CLEAR = 'cache_clear',
  METRICS_RESET = 'metrics_reset',
  SYSTEM_CONFIG_CHANGE = 'system_config_change',

  // Security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation',

  // Privacy events
  PII_ACCESS = 'pii_access',
  DATA_RETENTION_ACTION = 'data_retention_action',
}

// Audit event interface
interface AuditEvent {
  eventType: AuditEventType;
  userId?: number;
  userEmail?: string;
  userRole?: string;
  resource?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit logging service
 */
class AuditLogger {
  /**
   * Log an audit event
   */
  logEvent(event: AuditEvent): void {
    // Enhanced audit logging with structured data
    logger.audit(`${event.eventType}: ${event.action}`, {
      eventType: event.eventType,
      userId: event.userId,
      userEmail: this.redactEmail(event.userEmail),
      userRole: event.userRole,
      resource: event.resource,
      resourceId: event.resourceId,
      action: event.action,
      details: this.sanitizeDetails(event.details),
      ipAddress: this.maskIP(event.ipAddress),
      userAgent: event.userAgent?.substring(0, 100),
      sessionId: event.sessionId?.substring(0, 8), // Only log first 8 chars
      timestamp: event.timestamp,
      success: event.success,
      errorMessage: event.errorMessage,
      metadata: event.metadata,
      severity: this.getEventSeverity(event.eventType),
      category: this.getEventCategory(event.eventType),
    });

    // Also log security events to separate security log
    if (this.isSecurityEvent(event.eventType)) {
      logger.security(event.eventType, {
        userId: event.userId,
        action: event.action,
        success: event.success,
        ipAddress: this.maskIP(event.ipAddress),
        details: this.sanitizeDetails(event.details),
      });
    }
  }

  /**
   * Create audit event from request context
   */
  createEventFromRequest(
    req: Request,
    eventType: AuditEventType,
    action: string,
    details?: Record<string, unknown>,
    success = true,
    errorMessage?: string,
  ): AuditEvent {
    return {
      eventType,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action,
      details,
      ipAddress: req.ip ?? req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId:
        (req as Request & { sessionID?: string; requestId?: string }).sessionID ??
        (req as Request & { sessionID?: string; requestId?: string }).requestId,
      timestamp: new Date().toISOString(),
      success,
      errorMessage,
    };
  }

  private redactEmail(email?: string): string | undefined {
    if (!email) {
return undefined;
}
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private maskIP(ip?: string): string | undefined {
    if (!ip) {
return undefined;
}
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }

  private sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!details) {
return undefined;
}

    const sanitized = { ...details };

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'privateKey',
      'sessionToken',
      'refreshToken',
      'accessToken',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private getEventSeverity(eventType: AuditEventType): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = [
      AuditEventType.ACCOUNT_DELETION,
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.SYSTEM_CONFIG_CHANGE,
    ];

    const highEvents = [
      AuditEventType.LOGIN_FAILURE,
      AuditEventType.ACCESS_DENIED,
      AuditEventType.PERMISSION_ELEVATION,
      AuditEventType.DATA_EXPORT,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.PII_ACCESS,
    ];

    const mediumEvents = [
      AuditEventType.LOGIN_SUCCESS,
      AuditEventType.PASSWORD_CHANGE,
      AuditEventType.ACCOUNT_CREATION,
      AuditEventType.DATA_IMPORT,
      AuditEventType.PLAN_DELETION,
      AuditEventType.RATE_LIMIT_EXCEEDED,
    ];

    if (criticalEvents.includes(eventType)) {
return 'critical';
}
    if (highEvents.includes(eventType)) {
return 'high';
}
    if (mediumEvents.includes(eventType)) {
return 'medium';
}
    return 'low';
  }

  private getEventCategory(eventType: AuditEventType): string {
    if (
      [
        AuditEventType.LOGIN_SUCCESS,
        AuditEventType.LOGIN_FAILURE,
        AuditEventType.LOGOUT,
        AuditEventType.PASSWORD_CHANGE,
        AuditEventType.ACCOUNT_CREATION,
        AuditEventType.ACCOUNT_DELETION,
      ].includes(eventType)
    ) {
      return 'authentication';
    }

    if (
      [
        AuditEventType.ACCESS_GRANTED,
        AuditEventType.ACCESS_DENIED,
        AuditEventType.PERMISSION_ELEVATION,
      ].includes(eventType)
    ) {
      return 'authorization';
    }

    if (
      [
        AuditEventType.DATA_VIEW,
        AuditEventType.DATA_EXPORT,
        AuditEventType.DATA_IMPORT,
        AuditEventType.DATA_BACKUP,
      ].includes(eventType)
    ) {
      return 'data_access';
    }

    if (
      [
        AuditEventType.PLAN_CREATION,
        AuditEventType.PLAN_MODIFICATION,
        AuditEventType.PLAN_DELETION,
        AuditEventType.CURRICULUM_IMPORT,
        AuditEventType.AI_GENERATION,
        AuditEventType.TEMPLATE_CREATION,
      ].includes(eventType)
    ) {
      return 'business_operation';
    }

    if (
      [
        AuditEventType.RATE_LIMIT_EXCEEDED,
        AuditEventType.SUSPICIOUS_ACTIVITY,
        AuditEventType.SECURITY_VIOLATION,
      ].includes(eventType)
    ) {
      return 'security';
    }

    return 'system';
  }

  private isSecurityEvent(eventType: AuditEventType): boolean {
    const securityEvents = [
      AuditEventType.LOGIN_FAILURE,
      AuditEventType.ACCESS_DENIED,
      AuditEventType.RATE_LIMIT_EXCEEDED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.SECURITY_VIOLATION,
    ];

    return securityEvents.includes(eventType);
  }
}

// Create global audit logger instance
export const auditLogger = new AuditLogger();

/**
 * Middleware to automatically audit specific operations
 */
export function auditMiddleware(
  eventType: AuditEventType,
  getActionFromRequest?: (req: Request) => string,
  getDetailsFromRequest?: (req: Request) => Record<string, unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to capture success/failure
    res.json = function (data: unknown) {
      const success = res.statusCode < 400;
      const action = getActionFromRequest ? getActionFromRequest(req) : `${req.method} ${req.path}`;
      const details = getDetailsFromRequest ? getDetailsFromRequest(req) : undefined;

      const event = auditLogger.createEventFromRequest(
        req,
        eventType,
        action,
        details,
        success,
        success
          ? undefined
          : typeof data === 'object' && data !== null && 'message' in data
            ? (data as { message: string }).message
            : 'Operation failed',
      );

      auditLogger.logEvent(event);

      return originalJson.call(this, data);
    };

    res.send = function (data: unknown) {
      const success = res.statusCode < 400;
      const action = getActionFromRequest ? getActionFromRequest(req) : `${req.method} ${req.path}`;
      const details = getDetailsFromRequest ? getDetailsFromRequest(req) : undefined;

      const event = auditLogger.createEventFromRequest(
        req,
        eventType,
        action,
        details,
        success,
        success ? undefined : 'Operation failed',
      );

      auditLogger.logEvent(event);

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Convenience functions for common audit events
 */
export const auditFunctions = {
  loginAttempt: (req: Request, success: boolean, errorMessage?: string) => {
    const event = auditLogger.createEventFromRequest(
      req,
      success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILURE,
      'User login attempt',
      { email: req.body.email },
      success,
      errorMessage,
    );
    auditLogger.logEvent(event);
  },

  logout: (req: Request) => {
    const event = auditLogger.createEventFromRequest(req, AuditEventType.LOGOUT, 'User logout');
    auditLogger.logEvent(event);
  },

  planOperation: (
    req: Request,
    operation: 'create' | 'update' | 'delete',
    planType: string,
    planId: string,
  ) => {
    const eventTypeMap = {
      create: AuditEventType.PLAN_CREATION,
      update: AuditEventType.PLAN_MODIFICATION,
      delete: AuditEventType.PLAN_DELETION,
    };

    const event = auditLogger.createEventFromRequest(
      req,
      eventTypeMap[operation],
      `${operation} ${planType}`,
      { planType, planId },
    );
    auditLogger.logEvent(event);
  },

  dataExport: (req: Request, dataType: string, format: string) => {
    const event = auditLogger.createEventFromRequest(
      req,
      AuditEventType.DATA_EXPORT,
      `Export ${dataType}`,
      { dataType, format },
    );
    auditLogger.logEvent(event);
  },

  curriculumImport: (req: Request, fileName: string, recordCount: number) => {
    const event = auditLogger.createEventFromRequest(
      req,
      AuditEventType.CURRICULUM_IMPORT,
      'Import curriculum data',
      { fileName, recordCount },
    );
    auditLogger.logEvent(event);
  },

  aiGeneration: (req: Request, model: string, operation: string) => {
    const event = auditLogger.createEventFromRequest(
      req,
      AuditEventType.AI_GENERATION,
      `AI ${operation}`,
      { model, operation },
    );
    auditLogger.logEvent(event);
  },

  suspiciousActivity: (req: Request, activityType: string, details: Record<string, unknown>) => {
    const event = auditLogger.createEventFromRequest(
      req,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      `Suspicious activity: ${activityType}`,
      details,
    );
    auditLogger.logEvent(event);
  },

  rateLimitExceeded: (req: Request, limitType: string) => {
    const event = auditLogger.createEventFromRequest(
      req,
      AuditEventType.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      { limitType },
    );
    auditLogger.logEvent(event);
  },
};
