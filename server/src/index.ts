import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import debug from 'debug';
import { config } from 'dotenv';

// Load environment variables
config();

// Create debug logger
const log = debug('server:main');
const error = debug('server:error');

// Get directory name in ES module
const __filename_index = fileURLToPath(import.meta.url);
const __dirname_index = path.dirname(__filename_index);

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// ETFO-aligned route imports
import curriculumImportRoutes from './routes/curriculumImport';
import studentRoutes from './routes/student';
import parentSummaryRoutes from './routes/parentSummary';
import curriculumExpectationRoutes from './routes/curriculum-expectations';
import longRangePlanRoutes from './routes/long-range-plans';
import unitPlanRoutes from './routes/unit-plans';
import etfoLessonPlanRoutes from './routes/etfo-lesson-plans';
import daybookEntryRoutes from './routes/daybook-entries';
import etfoProgressRoutes from './routes/etfo-progress';
import workflowStateRoutes from './routes/workflow-state';
import aiPlanningRoutes from './routes/ai-planning';
import activityDiscoveryRoutes from './routes/activity-discovery';
import activityCollectionsRoutes from './routes/activity-collections';
import aiActivityGenerationRoutes from './routes/ai-activity-generation';
import {
  initializeServices,
  shutdownServices,
  getServiceHealth,
} from './services/initializeServices';
import logger from './logger';
import { prisma } from './prisma';

// Initialize Express app
log('Initializing Express application...');
const app = express();

// Configure CORS with credentials support
log('Configuring CORS...');
// CORS options
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
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
app.use(express.json());

// Health check endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    if (!decoded?.userId) {
      return res.sendStatus(403);
    }
    req.user = { userId: String(decoded.userId) };
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password: passwordInput } = req.body as { email: string; password: string };

    if (!email || !passwordInput) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
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

    const token = jwt.sign({ userId: user.id.toString() }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256',
    } as jwt.SignOptions);

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;
    const response = {
      token,
      user: userData,
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth check endpoint
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.userId) },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/check', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ userId: req.user?.userId });
});

// Health check should remain public
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Mount test routes (only available in test environment)
log(`NODE_ENV is: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  log('Skipping test routes - disabled in ETFO-aligned implementation');
} else {
  log('Skipping test routes - not in test or development mode');
}

// Apply authentication to all API routes
log('Mounting ETFO-aligned API routes...');
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/parent-summary', authenticateToken, parentSummaryRoutes);
app.use('/api/curriculum-import', authenticateToken, curriculumImportRoutes);

// ETFO-aligned Planning Routes
app.use('/api/curriculum-expectations', authenticateToken, curriculumExpectationRoutes);
app.use('/api/long-range-plans', authenticateToken, longRangePlanRoutes);
app.use('/api/unit-plans', authenticateToken, unitPlanRoutes);
app.use('/api/etfo-lesson-plans', authenticateToken, etfoLessonPlanRoutes);
app.use('/api/daybook-entries', authenticateToken, daybookEntryRoutes);
app.use('/api/etfo', authenticateToken, etfoProgressRoutes);
app.use('/api/workflow', authenticateToken, workflowStateRoutes);
app.use('/api/ai-planning', authenticateToken, aiPlanningRoutes);

// Activity Discovery Routes
app.use('/api/activities', authenticateToken, activityDiscoveryRoutes);
app.use('/api/activity-collections', authenticateToken, activityCollectionsRoutes);
app.use('/api/ai-activities', authenticateToken, aiActivityGenerationRoutes);

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
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

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

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  },
);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
log(`Starting server on port ${PORT}...`);
// Export app before starting the server
export { app };

// Only start the server if this file is run directly
// Also start if running in test mode for E2E tests (unless IS_TEST_SERVER is set)
const isDirectRun = import.meta.url === `file://${process.argv[1]}`;
const isE2ETest =
  process.env.NODE_ENV === 'test' && process.env.E2E_TEST === 'true' && !process.env.IS_TEST_SERVER;

if (isDirectRun || isE2ETest) {
  // Initialize services before starting the server
  initializeServices()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        log('Server started successfully');

        // Background jobs disabled - ETFO approach uses manual workflow
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
