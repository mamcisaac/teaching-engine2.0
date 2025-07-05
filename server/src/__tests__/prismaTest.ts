/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from '../prisma';
import logger from '../logger.js';

describe('Prisma Client', () => {
  it('should be able to connect to the database', async () => {
    logger.info('Testing Prisma connection');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.debug('Prisma query result:', result);

    expect(result).toBeDefined();
  });
});
