/* eslint-disable no-console */
// External imports (npm packages)
import type { Server } from 'http';
import path from 'path';

import cookieParser from 'cookie-parser';
import debug from 'debug';
import { config } from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import express, { json, urlencoded, static as expressStatic } from 'express';

import { logger } from './logger.js';
import { authenticate } from './middleware/authenticate';
import { curriculumCache, staticCache, userCache } from './middleware/cache';
import { errorContextMiddleware, authErrorMiddleware } from './middleware/errorContext';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpMetricsMiddleware, startSystemMetricsCollection } from './middleware/metrics';
import { rateLimiters } from './middleware/rateLimit/index';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/requestLogger';
import {
  applySecurityMiddleware,
  authRateLimitMiddleware,
  validateFileUpload,
} from './middleware/security';
import { standardErrorHandler } from './middleware/standardErrorHandler';
import { initTelemetry, startAlertMonitoring } from './monitoring';
import { prisma } from './prisma';
import { router as activityCollectionsRoutes } from './routes/activity-collections';
import { router as aiActivityGenerationRoutes } from './routes/ai-activity-generation';
import { router as aiPlanningRoutes } from './routes/ai-planning';
import { router as authEndpoints } from './routes/authEndpoints';
import { router as cacheRoutes } from './routes/cache';
import { router as calendarEventRoutes } from './routes/calendar-events';
import { router as curriculumExpectationRoutes } from './routes/curriculum-expectations';
import { router as curriculumImportRoutes } from './routes/curriculumImport';
import { router as dashboardMetricsRoutes } from './routes/dashboard-metrics';
import { router as daybookEntryRoutes } from './routes/daybook-entries';
import { router as etfoLessonPlanRoutes } from './routes/etfo-lesson-plans';
import { router as etfoProgressRoutes } from './routes/etfo-progress';
import { router as longRangePlanRoutes } from './routes/long-range-plans';
import { router as metricsRoutes } from './routes/metrics';
import { router as monitoringRoutes } from './routes/monitoring';
import { router as newsletterRoutes } from './routes/newsletters';
import { router as notificationRoutes } from './routes/notifications';
import { router as plannerStateRoutes } from './routes/planner-state';
import { router as recentPlansRoutes } from './routes/recent-plans';
import { router as substitutePlanRoutes } from './routes/substitute-plans';
import { router as templateRoutes } from './routes/templates';
import { router as unitPlanRoutes } from './routes/unit-plans';
import { userRoutes } from './routes/user';
import { errorReportingService } from './services/monitoring/errorReportingService';
import {
  structuredLogger,
  correlationMiddleware,
  errorLoggingMiddleware as structuredErrorLoggingMiddleware,
} from './utils/structuredLogger';

// Load environment variables
config();

// Create debug logger
const log = debug('server:main');
const error = debug('server:error');

// Get directory name
const __dirname_index = __dirname;

// Create backward-compatible logger for gradual migration
// Logger is now imported from structuredLogger

// Initialize Express app
log('Initializing Express application...');
const app = express();

// Apply comprehensive security middleware
log('Applying comprehensive security middleware...');
applySecurityMiddleware(app);

// Apply JSON and cookie parsing middleware
log('Applying body parsing middleware...');
app.use(json({ limit: '10mb' })); // Set reasonable payload limit
app.use(cookieParser());

// Apply correlation ID middleware first
log('Applying correlation ID middleware...');
app.use(correlationMiddleware);

// Apply error context middleware early in the chain
log('Applying error context middleware...');
app.use(errorContextMiddleware);

// Apply request logging middleware
log('Applying request logging middleware...');
app.use(requestLoggingMiddleware);

// Apply metrics collection middleware
log('Applying metrics collection middleware...');
app.use(httpMetricsMiddleware);

// Performance monitoring removed - adds unnecessary complexity for single-teacher use

// Health check endpoints
app.get('/health', (_req, res): void => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req, res): void => {
  res.status(200).json({
    status: 'ok',
  });
});

// Detailed health endpoint for debugging
app.get('/api/health/detailed', (_req, res): void => {
  res.status(200).json({
    status: 'ok',
    services: {
      database: 'healthy',
      ai: 'healthy',
    },
  });
});

