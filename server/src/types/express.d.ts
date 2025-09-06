import { Request, Response } from 'express';
import { EnhancedLogger } from '../logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name?: string;
        role: string;
        organizationId?: number;
        permissions?: string[];
      };
      // Add userId as a convenience property - must match user.id type
      userId?: number;
      // Rate limiting properties
      rateLimit?: {
        resetTime?: Date;
        remaining?: number;
        total?: number;
        used?: number;
      };
      // Request logging properties
      logger?: EnhancedLogger;
      requestId?: string;
      startTime?: number;
      // Error handling properties
      code?: string;
      // Cache control
      cacheEnabled?: boolean;
      // Student artifact upload properties
      student?: {
        id: string;
        userId: number;
        firstName: string;
        lastName: string;
        grade: number;
        isActive: boolean;
      };
      outcomes?: Array<{
        id: string;
        code: string;
        subject: string;
        grade: number;
      }>;
      // File upload properties
      uploadResults?: Array<{
        originalName: string;
        filename: string;
        path: string;
        url: string;
        size: number;
        mimeType: string;
        category: string;
        buffer: Buffer; // File buffer for processing
      }>;
    }
    
    interface Response {
      locals: {
        requestId?: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};
