/**
 * Base route handler exports
 */

export { BaseRouteHandler } from './BaseRouteHandler.js';
export type { RouteHandlerOptions } from './BaseRouteHandler.js';
export * from './validation.js';
export type { AuthenticatedRequest } from './middleware.js';
export { requestLogger, errorHandler, validate, validateQuery } from './middleware.js';