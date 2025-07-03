import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';
import { CacheService } from '../services/CacheService.js';

/**
 * Middleware for API key validation
 * Provides security through API key authentication
 */
export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Check if API key validation is enabled
    const isValidationEnabled = process.env.ENABLE_API_KEY_VALIDATION === 'true';

    if (!isValidationEnabled) {
      return next();
    }

    // Get the expected API key from environment
    const expectedApiKey = process.env.API_KEY;

    if (!expectedApiKey) {
      // Server misconfiguration - log error but don't expose details
      logger.error('API_KEY environment variable not set');

      res.status(500).json({
        error: 'Server configuration error',
      });
      return;
    }

    // Extract API key from request headers
    let providedApiKey: string | undefined;

    // Check x-api-key header (case-insensitive)
    // Express automatically lowercases header names
    const xApiKey = req.headers['x-api-key'] as string;
    if (xApiKey) {
      providedApiKey = xApiKey;
    }

    // Check Authorization header with Bearer format
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && typeof authHeader === 'string') {
      const bearerMatch = authHeader.match(/^Bearer (.+)$/i);
      if (bearerMatch) {
        providedApiKey = bearerMatch[1];
      }
    }

    // Validate API key
    if (!providedApiKey || providedApiKey.trim() === '') {
      res.status(401).json({
        error: 'Unauthorized: API key is required',
      });
      return;
    }

    // Compare API keys (timing-safe comparison would be better in production)
    if (providedApiKey !== expectedApiKey) {
      res.status(401).json({
        error: 'Unauthorized: Invalid API key',
      });
      return;
    }

    // Try to use cache for performance (optional enhancement)
    try {
      const _cache = new CacheService();
      // Could cache validated keys here for performance
    } catch (cacheError) {
      // Cache is optional, continue without it
    }

    // API key is valid, proceed to next middleware
    next();
  } catch (error) {
    // Handle unexpected errors
    logger.error(error, 'Authentication error');

    res.status(500).json({
      error: 'Internal server error during authentication',
    });
  }
}
