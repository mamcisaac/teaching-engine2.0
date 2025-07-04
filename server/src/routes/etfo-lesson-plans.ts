/**
 * ETFO Lesson Plans Routes
 * Refactored to use ETFOLessonPlansRouteHandler for standardized CRUD operations
 */

import { ETFOLessonPlansRouteHandler } from './ETFOLessonPlansRouteHandler.js';

// Create and export the ETFO lesson plans router using the standardized handler
const etfoLessonPlansHandler = new ETFOLessonPlansRouteHandler();
const router = etfoLessonPlansHandler.getRouter();

export { router };