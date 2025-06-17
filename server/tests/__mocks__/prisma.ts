import { getTestPrismaClient } from '../jest.setup';
import { PrismaClient, Prisma } from '@teaching-engine/database';

// Mock the prisma module to use the test client
export const prisma = getTestPrismaClient();

// Export the types as well
export { PrismaClient, Prisma };
