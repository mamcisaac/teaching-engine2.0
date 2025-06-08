import request from 'supertest';
import app from '../src/index';
import prisma from '../src/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Newsletter API', () => {
  it('generates a newsletter', async () => {
    const res = await request(app).post('/api/newsletters/generate').send({ template: 'weekly' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
