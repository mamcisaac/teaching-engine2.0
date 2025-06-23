import { app } from '../../src/index';
import { getTestPrismaClient } from './jest.setup';
import { authRequest } from './test-auth-helper';
import { sendReportDeadlineReminders } from '../../src/jobs/reportDeadlineReminder';

const auth = authRequest(app);

describe('report deadlines', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeAll(async () => {
    await auth.setup();
  });

  beforeEach(async () => {
    prisma = getTestPrismaClient();
  });

  it('CRUD operations work', async () => {
    // Create a teacher for this test
    const teacher = await prisma.user.create({
      data: {
        email: `teacher-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'Test Teacher',
        role: 'teacher',
      },
    });

    const create = await auth
      .post('/api/report-deadlines')
      .send({ teacherId: teacher.id, name: 'Midterm', date: '2025-02-01T00:00:00.000Z' });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const list = await auth.get(`/api/report-deadlines?teacherId=${teacher.id}`);
    expect(list.body.length).toBe(1);

    const upd = await auth.put(`/api/report-deadlines/${id}`).send({ name: 'Updated' });
    expect(upd.status).toBe(200);

    const del = await auth.delete(`/api/report-deadlines/${id}`);
    expect(del.status).toBe(204);
  });

  it('sends reminders', async () => {
    // Create a teacher for this test
    const teacher = await prisma.user.create({
      data: {
        email: `reminder-teacher-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'Reminder Teacher',
        role: 'teacher',
      },
    });

    await prisma.reportDeadline.create({
      data: {
        teacherId: teacher.id,
        name: 'Final',
        date: new Date(Date.now() + 86400000), // 1 day from now
        remindDaysBefore: 1,
      },
    });

    await sendReportDeadlineReminders();

    const notes = await prisma.notification.findMany({
      where: { type: 'ASSESSMENT_REMINDER' },
    });
    expect(notes.length).toBeGreaterThan(0);
  });
});
