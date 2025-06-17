import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';

describe('Holiday API', () => {
  afterAll(async () => {
    await prisma.holiday.deleteMany();
    await prisma.$disconnect();
  });

  it('creates and lists holidays', async () => {
    const create = await request(app)
      .post('/api/holidays')
      .send({ date: '2025-12-25T00:00:00.000Z', name: 'Christmas' });
    expect(create.status).toBe(201);
    const list = await request(app).get('/api/holidays');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });

  it('deletes holiday', async () => {
    const res = await request(app)
      .post('/api/holidays')
      .send({ date: '2025-01-01T00:00:00.000Z', name: 'NY' });
    const id = res.body.id as number;
    const del = await request(app).delete(`/api/holidays/${id}`);
    expect(del.status).toBe(204);
  });
});
