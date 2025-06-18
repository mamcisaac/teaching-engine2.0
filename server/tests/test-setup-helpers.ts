import bcrypt from 'bcryptjs';
import { PrismaClient } from '@teaching-engine/database';

/**
 * Creates a test user for authentication in tests.
 * This should be called in beforeEach to ensure the user exists after database resets.
 */
export async function createTestUser(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  return await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'teacher',
    },
  });
}

/**
 * Standard beforeEach setup for tests that need authentication.
 * Creates a test user and sets up auth.
 */
export async function setupAuthenticatedTest(
  prisma: PrismaClient,
  auth: { setup: () => Promise<void> },
) {
  await createTestUser(prisma);
  await auth.setup();
}
