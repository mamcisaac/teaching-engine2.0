import { app } from '../../src/index';
import { authRequest } from '../test-auth-helper';
import { getTestPrismaClient } from '../jest.setup';

describe('year plan routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    await auth.setup();
  });

  beforeEach(async () => {
    prisma = getTestPrismaClient();
  });

  it('returns entries for the year', async () => {
    // Create a teacher for this test
    const teacher = await prisma.user.create({
      data: {
        email: `yearplan-${Date.now()}@test.com`,
        password: 'hashed_password',
        name: 'Year Plan Teacher',
        role: 'teacher',
      },
    });

    await prisma.yearPlanEntry.create({
      data: {
        teacherId: teacher.id,
        entryType: 'UNIT',
        title: 'Numbers to 20',
        start: new Date('2025-01-06'),
        end: new Date('2025-01-31'),
      },
    });

    const res = await auth.get('/api/year-plan').query({ teacherId: teacher.id, year: 2025 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Numbers to 20');
  });

  it('creates share link', async () => {
    // Create a teacher for this test
    const teacher = await prisma.user.create({
      data: {
        email: `sharelink-${Date.now()}@test.com`,
        password: 'hashed_password',
        name: 'Share Link Teacher',
        role: 'teacher',
      },
    });

    const res = await auth.post('/api/share/year-plan').send({ teacherId: teacher.id, year: 2025 });
    expect(res.status).toBe(201);
    expect(res.body.shareToken).toBeTruthy();
  });

  it('handles missing teacher gracefully', async () => {
    const res = await auth.get('/api/year-plan').query({ teacherId: 99999, year: 2025 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates and updates year plan entries', async () => {
    // Create a teacher for this test
    const teacher = await prisma.user.create({
      data: {
        email: `update-${Date.now()}@test.com`,
        password: 'hashed_password',
        name: 'Update Teacher',
        role: 'teacher',
      },
    });

    // Create an entry
    const createRes = await auth.post('/api/year-plan').send({
      teacherId: teacher.id,
      entryType: 'UNIT',
      title: 'Original Title',
      start: '2025-02-01',
      end: '2025-02-28',
    });
    expect(createRes.status).toBe(201);
    const entryId = createRes.body.id;

    // Update the entry
    const updateRes = await auth.put(`/api/year-plan/${entryId}`).send({
      title: 'Updated Title',
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');

    // Delete the entry
    const deleteRes = await auth.delete(`/api/year-plan/${entryId}`);
    expect(deleteRes.status).toBe(204);
  });
});
