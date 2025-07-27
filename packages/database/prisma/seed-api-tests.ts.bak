#!/usr/bin/env tsx
/**
 * API Test Seed Data
 * 
 * This script seeds the database with data for API tests
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAPITestData() {
  console.log('🌱 Seeding API test data...');

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create API test users
    const hashedPassword = await hash('apitest123', 10);
    
    const apiTestUser = await prisma.user.create({
      data: {
        email: 'api.test@example.com',
        passwordHash: hashedPassword,
        name: 'API Test User',
        role: 'TEACHER',
      },
    });

    const apiAdminUser = await prisma.user.create({
      data: {
        email: 'api.admin@example.com',
        passwordHash: hashedPassword,
        name: 'API Admin User',
        role: 'ADMIN',
      },
    });

    // Create basic curriculum for API tests
    const curriculum = await prisma.curriculum.create({
      data: {
        subject: 'API Test Subject',
        grade: '5',
        board: 'Test Board',
        year: 2024,
        expectations: {
          create: [
            {
              code: 'API.1',
              description: 'Test expectation for API',
              category: 'Test Category',
              strand: 'Test Strand',
            },
          ],
        },
      },
    });

    // Create test lesson plan
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        title: 'API Test Lesson',
        subject: 'API Test Subject',
        grade: '5',
        duration: 45,
        objectives: 'Test API endpoints',
        materials: 'None',
        introduction: 'API test introduction',
        mainActivity: 'API test activity',
        conclusion: 'API test conclusion',
        assessment: 'API test assessment',
        userId: apiTestUser.id,
        startDate: new Date(),
        endDate: new Date(),
      },
    });

    console.log('✅ API test data seeded successfully!');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Curricula: ${await prisma.curriculum.count()}`);
    console.log(`- Lesson Plans: ${await prisma.lessonPlan.count()}`);
  } catch (error) {
    console.error('❌ Error seeding API test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedAPITestData().catch((error) => {
  console.error(error);
  process.exit(1);
});