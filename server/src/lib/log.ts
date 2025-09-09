/**
 * Structured logging utility for API request tracing
 * Uses request IDs to track requests through their lifecycle
 */

import type { Request } from 'express';

export const log = (req: Request, msg: string, extra: Record<string, unknown> = {}) => {
  const rid = (req as any).rid || 'unknown';
  console.warn(`[${rid}] ${msg}`, extra);
};