import { app } from '../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';

let teacherId: number;
let prisma: ReturnType<typeof getTestPrismaClient>;
const auth = authRequest(app);

beforeAll(async () => {
  prisma = getTestPrismaClient();
  await auth.setup();
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.yearPlanEntry.deleteMany();
  await prisma.shareLink.deleteMany();
  await prisma.user.deleteMany();
  const t = await prisma.user.create({
    data: { email: 'year@test.com', password: 'x', name: 'Y' },
  });
  teacherId = t.id;
});

afterAll(async () => {
  await prisma.yearPlanEntry.deleteMany();
  await prisma.shareLink.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('year plan routes', () => {
  it('returns entries for the year', async () => {
    await prisma.yearPlanEntry.create({
      data: {
        teacherId,
        entryType: 'UNIT',
        title: 'Numbers to 20',
        start: new Date('2025-01-06'),
        end: new Date('2025-01-31'),
      },
    });
    const res = await auth.get('/api/year-plan').query({ teacherId, year: 2025 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Numbers to 20');
  });

  it('creates share link', async () => {
    const res = await auth.post('/api/share/year-plan').send({ teacherId, year: 2025 });
    expect(res.status).toBe(201);
    expect(res.body.shareToken).toBeTruthy();
  });
});
