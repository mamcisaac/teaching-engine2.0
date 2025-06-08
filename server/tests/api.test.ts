import request from 'supertest';
import app from '../src/index';
import prisma from '../src/prisma';

beforeAll(async () => {
  // Ensure SQLite doesn't immediately error when the database is busy
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Health API', () => {
  it('responds with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Subject API', () => {
  it('creates and retrieves a subject', async () => {
    const create = await request(app).post('/api/subjects').send({ name: 'Test' });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/subjects/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Test');
  });

  it('rejects invalid subject data', async () => {
    const res = await request(app).post('/api/subjects').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing subject', async () => {
    const res = await request(app).get('/api/subjects/99999');
    expect(res.status).toBe(404);
  });
});

describe('Milestone API', () => {
  let subjectId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'Subj' } });
    subjectId = subject.id;
  });

  it('creates and retrieves a milestone', async () => {
    const create = await request(app).post('/api/milestones').send({ title: 'MS', subjectId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/milestones/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('MS');
  });

  it('rejects invalid milestone data', async () => {
    const res = await request(app).post('/api/milestones').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing milestone', async () => {
    const res = await request(app).get('/api/milestones/99999');
    expect(res.status).toBe(404);
  });
});

describe('Activity API', () => {
  let milestoneId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'S2' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M2', subjectId: subject.id },
    });
    milestoneId = milestone.id;
  });

  it('creates and retrieves an activity', async () => {
    const create = await request(app).post('/api/activities').send({ title: 'Act', milestoneId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/activities/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('Act');
  });

  it('rejects invalid activity data', async () => {
    const res = await request(app).post('/api/activities').send({ title: 'A' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing activity', async () => {
    const res = await request(app).get('/api/activities/99999');
    expect(res.status).toBe(404);
  });
});

describe('Lesson Plan API', () => {
  let milestoneId: number;

  beforeAll(async () => {
    const subject = await prisma.subject.create({ data: { name: 'PlanSubj' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'PlanM', subjectId: subject.id },
    });
    milestoneId = milestone.id;
    await prisma.activity.create({ data: { title: 'PlanAct', milestoneId } });
  });

  it('generates and retrieves a plan', async () => {
    const weekStart = '2024-01-01T00:00:00.000Z';
    const gen = await request(app).post('/api/lesson-plans/generate').send({ weekStart });
    expect(gen.status).toBe(201);
    const get = await request(app).get(`/api/lesson-plans/${weekStart}`);
    expect(get.status).toBe(200);
    expect(get.body.schedule.length).toBeGreaterThan(0);
  });
});

describe('Preferences API', () => {
  it('saves preferences', async () => {
    const res = await request(app)
      .post('/api/preferences')
      .send({
        teachingStyles: ['hands-on'],
        pacePreference: 'balanced',
        prepTime: 60,
      });
    expect(res.status).toBe(201);
    expect(res.body.pacePreference).toBe('balanced');
  });
});

describe('Resource API', () => {
  it('uploads and lists resources', async () => {
    const upload = await request(app)
      .post('/api/resources')
      .send({
        filename: 'test.txt',
        data: Buffer.from('hi').toString('base64'),
        type: 'text/plain',
        size: 2,
      });
    expect(upload.status).toBe(201);
    const list = await request(app).get('/api/resources');
    expect(list.body.length).toBeGreaterThan(0);
  });
});
