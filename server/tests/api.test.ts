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

describe('Subject API', () => {
  it('creates and retrieves a subject', async () => {
    const create = await request(app)
      .post('/api/subjects')
      .send({ name: 'Test' });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/subjects/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Test');
  });

  it('returns 404 for missing subject', async () => {
    const res = await request(app).get('/api/subjects/99999');
    expect(res.status).toBe(404);
  });
});
