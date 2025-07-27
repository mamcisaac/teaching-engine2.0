#!/usr/bin/env tsx
/**
 * Integration Test Seed Data
 * 
 * This script seeds the database with data for integration tests
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedIntegrationData() {
  console.log('🌱 Seeding integration test data...');

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const hashedPassword = await hash('testpassword123', 10);
    
    const teacher1 = await prisma.user.create({
      data: {
        email: 'integration.teacher1@test.com',
        passwordHash: hashedPassword,
        name: 'Integration Teacher 1',
        role: 'TEACHER',
      },
    });

    const teacher2 = await prisma.user.create({
      data: {
        email: 'integration.teacher2@test.com',
        passwordHash: hashedPassword,
        name: 'Integration Teacher 2',
        role: 'TEACHER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'integration.admin@test.com',
        passwordHash: hashedPassword,
        name: 'Integration Admin',
        role: 'ADMIN',
      },
    });

    // Create curriculum data
    const mathCurriculum = await prisma.curriculum.create({
      data: {
        subject: 'Mathematics',
        grade: '4',
        board: 'Ontario',
        year: 2024,
        expectations: {
          create: [
            {
              code: 'B1.1',
              description: 'read, represent, compose, and decompose whole numbers up to and including 10 000',
              category: 'Number',
              strand: 'Number',
            },
            {
              code: 'B1.2',
              description: 'compare and order whole numbers up to and including 10 000',
              category: 'Number',
              strand: 'Number',
            },
          ],
        },
      },
    });

    const scienceCurriculum = await prisma.curriculum.create({
      data: {
        subject: 'Science',
        grade: '4',
        board: 'Ontario',
        year: 2024,
        expectations: {
          create: [
            {
              code: 'A1.1',
              description: 'use a scientific research process and associated skills to conduct investigations',
              category: 'STEM Skills',
              strand: 'STEM Skills and Connections',
            },
            {
              code: 'B1.1',
              description: 'assess the impacts of human activities on habitats and communities',
              category: 'Life Systems',
              strand: 'Habitats and Communities',
            },
          ],
        },
      },
    });

    // Create lesson plans
    const lessonPlan1 = await prisma.lessonPlan.create({
      data: {
        title: 'Introduction to Place Value',
        subject: 'Mathematics',
        grade: '4',
        duration: 60,
        objectives: 'Students will understand place value up to 10,000',
        materials: 'Base-10 blocks, place value charts',
        introduction: 'Review previous knowledge of place value',
        mainActivity: 'Hands-on exploration with base-10 blocks',
        conclusion: 'Exit ticket with place value questions',
        assessment: 'Observation and exit ticket',
        userId: teacher1.id,
        curriculumExpectations: {
          connect: [{ id: (await prisma.curriculumExpectation.findFirst({ where: { code: 'B1.1' } }))!.id }],
        },
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-15'),
      },
    });

    const lessonPlan2 = await prisma.lessonPlan.create({
      data: {
        title: 'Exploring Local Habitats',
        subject: 'Science',
        grade: '4',
        duration: 90,
        objectives: 'Students will identify characteristics of local habitats',
        materials: 'Field notebooks, cameras, identification guides',
        introduction: 'Discussion about what makes a habitat',
        mainActivity: 'Field trip to observe local habitats',
        conclusion: 'Share observations and create habitat maps',
        assessment: 'Habitat observation sheets and presentations',
        userId: teacher1.id,
        curriculumExpectations: {
          connect: [{ id: (await prisma.curriculumExpectation.findFirst({ where: { code: 'B1.1' } }))!.id }],
        },
        startDate: new Date('2024-09-20'),
        endDate: new Date('2024-09-20'),
      },
    });

    console.log(`✅ Created ${await prisma.user.count()} users`);
    console.log(`✅ Created ${await prisma.curriculum.count()} curricula`);
    console.log(`✅ Created ${await prisma.curriculumExpectation.count()} expectations`);
    console.log(`✅ Created ${await prisma.lessonPlan.count()} lesson plans`);
    
    console.log('✅ Integration test data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding integration test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedIntegrationData().catch((error) => {
  console.error(error);
  process.exit(1);
});