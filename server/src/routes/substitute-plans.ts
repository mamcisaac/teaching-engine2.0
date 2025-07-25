/**
 * Substitute Plans Routes
 * Refactored to use SubstitutePlansRouteHandler for standardized CRUD operations
 */

import { SubstitutePlansRouteHandler } from './SubstitutePlansRouteHandler';

// Create and export the substitute plans router using the standardized handler
const substitutePlansHandler = new SubstitutePlansRouteHandler();
const router = substitutePlansHandler.getRouter();

export { router };