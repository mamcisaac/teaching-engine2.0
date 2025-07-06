#!/usr/bin/env tsx
/**
 * Frontend Test Seed Data
 * 
 * This script seeds the database with data for frontend tests
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedFrontendTestData() {
  console.log('🌱 Seeding frontend test data...');

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create frontend test user
    const hashedPassword = await hash('frontend123', 10);
    
    const frontendUser = await prisma.user.create({
      data: {
        email: 'frontend.test@example.com',
        passwordHash: hashedPassword,
        name: 'Frontend Test User',
        role: 'TEACHER',
      },
    });

    // Create multiple curricula for frontend testing
    const subjects = ['Mathematics', 'Science', 'Language Arts', 'Social Studies'];
    const grades = ['1', '2', '3', '4', '5', '6'];

    for (const subject of subjects) {
      for (const grade of grades.slice(0, 2)) { // Just create for first 2 grades
        await prisma.curriculum.create({
          data: {
            subject,
            grade,
            board: 'Ontario',
            year: 2024,
            expectations: {
              create: [
                {
                  code: `${subject.charAt(0)}${grade}.1`,
                  description: `${subject} expectation 1 for grade ${grade}`,
                  category: 'Core',
                  strand: 'Main',
                },
                {
                  code: `${subject.charAt(0)}${grade}.2`,
                  description: `${subject} expectation 2 for grade ${grade}`,
                  category: 'Core',
                  strand: 'Main',
                },
              ],
            },
          },
        });
      }
    }

    // Create sample lesson plans for UI testing
    const lessonTitles = [
      'Introduction to Numbers',
      'Exploring Patterns',
      'Science Investigation',
      'Creative Writing Workshop',
      'Community Helpers',
    ];

    for (let i = 0; i < lessonTitles.length; i++) {
      await prisma.lessonPlan.create({
        data: {
          title: lessonTitles[i],
          subject: subjects[i % subjects.length],
          grade: grades[i % grades.length],
          duration: 45 + (i * 15),
          objectives: `Objective for ${lessonTitles[i]}`,
          materials: 'Various classroom materials',
          introduction: 'Engaging introduction',
          mainActivity: 'Interactive main activity',
          conclusion: 'Reflective conclusion',
          assessment: 'Formative assessment',
          userId: frontendUser.id,
          startDate: new Date(2024, 8, 15 + i),
          endDate: new Date(2024, 8, 15 + i),
        },
      });
    }

    console.log('✅ Frontend test data seeded successfully!');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Curricula: ${await prisma.curriculum.count()}`);
    console.log(`- Expectations: ${await prisma.curriculumExpectation.count()}`);
    console.log(`- Lesson Plans: ${await prisma.lessonPlan.count()}`);
  } catch (error) {
    console.error('❌ Error seeding frontend test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedFrontendTestData().catch((error) => {
  console.error(error);
  process.exit(1);
});