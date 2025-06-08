import express from 'express';
import cors from 'cors';
import path from 'path';
import subjectRoutes from './routes/subject';
import milestoneRoutes from './routes/milestone';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notification';
import { startCronJobs } from './cron';
import subPlanRoutes from './routes/subplan';
import lessonPlanRoutes, { savePreferences } from './routes/lessonPlan';
import logger from './logger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/subjects', subjectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subplan', subPlanRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.post('/api/preferences', savePreferences);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

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

// Parse PORT env var as a number, defaulting to 3000
const PORT = Number(process.env.PORT) || 3000;
// Respect HOST env var to bind to specific interface (e.g., for prod preview and E2E tests)
const HOST = process.env.HOST;
if (process.env.NODE_ENV !== 'test') {
  startCronJobs();
  if (HOST) {
    app.listen(PORT, HOST, () => {
      logger.info(`Server listening on http://${HOST}:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  }
}

export default app;
