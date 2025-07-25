/**
 * Unit Plans Routes
 * Refactored to use UnitPlansRouteHandler for standardized CRUD operations
 */

import { UnitPlansRouteHandler } from './UnitPlansRouteHandler';

// Create and export the unit plans router using the standardized handler
const unitPlansHandler = new UnitPlansRouteHandler();
const router = unitPlansHandler.getRouter();

export { router };