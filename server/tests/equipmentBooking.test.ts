import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

describe('Equipment Booking API', () => {
  let teacherId: number;

  beforeAll(async () => {
    const teacher = await prisma.user.create({
      data: { email: `eb${Date.now()}@e.com`, password: 'x', name: 'EB' },
    });
    teacherId = teacher.id;
  });

  afterAll(async () => {
    await prisma.equipmentBooking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('creates and lists bookings', async () => {
    const create = await request(app).post('/api/equipment-bookings').send({
      teacherId,
      resourceName: 'iPad Cart',
      neededBy: '2025-03-01T00:00:00.000Z',
      leadTimeDays: 10,
    });
    expect(create.status).toBe(201);
    const list = await request(app).get(`/api/equipment-bookings?teacherId=${teacherId}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });
});
