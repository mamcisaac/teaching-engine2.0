import express from 'express';
import cors from 'cors';
import path from 'path';
import subjectRoutes from './routes/subject';
import milestoneRoutes from './routes/milestone';
import activityRoutes from './routes/activity';
import resourceRoutes from './routes/resource';
import materialListRoutes from './routes/materialList';
import logger from './logger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/subjects', subjectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/material-lists', materialListRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

export default app;
