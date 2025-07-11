import { Request, Response } from 'express';
import { EnhancedLogger } from '../logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        organizationId?: number;
        permissions?: string[];
      };
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
    }
    
    interface Response {
      locals: {
        requestId?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
