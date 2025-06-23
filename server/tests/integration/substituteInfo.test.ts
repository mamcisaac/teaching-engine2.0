import { app } from '../../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';

describe('substitute info API', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    prisma = getTestPrismaClient();
    await auth.setup();
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
    const create = await auth
      .post('/api/substitute-info')
      .send({ procedures: 'Fire drill', allergies: 'Peanuts' });
    expect(create.status).toBe(201);
    const get = await auth.get('/api/substitute-info');
    expect(get.status).toBe(200);
    expect(get.body.procedures).toBe('Fire drill');
    expect(get.body.allergies).toBe('Peanuts');
  });
});
