/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import { Server } from 'http';
// import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import { config } from 'dotenv';
import { authenticate } from './middleware/authenticate';

// Load environment variables
config();

// Create debug logger
const log = debug('server:main');
const error = debug('server:error');

// Get directory name in ES module
let __filename_index: string;
let __dirname_index: string;

// Skip import.meta in test environment
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
  __filename_index = __filename || '';
  __dirname_index = __dirname || process.cwd();
} else {
  __filename_index = fileURLToPath(import.meta.url);
  __dirname_index = path.dirname(__filename_index);
}

// Use global Express Request type with user: { id: number; email: string }

// ETFO-aligned route imports
import curriculumImportRoutes from './routes/curriculumImport';
// Student-related routes removed - app does not store student data
// Newsletter routes removed - teachers have better tools (Google Docs, Canva, ClassDojo)
import curriculumExpectationRoutes from './routes/curriculum-expectations';
import longRangePlanRoutes from './routes/long-range-plans';
import unitPlanRoutes from './routes/unit-plans';
import etfoLessonPlanRoutes from './routes/etfo-lesson-plans';
import daybookEntryRoutes from './routes/daybook-entries';
import etfoProgressRoutes from './routes/etfo-progress';
import plannerStateRoutes from './routes/planner-state';
// Workflow state routes removed - over-engineered for single-teacher use
import aiPlanningRoutes from './routes/ai-planning';
import activityCollectionsRoutes from './routes/activity-collections';
import aiActivityGenerationRoutes from './routes/ai-activity-generation';
import templateRoutes from './routes/templates';
import calendarEventRoutes from './routes/calendar-events';
import recentPlansRoutes from './routes/recent-plans';
import batchApiRoutes from './routes/batch';
// import subPlanRoutes from './routes/sub-plan'; // File missing - commenting out for build
// import { authRoutes as _authRoutes } from './routes/auth';
import authEndpoints from './routes/authEndpoints';
import { userRoutes } from './routes/user';
// Notification routes and service infrastructure removed - over-engineered for single-teacher use
import logger from './logger.js';
import { prisma } from './prisma';
import { rateLimiters } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
// import { sanitizeInput as _sanitizeInput } from './middleware/inputSanitization';
import performanceMonitoring, { performanceMonitor } from './middleware/performanceMonitoring';
import {
  applySecurityMiddleware,
  authRateLimitMiddleware,
  validateFileUpload,
} from './middleware/security';

// Initialize Express app
log('Initializing Express application...');
const app = express();

// Apply comprehensive security middleware
log('Applying comprehensive security middleware...');
applySecurityMiddleware(app);

// Apply JSON and cookie parsing middleware
log('Applying body parsing middleware...');
app.use(express.json({ limit: '10mb' })); // Set reasonable payload limit
app.use(cookieParser());

// Apply performance monitoring
log('Applying performance monitoring...');
app.use(performanceMonitoring);

// Health check endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  const healthStatus = performanceMonitor.getHealthStatus();
  res.status(healthStatus.healthy ? 200 : 503).json({
    status: healthStatus.healthy ? 'ok' : 'degraded',
  });
});

// Detailed health endpoint for debugging
app.get('/api/health/detailed', (_req, res) => {
  const healthStatus = performanceMonitor.getHealthStatus();
  res.status(healthStatus.healthy ? 200 : 503).json({
    status: healthStatus.healthy ? 'ok' : 'degraded',
    ...healthStatus,
  });
});

// Performance metrics endpoint (admin only)
app.get('/api/metrics', (req, res) => {
  // Simple admin token check
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.WIZARD_TOKEN) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const summary = performanceMonitor.getPerformanceSummary();
  const slowestEndpoints = performanceMonitor.getSlowestEndpoints();

  res.json({
    summary,
    slowestEndpoints,
    timestamp: new Date().toISOString(),
  });
});

// Use imported authenticate middleware from @/middleware/authenticate

// Legacy login endpoint for backward compatibility
app.post('/api/login', authRateLimitMiddleware, async (req: Request, res: Response) => {
  // Forward to the new auth endpoint
  req.url = '/login';
  authEndpoints(req, res, () => {});
});

// Legacy register endpoint for backward compatibility
app.post('/api/register', authRateLimitMiddleware, async (req: Request, res: Response) => {
  // Forward to the new auth endpoint
  req.url = '/register';
  authEndpoints(req, res, () => {});
});

// Auth check endpoint is handled by authEndpoints router at /api/auth/me

app.get('/api/auth/check', authenticate, (req: Request, res: Response) => {
  res.json({ userId: req.user?.id });
});

// Legacy logout endpoint for backward compatibility
app.post('/api/logout', (req: Request, res: Response) => {
  // Forward to the new auth endpoint
  req.url = '/logout';
  authEndpoints(req, res, () => {});
});

// Logout endpoint is handled by authEndpoints router at /api/auth/logout

// Removed duplicate health endpoint - using the one with performance monitoring above

