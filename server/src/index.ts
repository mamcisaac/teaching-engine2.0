import express from 'express';
import cors from 'cors';
import subjectRoutes from './routes/subject';
import milestoneRoutes from './routes/milestone';
import activityRoutes from './routes/activity';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/subjects', subjectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/activities', activityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  },
);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
