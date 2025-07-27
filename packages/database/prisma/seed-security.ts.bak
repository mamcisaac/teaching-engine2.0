#!/usr/bin/env tsx
/**
 * Security Test Seed Data
 * 
 * This script seeds the database with data for security tests
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSecurityTestData() {
  console.log('🌱 Seeding security test data...');

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create users with various roles for security testing
    const hashedPassword = await hash('securepassword123', 10);
    const weakPassword = await hash('123456', 10); // Intentionally weak for testing
    
    // Valid users
    const adminUser = await prisma.user.create({
      data: {
        email: 'security.admin@test.com',
        passwordHash: hashedPassword,
        name: 'Security Admin',
        role: 'ADMIN',
      },
    });

    const teacherUser = await prisma.user.create({
      data: {
        email: 'security.teacher@test.com',
        passwordHash: hashedPassword,
        name: 'Security Teacher',
        role: 'TEACHER',
      },
    });

    const schoolAdminUser = await prisma.user.create({
      data: {
        email: 'security.school.admin@test.com',
        passwordHash: hashedPassword,
        name: 'School Admin',
        role: 'SCHOOL_ADMIN',
      },
    });

    // User with weak password for testing
    const weakUser = await prisma.user.create({
      data: {
        email: 'weak.password@test.com',
        passwordHash: weakPassword,
        name: 'Weak Password User',
        role: 'TEACHER',
      },
    });

    // Create sensitive data for authorization testing
    const privateLessonPlan = await prisma.lessonPlan.create({
      data: {
        title: 'Private Lesson Plan',
        subject: 'Security Test',
        grade: '5',
        duration: 60,
        objectives: 'Test authorization',
        materials: 'Confidential materials',
        introduction: 'Private introduction',
        mainActivity: 'Private activity',
        conclusion: 'Private conclusion',
        assessment: 'Private assessment',
        userId: teacherUser.id,
        isPublic: false,
        startDate: new Date(),
        endDate: new Date(),
      },
    });

    const publicLessonPlan = await prisma.lessonPlan.create({
      data: {
        title: 'Public Lesson Plan',
        subject: 'Security Test',
        grade: '5',
        duration: 60,
        objectives: 'Public test',
        materials: 'Public materials',
        introduction: 'Public introduction',
        mainActivity: 'Public activity',
        conclusion: 'Public conclusion',
        assessment: 'Public assessment',
        userId: teacherUser.id,
        isPublic: true,
        startDate: new Date(),
        endDate: new Date(),
      },
    });

    console.log('✅ Security test data seeded successfully!');
    console.log(`- Users: ${await prisma.user.count()} (including 1 with weak password)`);
    console.log(`- Private lesson plans: 1`);
    console.log(`- Public lesson plans: 1`);
    console.log('\n⚠️  Note: This includes intentionally weak passwords for security testing only!');
  } catch (error) {
    console.error('❌ Error seeding security test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedSecurityTestData().catch((error) => {
  console.error(error);
  process.exit(1);
});