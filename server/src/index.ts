import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import debug from 'debug';
import { config } from 'dotenv';
import { authenticate } from './middleware/authenticate';

// Load environment variables
config();

// Create debug logger
const log = debug('server:main');
const error = debug('server:error');

// Get directory name in ES module
const __filename_index = fileURLToPath(import.meta.url);
const __dirname_index = path.dirname(__filename_index);

// Use global Express Request type with user: { id: number; email: string }

// ETFO-aligned route imports
import curriculumImportRoutes from './routes/curriculumImport';
import curriculumDiscoveryRoutes from './routes/curriculum-discovery';
import discoverySchedulerRoutes from './routes/discovery-scheduler';
import studentRoutes from './routes/student';
import parentSummaryRoutes from './routes/parentSummary';
import newsletterRoutes from './routes/newsletters';
import curriculumExpectationRoutes from './routes/curriculum-expectations';
import longRangePlanRoutes from './routes/long-range-plans';
import unitPlanRoutes from './routes/unit-plans';
import etfoLessonPlanRoutes from './routes/etfo-lesson-plans';
import daybookEntryRoutes from './routes/daybook-entries';
import etfoProgressRoutes from './routes/etfo-progress';
import plannerStateRoutes from './routes/planner-state';
import workflowStateRoutes from './routes/workflow-state';
import aiPlanningRoutes from './routes/ai-planning';
import activityDiscoveryRoutes from './routes/activity-discovery';
import activityCollectionsRoutes from './routes/activity-collections';
import aiActivityGenerationRoutes from './routes/ai-activity-generation';
import batchProcessingRoutes from './routes/batch-processing';
import templateRoutes from './routes/templates';
import calendarEventRoutes from './routes/calendar-events';
import recentPlansRoutes from './routes/recent-plans';
import batchApiRoutes from './routes/batch';
import subPlanRoutes from './routes/sub-plan';
import { authRoutes } from './routes/auth';
import { teamRoutes } from './routes/teams';
import { sharingRoutes } from './routes/sharing';
import { commentRoutes } from './routes/comments';
import {
  initializeServices,
  shutdownServices,
  getServiceHealth,
} from './services/initializeServices';
import logger from './logger';
import { prisma } from './prisma';
import { rateLimiters } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/inputSanitization';
import performanceMonitoring, { performanceMonitor } from './middleware/performanceMonitoring';

// Initialize Express app
log('Initializing Express application...');
const app = express();

// Security middleware
log('Configuring security headers...');
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for dev
      "style-src 'self' 'unsafe-inline'", // Allow inline styles for CSS-in-JS
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  );

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
});

// Configure CORS with credentials support
log('Configuring CORS...');
// CORS options
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // In production, replace with your actual domain
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
};

// Handle preflight requests
log('Configuring CORS preflight...');
app.options('*', cors(corsOptions));

// Apply CORS to all routes
log('Applying CORS and JSON middleware...');
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Set reasonable payload limit
app.use(cookieParser());

// Apply input sanitization middleware
log('Applying input sanitization...');
app.use(sanitizeInput);

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

// Login rate limiting is now handled by the rateLimiters.auth middleware

// Login endpoint with enhanced rate limiting
app.post('/api/login', rateLimiters.auth, async (req, res) => {
  try {
    const { email, password: passwordInput } = req.body as { email: string; password: string };
    // Input validation and sanitization
    if (
      !email ||
      !passwordInput ||
      typeof email !== 'string' ||
      typeof passwordInput !== 'string'
    ) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Rate limiting is handled by middleware

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('CRITICAL: JWT_SECRET environment variable not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      },
      secret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        algorithm: 'HS256',
      } as jwt.SignOptions,
    );

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;

    // Set JWT in httpOnly cookie for security
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Use secure flag in production
      sameSite: isProduction ? ('strict' as const) : ('lax' as const), // Use 'lax' in development for cross-port requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    res.cookie('authToken', token, cookieOptions);

    const response = {
      user: userData,
      token: token, // Include token in response for E2E tests
    };

    res.json(response);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth check endpoint
app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logger.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/check', authenticate, (req: Request, res: Response) => {
  res.json({ userId: req.user?.id });
});

// Logout endpoint to clear httpOnly cookie
app.post('/api/logout', (_req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('strict' as const) : ('lax' as const),
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
});

// Removed duplicate health endpoint - using the one with performance monitoring above

