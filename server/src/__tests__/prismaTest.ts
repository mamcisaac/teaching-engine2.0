import { prisma } from '../prisma';

describe('Prisma Client', () => {
  it('should be able to connect to the database', async () => {
    console.log('Testing Prisma connection');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Prisma query result:', result);

    expect(result).toBeDefined();
  });
});
