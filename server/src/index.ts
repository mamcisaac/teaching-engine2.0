import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
import { scheduleProgressCheck } from './jobs/progressCheck';
import { scheduleUnreadNotificationEmails } from './jobs/unreadNotificationEmail';
import { scheduleNewsletterTriggers } from './jobs/newsletterTrigger';
import { scheduleReportDeadlineReminders } from './jobs/reportDeadlineReminder';
import { scheduleEquipmentBookingReminders } from './jobs/bookingReminder';
import { scheduleBackups } from './services/backupService';
import logger from './logger';
import { prisma } from './prisma';

const app = express();

// Configure CORS with credentials support
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
app.options('*', cors(corsOptions));

// Apply CORS to all routes
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

    // Debug: Log the password comparison
    console.log('Password comparison:', {
      providedPassword: passwordInput,
      storedPassword: user.password,
      match: passwordInput === user.password,
    });

    if (user.password !== passwordInput) {
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

app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/daily-plans', dailyPlanRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/material-lists', materialListRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/newsletter-draft', newsletterDraftRoutes);
app.use('/api/newsletter-suggestions', newsletterSuggestionRoutes);
app.use('/api/planner/suggestions', plannerSuggestionRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar-events', calendarEventRoutes);
app.use('/api/unavailable-blocks', unavailableBlockRoutes);
app.use('/api/report-deadlines', reportDeadlineRoutes);
app.use('/api/year-plan', yearPlanRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/equipment-bookings', equipmentBookingRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/substitute-info', substituteInfoRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/sub-plan', subplanRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(clientDist));
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

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  scheduleProgressCheck();
  scheduleUnreadNotificationEmails();
  scheduleNewsletterTriggers();
  scheduleReportDeadlineReminders();
  scheduleEquipmentBookingReminders();
  scheduleBackups();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

export default app;
