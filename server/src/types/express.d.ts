import { Request } from 'express';

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
    }
  }
}

export {};
