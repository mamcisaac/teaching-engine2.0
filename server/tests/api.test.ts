import request from 'supertest';
import app from '../src/index';
import prisma from '../src/prisma';

beforeAll(async () => {
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

describe('Resource API', () => {
  it('uploads a file', async () => {
    const res = await request(app)
      .post('/api/resources')
      .attach('file', Buffer.from('hello'), 'test.txt')
      .field('type', 'document');
    expect(res.status).toBe(201);
    expect(res.body.filename).toBe('test.txt');
  });
});

describe('MaterialList API', () => {
  it('creates a material list', async () => {
    const res = await request(app)
      .post('/api/material-lists')
      .send({ weekStart: new Date().toISOString() });
    expect(res.status).toBe(201);
    expect(res.body.items).toBeDefined();
  });
});
