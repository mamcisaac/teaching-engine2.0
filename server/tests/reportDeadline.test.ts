import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';
import { sendReportDeadlineReminders } from '../src/jobs/reportDeadlineReminder';

describe('report deadlines', () => {
  let teacherId: number;
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.reportDeadline.deleteMany();
    await prisma.notification.deleteMany();
    const teacher = await prisma.user.create({
      data: { email: `t${Date.now()}@e.com`, password: 'x', name: 'T' },
    });
    teacherId = teacher.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.reportDeadline.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('CRUD operations work', async () => {
    const create = await request(app)
      .post('/api/report-deadlines')
      .send({ teacherId, name: 'Midterm', date: '2025-02-01T00:00:00.000Z' });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const list = await request(app).get(`/api/report-deadlines?teacherId=${teacherId}`);
    expect(list.body.length).toBe(1);
    const upd = await request(app).put(`/api/report-deadlines/${id}`).send({ name: 'Updated' });
    expect(upd.status).toBe(200);
    const del = await request(app).delete(`/api/report-deadlines/${id}`);
    expect(del.status).toBe(204);
  });

  it('sends reminders', async () => {
    const dl = await prisma.reportDeadline.create({
      data: {
        teacherId,
        name: 'Final',
        date: new Date(Date.now() + 86400000),
        remindDaysBefore: 1,
      },
    });
    await sendReportDeadlineReminders();
    const notes = await prisma.notification.findMany({ where: { type: 'ASSESSMENT_REMINDER' } });
    expect(notes.length).toBe(1);
    await prisma.reportDeadline.delete({ where: { id: dl.id } });
  });
});
