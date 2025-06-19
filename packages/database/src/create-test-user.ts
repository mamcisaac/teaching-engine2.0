import { PrismaClient } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👨‍🏫 Creating test teacher account...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teacher@example.com' },
    });

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.name);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    console.log('✅ Created test user:', user.name);
    console.log('📧 Email: teacher@example.com');
    console.log('🔑 Password: password123');

    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUser().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { createTestUser };
