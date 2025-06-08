import { prisma as sharedPrisma, PrismaClient, Prisma } from '@teaching-engine/database';

export { sharedPrisma as prisma, PrismaClient, Prisma };
export default sharedPrisma;
