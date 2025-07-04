/**
 * Daybook Entries Routes
 * Refactored to use DaybookEntriesRouteHandler for standardized CRUD operations and analytics
 */

import { DaybookEntriesRouteHandler } from './DaybookEntriesRouteHandler.js';

// Create and export the daybook entries router using the standardized handler
const daybookHandler = new DaybookEntriesRouteHandler();
const router = daybookHandler.getRouter();

export { router };