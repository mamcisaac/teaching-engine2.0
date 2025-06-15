import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import debug from 'debug';

// Create debug logger
const log = debug('server:main');
const error = debug('server:error');

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

import lessonPlanRoutes from './routes/lessonPlan';
import milestoneRoutes from './routes/milestone';
import activityRoutes from './routes/activity';
import dailyPlanRoutes from './routes/dailyPlan';
import resourceRoutes from './routes/resource';
import materialListRoutes from './routes/materialList';
import notificationRoutes from './routes/notification';
import newsletterRoutes from './routes/newsletter';
import newsletterDraftRoutes from './routes/newsletterDraft';
import newsletterSuggestionRoutes from './routes/newsletterSuggestion';
import plannerSuggestionRoutes from './routes/plannerSuggestion';
import timetableRoutes from './routes/timetable';
import noteRoutes from './routes/note';
import calendarEventRoutes from './routes/calendarEvent';
import unavailableBlockRoutes from './routes/unavailableBlock';
import reportDeadlineRoutes from './routes/reportDeadline';
import yearPlanRoutes from './routes/yearPlan';
import shareRoutes from './routes/share';
import equipmentBookingRoutes from './routes/equipmentBooking';
import holidayRoutes from './routes/holiday';
import outcomeRoutes from './routes/outcome';
import weekRoutes from './routes/week';
import substituteInfoRoutes from './routes/substituteInfo';
import backupRoutes from './routes/backupRoutes';
import subjectRoutes from './routes/subject';
import subplanRoutes from './routes/subplan';
import smartGoalRoutes from './routes/smartGoal';
import oralRoutineRoutes from './routes/oralRoutine';
import { scheduleProgressCheck } from './jobs/progressCheck';
import { scheduleUnreadNotificationEmails } from './jobs/unreadNotificationEmail';
import { scheduleNewsletterTriggers } from './jobs/newsletterTrigger';
import { scheduleReportDeadlineReminders } from './jobs/reportDeadlineReminder';
import { scheduleEquipmentBookingReminders } from './jobs/bookingReminder';
import { scheduleBackups } from './services/backupService';
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

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = { userId: String(decoded?.userId || '') };
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Login request received:', { body: req.body });

  try {
    const { email, password: passwordInput } = req.body as { email: string; password: string };

    if (!email || !passwordInput) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Looking up user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);

    // Debug: Log the password comparison
    console.log('Password comparison:', {
      providedPassword: passwordInput,
      storedPassword: user.password,
      match: isPasswordValid,
    });

    if (!isPasswordValid) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Creating JWT token for user ID:', user.id);
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

    console.log('Login successful, sending response');
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

// Apply authentication to all other API routes
log('Mounting API routes...');
app.use('/api/lesson-plans', authenticateToken, lessonPlanRoutes);
app.use('/api/milestones', authenticateToken, milestoneRoutes);
app.use('/api/activities', authenticateToken, activityRoutes);
app.use('/api/daily-plans', authenticateToken, dailyPlanRoutes);
app.use('/api/resources', authenticateToken, resourceRoutes);
app.use('/api/material-lists', authenticateToken, materialListRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/newsletters', authenticateToken, newsletterRoutes);
app.use('/api/newsletter-draft', authenticateToken, newsletterDraftRoutes);
app.use('/api/newsletter-suggestions', authenticateToken, newsletterSuggestionRoutes);
log('Mounting planner suggestions route...');
app.use('/api/planner/suggestions', authenticateToken, plannerSuggestionRoutes);
app.use('/api/timetable', authenticateToken, timetableRoutes);
app.use('/api/notes', authenticateToken, noteRoutes);
app.use('/api/calendar-events', authenticateToken, calendarEventRoutes);
app.use('/api/unavailable-blocks', authenticateToken, unavailableBlockRoutes);
app.use('/api/report-deadlines', authenticateToken, reportDeadlineRoutes);
app.use('/api/year-plan', authenticateToken, yearPlanRoutes);
app.use('/api/share', authenticateToken, shareRoutes);
app.use('/api/equipment-bookings', authenticateToken, equipmentBookingRoutes);
app.use('/api/holidays', authenticateToken, holidayRoutes);
app.use('/api/outcomes', authenticateToken, outcomeRoutes);
app.use('/api/weeks', authenticateToken, weekRoutes);
app.use('/api/substitute-info', authenticateToken, substituteInfoRoutes);
app.use('/api/backup', authenticateToken, backupRoutes);
app.use('/api/subjects', authenticateToken, subjectRoutes);
app.use('/api/sub-plan', authenticateToken, subplanRoutes);
app.use('/api/smart-goals', authenticateToken, smartGoalRoutes);
app.use('/api/oral-routines', authenticateToken, oralRoutineRoutes);
log('All API routes mounted successfully.');
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const clientDist = path.join(__dirname, '../../client/dist');
log('Configuring URL-encoded and cookie parser middleware...');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
log('Configuring static file serving for uploads...');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
log(`Starting server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  log('Server started successfully');

  // Schedule background jobs
  log('Scheduling background jobs...');
  try {
    scheduleProgressCheck();
    scheduleUnreadNotificationEmails();
    scheduleNewsletterTriggers();
    scheduleReportDeadlineReminders();
    scheduleEquipmentBookingReminders();
    scheduleBackups();
    log('All background jobs scheduled');
  } catch (err) {
    error('Error scheduling background jobs:', err);
  }
});

export default app;