// Mount test routes (only available in test environment)
log(`NODE_ENV is: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  log('Skipping test routes - disabled in ETFO-aligned implementation');
} else {
  log('Skipping test routes - not in test or development mode');
}

// Mount auth routes (no authentication required, but rate limited)
log('Mounting auth routes...');
// Apply strict rate limiting to auth endpoints
app.use('/api/auth/login', authRateLimitMiddleware);
app.use('/api/auth/register', authRateLimitMiddleware);
app.use('/api/auth/forgot-password', authRateLimitMiddleware);
app.use('/api/auth/reset-password', authRateLimitMiddleware);

// Mount auth endpoints (new auth middleware)
app.use('/api/auth', authEndpoints);

// Legacy auth routes disabled - using new auth middleware
// app.use('/api', authRoutes(prisma));

// Mount user routes (authenticated)
log('Mounting user routes...');
app.use('/api/user', authenticate, rateLimiters.api as any, userRoutes(prisma));

// Notification routes removed - over-engineered for single-teacher use

// Apply authentication and rate limiting to all API routes
log('Mounting ETFO-aligned API routes...');
// Student endpoints removed - app does not store student data
// Newsletter API removed - teachers have better tools (Google Docs, Canva, ClassDojo)
app.use(
  '/api/curriculum-import',
  authenticate,
  rateLimiters.upload as any,
  validateFileUpload(['application/pdf', 'text/csv']),
  curriculumImportRoutes,
);
// Curriculum discovery routes removed - over-engineered for single-teacher use

// ETFO-aligned Planning Routes
app.use(
  '/api/curriculum-expectations',
  authenticate,
  rateLimiters.read as any,
  curriculumExpectationRoutes,
);
app.use('/api/long-range-plans', authenticate, rateLimiters.write as any, longRangePlanRoutes);
app.use('/api/unit-plans', authenticate, rateLimiters.write as any, unitPlanRoutes);
app.use('/api/etfo-lesson-plans', authenticate, rateLimiters.write as any, etfoLessonPlanRoutes);
app.use('/api/daybook-entries', authenticate, rateLimiters.write as any, daybookEntryRoutes);
app.use('/api/etfo', authenticate, rateLimiters.read as any, etfoProgressRoutes);

// State Management Routes
app.use('/api/planner', authenticate, rateLimiters.api as any, plannerStateRoutes);
// Workflow state routes removed - over-engineered for single-teacher use
app.use('/api/ai-planning', authenticate, rateLimiters.ai as any, aiPlanningRoutes);

// Template System Routes
app.use('/api/templates', authenticate, rateLimiters.api as any, templateRoutes);

// Calendar Routes
app.use('/api/calendar-events', authenticate, rateLimiters.api as any, calendarEventRoutes);

// Recent Plans Routes
app.use('/api/recent-plans', authenticate, rateLimiters.api as any, recentPlansRoutes);

// AI status endpoint (maps to ai-planning/status for backward compatibility)
app.get('/api/ai/status', authenticate, async (req, res) => {
  // Forward to ai-planning routes handler
  req.url = '/status';
  aiPlanningRoutes(req, res, () => {});
});

// Planner State Routes
app.use('/api/planner', authenticate, plannerStateRoutes);

// Activity Discovery Routes
app.use(
  '/api/activity-collections',
  authenticate,
  rateLimiters.write as any,
  activityCollectionsRoutes,
);
app.use('/api/ai-activities', authenticate, rateLimiters.ai as any, aiActivityGenerationRoutes);

// Batch Processing Routes

// Sub-plan Routes
// app.use('/api/sub-plan', authenticate, rateLimiters.write as any, subPlanRoutes); // Commented out - missing file

// Batch API Routes (for request batching)
app.use('/api/batch', authenticate, rateLimiters.api as any, batchApiRoutes);

// Collaboration Routes removed - focusing on single-teacher planning

// Service health endpoint removed - simplified for single-teacher use

log('All API routes mounted successfully.');

// 404 handler for API routes - must handle all unmatched API routes
app.all('/api/*', notFoundHandler);

const clientDist = path.join(__dirname_index, '../../client/dist');
log('Configuring URL-encoded and cookie parser middleware...');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
log('Configuring static file serving for uploads...');
app.use('/uploads', express.static(path.join(__dirname_index, '../uploads')));
log('Configuring static file serving for client distribution...');
app.use(express.static(clientDist));
log('Configuring catch-all route for client-side routing...');
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler - must be last middleware
app.use(errorHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
log(`Starting server on port ${PORT}...`);
// Export app before starting the server
export { app };

// Graceful shutdown handler
async function gracefulShutdown(signal: string, server?: Server) {
  log(`${signal} received, shutting down gracefully...`);

  try {
    // Stop accepting new connections
    if (server) {
      server.close(() => {
        log('HTTP server closed');
      });
    }

    // Service shutdown removed - simplified for single-teacher use

    // Close database connections
    await prisma.$disconnect();

    log('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    error('Error during graceful shutdown:', err);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
// Also start if running in test mode for E2E tests (unless IS_TEST_SERVER is set)
const isDirectRun = import.meta.url === `file://${process.argv[1]}`;
const isE2ETest =
  process.env.NODE_ENV === 'test' && process.env.E2E_TEST === 'true' && !process.env.IS_TEST_SERVER;
// Check if running in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDirectRun || isE2ETest || isDevelopment) {
  log('Starting server because:', { isDirectRun, isE2ETest, isDevelopment });
  // Start server directly - service initialization removed for simplicity
  const server = app.listen(PORT, '0.0.0.0', () => {
    log(`Server is running on port ${PORT}`);
    log('Server address:', server.address());
    log('Server started successfully');

    // Background jobs disabled - ETFO approach uses manual workflow
  });

  server.on('error', (err) => {
    logger.error({ error: err }, 'Server error');
  });

  // Handle keep-alive timeouts
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
  process.on('SIGINT', () => gracefulShutdown('SIGINT', server));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION', server);
  });

  process.on('unhandledRejection', (reason, promise) => {
    error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION', server);
  });
}
// test
