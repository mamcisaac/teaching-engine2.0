import express from 'express';
import cors from 'cors';
import path from 'path';
import subjectRoutes from './routes/subject';
import milestoneRoutes from './routes/milestone';
import activityRoutes from './routes/activity';
import subPlanRoutes from './routes/subplan';
import lessonPlanRoutes, { savePreferences } from './routes/lessonPlan';
import dailyPlanRoutes from './routes/dailyPlan';
import resourceRoutes from './routes/resource';
import materialListRoutes from './routes/materialList';
import notificationRoutes from './routes/notification';
import newsletterRoutes from './routes/newsletter';
import timetableRoutes from './routes/timetable';
import noteRoutes from './routes/note';
import calendarEventRoutes from './routes/calendarEvent';
import { scheduleProgressCheck } from './jobs/progressCheck';
import { scheduleUnreadNotificationEmails } from './jobs/unreadNotificationEmail';
import { scheduleBackups } from './services/backupService';
import logger from './logger';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

app.use('/api/subjects', subjectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/subplan', subPlanRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/daily-plans', dailyPlanRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/material-lists', materialListRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar-events', calendarEventRoutes);
app.post('/api/preferences', savePreferences);
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

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  scheduleProgressCheck();
  scheduleUnreadNotificationEmails();
  scheduleBackups();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

export default app;
