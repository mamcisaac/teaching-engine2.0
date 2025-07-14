import type { Request, Response, NextFunction } from 'express';

import { logger } from '../logger.js';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  // Retry configuration for future use
  // private readonly maxRetries = 3;
  // private readonly retryDelay = 1000; // 1 second

  /**
   * Log an audit event
   * Currently logs to application logs only, as AuditLog table is not yet implemented
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Log to application logs
    if (entry.success) {
      logger.info(
        {
          audit: true,
          ...entry,
        },
        `Audit: ${entry.action} on ${entry.resource}`,
      );
    } else {
      logger.warn(
        {
          audit: true,
          ...entry,
        },
        `Audit: Failed ${entry.action} on ${entry.resource}`,
      );
    }

    // NOTE: Database audit logging can be implemented when AuditLog model is added to schema
    // Future implementation: await prisma.auditLog.create({ data: entry });
  }

  /**
   * Create audit middleware for specific actions
   */
  middleware(action: string, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const originalSend = res.send;
      const originalJson = res.json;

      // let _responseData: unknown;
      let success = true;
      let errorMessage: string | undefined;

      // Intercept response
      res.send = function (data: unknown) {
        // _responseData = data as Record<string, unknown>;
        if (res.statusCode >= 400) {
          success = false;
          const errorData = data as { error?: string; message?: string };
          errorMessage = typeof data === 'string' ? data : errorData.error ?? errorData.message;
        }
        return originalSend.call(res, data);
      };

      res.json = function (data: unknown) {
        // _responseData = data as Record<string, unknown>;
        if (res.statusCode >= 400) {
          success = false;
          const errorData = data as { error?: string; message?: string };
          errorMessage = errorData.error ?? errorData.message;
        }
        return originalJson.call(res, data);
      };

      // Continue with request
      res.on('finish', async () => {
        const duration = Date.now() - start;

        const entry: AuditLogEntry = {
          userId: req.user?.id.toString() ?? 'anonymous',
          action,
          resource,
          resourceId: req.params.id ?? (req.body as Record<string, unknown>).id as string,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            duration,
            statusCode: res.statusCode,
          },
          ip: req.ip ?? req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date(),
          success,
          errorMessage,
        };

        // Log asynchronously, don't block response
        this.log(entry).catch((error: unknown) => {
          logger.error({ error: error as Error }, 'Failed to create audit log');
        });
      });

      next();
    };
  }

  /**
   * Log a custom audit event
   */
  async logCustom(
    userId: string,
    action: string,
    resource: string,
    options?: {
      resourceId?: string;
      metadata?: Record<string, unknown>;
      success?: boolean;
      errorMessage?: string;
      req?: Request;
    },
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      action,
      resource,
      resourceId: options?.resourceId,
      metadata: options?.metadata,
      ip: options?.req?.ip ?? options?.req?.socket.remoteAddress,
      userAgent: options?.req?.headers['user-agent'],
      timestamp: new Date(),
      success: options?.success ?? true,
      errorMessage: options?.errorMessage,
    };

    await this.log(entry);
  }
}

// Create singleton instance
export const auditLogger = new AuditLogger();

// Pre-configured audit middleware for common operations
export const auditLoggers = {
  // Student operations removed - app does not store student data

  // Curriculum operations
  importCurriculum: auditLogger.middleware('IMPORT', 'curriculum'),
  viewCurriculum: auditLogger.middleware('VIEW', 'curriculum'),
  updateCurriculum: auditLogger.middleware('UPDATE', 'curriculum'),

  // Planning operations
  createPlan: auditLogger.middleware('CREATE', 'plan'),
  updatePlan: auditLogger.middleware('UPDATE', 'plan'),
  deletePlan: auditLogger.middleware('DELETE', 'plan'),
  viewPlan: auditLogger.middleware('VIEW', 'plan'),

  // Authentication operations
  login: auditLogger.middleware('LOGIN', 'auth'),
  logout: auditLogger.middleware('LOGOUT', 'auth'),
  register: auditLogger.middleware('REGISTER', 'auth'),

  // File operations
  uploadFile: auditLogger.middleware('UPLOAD', 'file'),
  downloadFile: auditLogger.middleware('DOWNLOAD', 'file'),
  deleteFile: auditLogger.middleware('DELETE', 'file'),

  // Admin operations
  updateUserRole: auditLogger.middleware('UPDATE_ROLE', 'user'),
  deleteUser: auditLogger.middleware('DELETE', 'user'),

  // Generic operations
  create: (resource: string) => auditLogger.middleware('CREATE', resource),
  update: (resource: string) => auditLogger.middleware('UPDATE', resource),
  delete: (resource: string) => auditLogger.middleware('DELETE', resource),
  view: (resource: string) => auditLogger.middleware('VIEW', resource),
  list: (resource: string) => auditLogger.middleware('LIST', resource),
};
