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
      
      // File upload results from Multer middleware
      uploadResults?: Array<{
        originalName: string;
        filename: string;
        path: string;
        url: string;
        size: number;
        mimeType: string;
        category: string;
        buffer: Buffer;
      }>;

      // Artifact ownership validation result (populated by validateArtifactOwnership middleware)
      artifact?: any; // Using any temporarily to avoid circular dependency issues
      
      // Student validation result (populated by validateStudentAccess middleware)
      student?: any; // Using any temporarily to avoid circular dependency issues
      
      // Parsed filter criteria from query params
      filters?: {
        dateFrom?: Date;
        dateTo?: Date;
        subject?: string;
        grade?: string;
        strand?: string;
        isActive?: boolean;
        artifactType?: string;
        studentId?: string;
        outcomeId?: string;
      };
      
      // Pagination parsed from query
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
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
