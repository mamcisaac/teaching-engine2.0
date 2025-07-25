/**
 * Templates Routes
 * Refactored to use TemplatesRouteHandler for standardized CRUD operations
 */

import { TemplatesRouteHandler } from './TemplatesRouteHandler';

// Create and export the templates router using the standardized handler
const templatesHandler = new TemplatesRouteHandler();
const router = templatesHandler.getRouter();

export { router };