// Mount test routes (only available in test environment)
log(`NODE_ENV is: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  log('Skipping test routes - disabled in ETFO-aligned implementation');
} else {
  log('Skipping test routes - not in test or development mode');
}

// Mount auth routes (no authentication required)
log('Mounting auth routes...');
app.use('/api', authRoutes(prisma));

// Apply authentication and rate limiting to all API routes
log('Mounting ETFO-aligned API routes...');
app.use('/api/students', authenticate, rateLimiters.api, studentRoutes);
app.use('/api/parent-summary', authenticate, rateLimiters.write, parentSummaryRoutes);
app.use('/api/newsletters', authenticate, rateLimiters.write, newsletterRoutes);
app.use('/api/curriculum-import', authenticate, rateLimiters.upload, curriculumImportRoutes);
app.use('/api/curriculum-discovery', authenticate, rateLimiters.read, curriculumDiscoveryRoutes);
app.use('/api/discovery-scheduler', authenticate, rateLimiters.api, discoverySchedulerRoutes);

// ETFO-aligned Planning Routes
app.use(
  '/api/curriculum-expectations',
  authenticate,
  rateLimiters.read,
  curriculumExpectationRoutes,
);
app.use('/api/long-range-plans', authenticate, rateLimiters.write, longRangePlanRoutes);
app.use('/api/unit-plans', authenticate, rateLimiters.write, unitPlanRoutes);
app.use('/api/etfo-lesson-plans', authenticate, rateLimiters.write, etfoLessonPlanRoutes);
app.use('/api/daybook-entries', authenticate, rateLimiters.write, daybookEntryRoutes);
app.use('/api/etfo', authenticate, rateLimiters.read, etfoProgressRoutes);

// State Management Routes
app.use('/api/planner', authenticate, rateLimiters.api, plannerStateRoutes);
app.use('/api/workflow', authenticate, rateLimiters.api, workflowStateRoutes);
app.use('/api/ai-planning', authenticate, rateLimiters.ai, aiPlanningRoutes);

// Template System Routes
app.use('/api/templates', authenticate, rateLimiters.api, templateRoutes);

// Calendar Routes
app.use('/api/calendar-events', authenticate, rateLimiters.api, calendarEventRoutes);

// Recent Plans Routes
app.use('/api/recent-plans', authenticate, rateLimiters.api, recentPlansRoutes);

// AI status endpoint (maps to ai-planning/status for backward compatibility)
app.get('/api/ai/status', authenticate, async (req, res) => {
  // Forward to ai-planning routes handler
  req.url = '/status';
  aiPlanningRoutes(req, res, () => {});
});

// Planner State Routes
app.use('/api/planner', authenticate, plannerStateRoutes);

// Activity Discovery Routes
app.use('/api/activities', authenticate, rateLimiters.read, activityDiscoveryRoutes);
app.use('/api/activity-collections', authenticate, rateLimiters.write, activityCollectionsRoutes);
app.use('/api/ai-activities', authenticate, rateLimiters.ai, aiActivityGenerationRoutes);

// Batch Processing Routes
app.use('/api/batch-processing', authenticate, rateLimiters.write, batchProcessingRoutes);

// Sub-plan Routes
app.use('/api/sub-plan', authenticate, rateLimiters.write, subPlanRoutes);

// Batch API Routes (for request batching)
app.use('/api', authenticate, rateLimiters.api, batchApiRoutes);

// Collaboration Routes
app.use('/api/teams', authenticate, rateLimiters.api, teamRoutes(prisma));
app.use('/api/sharing', authenticate, rateLimiters.api, sharingRoutes(prisma));
app.use('/api/comments', authenticate, rateLimiters.api, commentRoutes(prisma));

// Service health check endpoint (no auth required for monitoring)
app.get('/api/health/services', async (_req, res) => {
  try {
    const health = await getServiceHealth();
    res.status(health.healthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get service health' });
  }
});

log('All API routes mounted successfully.');

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

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

// Only start the server if this file is run directly
// Also start if running in test mode for E2E tests (unless IS_TEST_SERVER is set)
const isDirectRun = import.meta.url === `file://${process.argv[1]}`;
const isE2ETest =
  process.env.NODE_ENV === 'test' && process.env.E2E_TEST === 'true' && !process.env.IS_TEST_SERVER;
// Check if running in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDirectRun || isE2ETest || isDevelopment) {
  console.log('Starting server because:', { isDirectRun, isE2ETest, isDevelopment });
  // Initialize services before starting the server
  initializeServices()
    .then(() => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Server address:', server.address());
        log('Server started successfully');

        // Background jobs disabled - ETFO approach uses manual workflow
      });

      server.on('error', (err) => {
        console.error('Server error:', err);
      });
    })
    .catch((err) => {
      error('Failed to initialize services:', err);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    log('SIGTERM received, shutting down gracefully...');
    await shutdownServices();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    log('SIGINT received, shutting down gracefully...');
    await shutdownServices();
    process.exit(0);
  });
}
// test
