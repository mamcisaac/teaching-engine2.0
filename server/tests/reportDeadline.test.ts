import { app } from '../src/index';
import { getTestPrismaClient } from './jest.setup';
import { authRequest } from './test-auth-helper';
import { sendReportDeadlineReminders } from '../src/jobs/reportDeadlineReminder';

const auth = authRequest(app);

describe('report deadlines', () => {
  let teacherId: number;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
    await auth.setup();
    const teacher = await prisma.user.create({
      data: { email: `t${Date.now()}@e.com`, password: 'x', name: 'T' },
    });
    teacherId = teacher.id;
  });

  it('CRUD operations work', async () => {
    const create = await auth
      .post('/api/report-deadlines')
      .send({ teacherId, name: 'Midterm', date: '2025-02-01T00:00:00.000Z' });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const list = await auth.get(`/api/report-deadlines?teacherId=${teacherId}`);
    expect(list.body.length).toBe(1);
    const upd = await auth.put(`/api/report-deadlines/${id}`).send({ name: 'Updated' });
    expect(upd.status).toBe(200);
    const del = await auth.delete(`/api/report-deadlines/${id}`);
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
