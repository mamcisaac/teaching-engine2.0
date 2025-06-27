import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

interface AuditLogOptions {
  action: string;
  resourceType: 'student' | 'parent_summary' | 'lesson_plan' | 'unit_plan' | 'curriculum' | 'user';
  sensitiveData?: boolean;
  includeRequestBody?: boolean;
  includeResponseStatus?: boolean;
}

export function createAuditLog(options: AuditLogOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const auditEntry = {
      action: options.action,
      resourceType: options.resourceType,
      resourceId: req.params.id || req.params.studentId || null,
      userId: req.user?.id || null,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      method: req.method,
      path: req.path,
      timestamp: new Date(),
      requestBody: options.includeRequestBody && !options.sensitiveData ? req.body : undefined,
      responseStatus: 0,
      duration: 0,
    };

    // Log response when it's sent
    const originalSend = res.send;
    res.send = function (data) {
      auditEntry.responseStatus = res.statusCode;
      auditEntry.duration = Date.now() - startTime;

      // Log to database asynchronously
      if (options.sensitiveData || auditEntry.responseStatus < 400) {
        logAuditEntry(auditEntry).catch((error) => {
          logger.error({ error, auditEntry }, 'Failed to create audit log entry');
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

async function logAuditEntry(entry: {
  action: string;
  resourceType: string;
  resourceId: string | null;
  userId: number | null;
  ipAddress: string;
  userAgent: string;
  method: string;
  path: string;
  timestamp: Date;
  requestBody?: unknown;
  responseStatus: number;
  duration: number;
}) {
  try {
    // AuditLog model archived - audit logging disabled in ETFO migration
    console.log('Audit log entry (model archived):', {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      method: entry.method,
      path: entry.path,
      requestBody: entry.requestBody ? '[LOGGED TO CONSOLE ONLY]' : null,
      responseStatus: entry.responseStatus,
      duration: entry.duration,
      timestamp: entry.timestamp,
    });
  } catch (error) {
    // If audit log table doesn't exist, just log to console
    logger.warn({ entry }, 'Audit log entry (table may not exist)');
  }
}

// Pre-configured audit loggers for different operations
export const auditLoggers = {
  // Student data access
  studentView: createAuditLog({
    action: 'VIEW_STUDENT',
    resourceType: 'student',
    sensitiveData: true,
  }),

  studentCreate: createAuditLog({
    action: 'CREATE_STUDENT',
    resourceType: 'student',
    sensitiveData: true,
    includeRequestBody: true,
  }),

  studentUpdate: createAuditLog({
    action: 'UPDATE_STUDENT',
    resourceType: 'student',
    sensitiveData: true,
    includeRequestBody: true,
  }),

  studentDelete: createAuditLog({
    action: 'DELETE_STUDENT',
    resourceType: 'student',
    sensitiveData: true,
  }),

  // Parent communication
  parentSummaryView: createAuditLog({
    action: 'VIEW_PARENT_SUMMARY',
    resourceType: 'parent_summary',
    sensitiveData: true,
  }),

  parentSummaryCreate: createAuditLog({
    action: 'CREATE_PARENT_SUMMARY',
    resourceType: 'parent_summary',
    sensitiveData: true,
  }),
};
