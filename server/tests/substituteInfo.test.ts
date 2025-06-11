import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

describe('substitute info API', () => {
  beforeAll(async () => {
    await prisma.substituteInfo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: { id: 1, email: 't@e.com', password: 'x', name: 'T' },
    });
  });

  afterAll(async () => {
    await prisma.substituteInfo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('saves and retrieves info', async () => {
    const create = await request(app)
      .post('/api/substitute-info')
      .send({ procedures: 'Fire drill', allergies: 'Peanuts' });
    expect(create.status).toBe(201);
    const get = await request(app).get('/api/substitute-info');
    expect(get.status).toBe(200);
    expect(get.body.procedures).toBe('Fire drill');
    expect(get.body.allergies).toBe('Peanuts');
  });
});
