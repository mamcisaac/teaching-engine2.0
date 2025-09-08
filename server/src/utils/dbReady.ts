import { prisma } from '../prisma';
import { withTimeout } from './withTimeout';

export async function ensureDbReady(ms = 1000): Promise<void> {
  await withTimeout(prisma.$queryRaw`SELECT 1`, ms);
}