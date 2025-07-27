#!/usr/bin/env tsx
/**
 * Coverage Test Seed Data
 * 
 * This script seeds the database with comprehensive data for coverage tests
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedCoverageTestData() {
  console.log('🌱 Seeding coverage test data...');

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create diverse users for comprehensive coverage
    const hashedPassword = await hash('coverage123', 10);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'coverage.teacher1@test.com',
          passwordHash: hashedPassword,
          name: 'Coverage Teacher 1',
          role: 'TEACHER',
        },
      }),
      prisma.user.create({
        data: {
          email: 'coverage.teacher2@test.com',
          passwordHash: hashedPassword,
          name: 'Coverage Teacher 2',
          role: 'TEACHER',
        },
      }),
      prisma.user.create({
        data: {
          email: 'coverage.admin@test.com',
          passwordHash: hashedPassword,
          name: 'Coverage Admin',
          role: 'ADMIN',
        },
      }),
    ]);

    // Create comprehensive curriculum data
    const subjects = ['Mathematics', 'Science', 'Language Arts', 'Social Studies', 'Arts', 'Physical Education'];
    const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
    
    const curricula = [];
    for (const subject of subjects) {
      for (const grade of grades.slice(0, 3)) { // Create for first 3 grades per subject
        const curriculum = await prisma.curriculum.create({
          data: {
            subject,
            grade,
            board: 'Ontario',
            year: 2024,
            expectations: {
              create: Array.from({ length: 5 }, (_, i) => ({
                code: `${subject.charAt(0)}${grade}.${i + 1}`,
                description: `${subject} expectation ${i + 1} for grade ${grade}`,
                category: i % 2 === 0 ? 'Core' : 'Extended',
                strand: i < 3 ? 'Primary' : 'Secondary',
              })),
            },
          },
        });
        curricula.push(curriculum);
      }
    }

    // Create lesson plans with various states for coverage
    const lessonPlanData = [
      // Complete lesson plans
      {
        title: 'Complete Math Lesson',
        subject: 'Mathematics',
        grade: '3',
        duration: 60,
        objectives: 'Students will master multiplication',
        materials: 'Manipulatives, worksheets',
        introduction: 'Review previous concepts',
        mainActivity: 'Group work on multiplication',
        conclusion: 'Exit ticket assessment',
        assessment: 'Formative and summative',
        userId: users[0].id,
        isPublic: true,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-01'),
      },
      // Minimal lesson plan
      {
        title: 'Quick Science Demo',
        subject: 'Science',
        grade: '2',
        duration: 30,
        objectives: 'Observe states of matter',
        materials: 'Ice, water, steam',
        introduction: 'What is matter?',
        mainActivity: 'Demonstration',
        conclusion: 'Discussion',
        assessment: 'Observation',
        userId: users[1].id,
        isPublic: false,
      },
      // Draft lesson plan
      {
        title: 'Draft Language Lesson',
        subject: 'Language Arts',
        grade: '1',
        duration: 45,
        objectives: 'Reading comprehension',
        materials: 'Books',
        introduction: 'Story time',
        mainActivity: 'Reading',
        conclusion: 'Questions',
        assessment: 'Verbal',
        userId: users[0].id,
        status: 'DRAFT',
      },
    ];

    for (const data of lessonPlanData) {
      await prisma.lessonPlan.create({ data });
    }

    // Create templates for coverage
    await prisma.lessonPlanTemplate.create({
      data: {
        title: 'Generic Math Template',
        subject: 'Mathematics',
        grade: '4',
        duration: 60,
        objectives: 'Template objectives',
        materials: 'Standard materials',
        introduction: 'Template introduction',
        mainActivity: 'Template activity',
        conclusion: 'Template conclusion',
        assessment: 'Template assessment',
        category: 'MATH',
        userId: users[2].id,
        isPublic: true,
      },
    });

    const stats = {
      users: await prisma.user.count(),
      curricula: await prisma.curriculum.count(),
      expectations: await prisma.curriculumExpectation.count(),
      lessonPlans: await prisma.lessonPlan.count(),
      templates: await prisma.lessonPlanTemplate.count(),
    };

    console.log('✅ Coverage test data seeded successfully!');
    console.log('📊 Database statistics:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });
  } catch (error) {
    console.error('❌ Error seeding coverage test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedCoverageTestData().catch((error) => {
  console.error(error);
  process.exit(1);
});