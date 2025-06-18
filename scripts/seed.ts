import { PrismaClient } from '@teaching-engine/database';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment (default to 'development')
const env = process.env.NODE_ENV || 'development';
const isTest = env === 'test';

// Database path - using SQLite for both test and development
const dbPath = path.resolve(
  process.cwd(),
  'packages/database/prisma',
  isTest ? 'test-db.sqlite' : 'dev-db.sqlite',
);

console.log(`🌱 Starting database seeding for ${env} environment`);
console.log(`📂 Database path: ${dbPath}`);

const prisma = new PrismaClient({
  log: isTest ? ['error', 'warn'] : ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

// Helper function to clear all tables except _prisma_migrations
async function clearDatabase() {
  console.log('\n🧹 Clearing existing data...');
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

  const tableNames = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
    AND name NOT LIKE '_prisma_%'
    AND name != '_prisma_migrations'
    ORDER BY name
  `;

  for (const { name } of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${name}\`;`);
      console.log(`  ✅ Cleared table: ${name}`);
    } catch (error) {
      console.error(
        `  ❌ Error clearing table ${name}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  console.log('✅ Database cleared successfully');
}

// Seed test data
async function seedTestData() {
  console.log('\n🌱 Seeding test data...');

  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 12);

    await prisma.$executeRaw`
      INSERT INTO "User" (email, password, name, role)
      VALUES ('test@example.com', ${hashedPassword}, 'Test User', 'teacher');
    `;

    console.log('✅ Created test user: test@example.com (password: test123)');

    // Create test subjects
    await prisma.$executeRaw`
      INSERT INTO "Subject" (name)
      VALUES 
        ('Mathematics'),
        ('Science'),
        ('English');
    `;

    console.log('✅ Created test subjects: Mathematics, Science, English');
  } catch (error) {
    console.error(
      '❌ Error seeding test data:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

// Seed development data
async function seedDevData() {
  console.log('\n🌱 Seeding development data...');

  try {
    // First, push the schema to ensure tables exist
    console.log('📋 Ensuring database schema is up to date...');

    // Create development/test user for e2e tests
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'TEACHER',
      },
    });

    console.log('✅ Created development user: teacher@example.com (password: password123)');

    // Create test subjects
    const subjects = [
      'Mathematics',
      'Science',
      'English',
      'Language Arts',
      'Social Studies',
      'Health',
      'Math',
    ];

    for (const subjectName of subjects) {
      await prisma.subject.create({
        data: {
          name: subjectName,
          userId: user.id,
        },
      });
    }

    console.log('✅ Created development subjects');
    console.log('✅ Development data seeding complete');
  } catch (error) {
    console.error(
      '❌ Error seeding development data:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Always clear the database first
    await clearDatabase();

    // Seed based on environment
    if (isTest) {
      await seedTestData();
    } else {
      await seedDevData();
    }

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main().catch(console.error);