// Use imported authenticate middleware from @/middleware/authenticate

// Legacy login endpoint for backward compatibility
app.post(
  '/api/login',
  authRateLimitMiddleware,
  (req: Request, _res: Response, next: NextFunction): void => {
    // Forward to the auth router
    req.url = '/auth/login';
    next();
  },
);

// Legacy register endpoint for backward compatibility
app.post('/api/register', authRateLimitMiddleware, (req: Request, _res: Response, next: NextFunction): void => {
  // Forward to the new auth endpoint
  req.url = '/register';
  next();
});

// Auth check endpoint is handled by authEndpoints router at /api/auth/me

app.get('/api/auth/check', authenticate, (req: Request, res: Response): void => {
  res.json({ userId: req.user?.id });
});

// Legacy logout endpoint for backward compatibility
app.post('/api/logout', (req: Request, _res: Response, next: NextFunction): void => {
  // Forward to the new auth endpoint
  req.url = '/logout';
  next();
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
app.use('/api/user', authenticate, rateLimiters.api, userRoutes(prisma));

// Notification routes
log('Mounting notification routes...');
app.use('/api/notifications', authenticate, rateLimiters.api, notificationRoutes);

// Apply authentication and rate limiting to all API routes
log('Mounting ETFO-aligned API routes...');
// Student endpoints removed - app does not store student data

// Key Teacher Features
app.use('/api/newsletters', authenticate, rateLimiters.write, newsletterRoutes);
app.use('/api/substitute-plans', authenticate, rateLimiters.write, substitutePlanRoutes);

app.use(
  '/api/curriculum-import',
  authenticate,
  rateLimiters.upload,
  validateFileUpload(['application/pdf', 'text/csv']),
  curriculumImportRoutes,
);
// Curriculum discovery routes removed - over-engineered for single-teacher use

// ETFO-aligned Planning Routes
app.use(
  '/api/curriculum-expectations',
  authenticate,
  rateLimiters.read,
  curriculumCache, // Cache curriculum data for 30 minutes
  curriculumExpectationRoutes,
);
app.use('/api/long-range-plans', authenticate, rateLimiters.write, userCache, longRangePlanRoutes);
app.use('/api/unit-plans', authenticate, rateLimiters.write, userCache, unitPlanRoutes);
app.use(
  '/api/etfo-lesson-plans',
  authenticate,
  rateLimiters.write,
  userCache,
  etfoLessonPlanRoutes,
);
app.use('/api/daybook-entries', authenticate, rateLimiters.write, userCache, daybookEntryRoutes);
app.use('/api/etfo', authenticate, rateLimiters.read, etfoProgressRoutes);

// State Management Routes
app.use('/api/planner', authenticate, rateLimiters.api, plannerStateRoutes);
// Workflow state routes removed - over-engineered for single-teacher use
app.use('/api/ai-planning', authenticate, rateLimiters.ai, aiPlanningRoutes);

// Template System Routes
app.use('/api/templates', authenticate, rateLimiters.api, staticCache, templateRoutes);

// Calendar Routes
app.use('/api/calendar-events', authenticate, rateLimiters.api, userCache, calendarEventRoutes);

// Recent Plans Routes
app.use('/api/recent-plans', authenticate, rateLimiters.api, userCache, recentPlansRoutes);

// Cache Management Routes
app.use('/api/cache', cacheRoutes);

// Metrics Routes
app.use('/metrics', metricsRoutes); // Prometheus endpoint (no /api prefix for standard)
app.use('/api/metrics', metricsRoutes);

// Dashboard Metrics Routes
app.use('/api/dashboard', dashboardMetricsRoutes);

// Monitoring Routes (includes enhanced dashboard and alerting)
app.use('/api/monitoring', authenticate, monitoringRoutes);

// AI status endpoint (maps to ai-planning/status for backward compatibility)
app.get('/api/ai/status', authenticate, (req: Request, res: Response): void => {
  // Forward to ai-planning routes handler
  req.url = '/status';
  aiPlanningRoutes(req, res, () => {});
});

// Planner State Routes
app.use('/api/planner', authenticate, plannerStateRoutes);

// Activity Discovery Routes
app.use('/api/activity-collections', authenticate, rateLimiters.write, activityCollectionsRoutes);
app.use('/api/ai-activities', authenticate, rateLimiters.ai, aiActivityGenerationRoutes);

// Batch Processing Routes

// Sub-plan Routes
// app.use('/api/sub-plan', authenticate, rateLimiters.write as unknown, subPlanRoutes); // Commented out - missing file

// Batch API removed - premature optimization for single-teacher use

// Collaboration Routes removed - focusing on single-teacher planning

// Service health endpoint removed - simplified for single-teacher use

log('All API routes mounted successfully.');

// Start system metrics collection
log('Starting system metrics collection...');
startSystemMetricsCollection(30000); // Collect every 30 seconds

// Start alert monitoring
log('Starting alert monitoring...');
startAlertMonitoring();

// 404 handler for API routes - must handle all unmatched API routes
app.all('/api/*', notFoundHandler);

// Auth error middleware
app.use(authErrorMiddleware);

// Error logging middleware (before error handler)
app.use(errorLoggingMiddleware);
app.use(structuredErrorLoggingMiddleware);

// Standardized error handler
app.use(standardErrorHandler);

const clientDist = path.join(__dirname_index, '../../client/dist');
log('Configuring URL-encoded and cookie parser middleware...');
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
log('Configuring static file serving for uploads...');
app.use('/uploads', expressStatic(path.join(__dirname_index, '../uploads')));
log('Configuring static file serving for client distribution...');
app.use(expressStatic(clientDist));
log('Configuring catch-all route for client-side routing...');
app.get('*', (_req, res): void => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler - must be last middleware
app.use(errorHandler);

const PORT = (process.env.PORT != null && process.env.PORT !== '') ? parseInt(process.env.PORT, 10) : 3000;
log(`Starting server on port ${PORT}...`);
// Export app before starting the server
export { app };

// Initialize app asynchronously
async function initializeApp(): Promise<express.Application> {
  // Initialize error reporting service first
  log('Initializing error reporting service...');
  errorReportingService.init();

  // Initialize OpenTelemetry before anything else
  log('Initializing OpenTelemetry...');
  await initTelemetry();

  // Start alert monitoring
  startAlertMonitoring();

  // Start system metrics collection
  startSystemMetricsCollection();

  return app;
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string, server?: Server): Promise<void> {
  structuredLogger.info(`${signal} received, shutting down gracefully...`, { signal });

  try {
    // Stop accepting new connections
    if (server != null) {
      server.close(() => {
        structuredLogger.info('HTTP server closed');
      });
    }

    // Service shutdown removed - simplified for single-teacher use

    // Close database connections
    await prisma.$disconnect();

    structuredLogger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    structuredLogger.error('Error during graceful shutdown', err as Error);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
// Also start if running in test mode for E2E tests (unless IS_TEST_SERVER is set)
const isDirectRun = require.main === module;
const isE2ETest =
  process.env.NODE_ENV === 'test' && process.env.E2E_TEST === 'true' && (process.env.IS_TEST_SERVER == null || process.env.IS_TEST_SERVER === '');
// Check if running in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDirectRun || isE2ETest || isDevelopment) {
  log('Starting server because:', { isDirectRun, isE2ETest, isDevelopment });

  // Initialize app asynchronously then start server
  initializeApp()
    .then(() => {
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
      process.on('SIGTERM', () => {
 void gracefulShutdown('SIGTERM', server); 
});
      process.on('SIGINT', () => {
 void gracefulShutdown('SIGINT', server); 
});

      // Handle uncaught exceptions
      process.on('uncaughtException', (err) => {
        error('Uncaught Exception:', err);
        void gracefulShutdown('UNCAUGHT_EXCEPTION', server);
      });

      process.on('unhandledRejection', (reason, promise) => {
        error('Unhandled Rejection at:', promise, 'reason:', reason);
        void gracefulShutdown('UNHANDLED_REJECTION', server);
      });
      
      return server;
    })
    .catch((err) => {
      error('Failed to initialize app:', err);
      process.exit(1);
    });
}
// test
