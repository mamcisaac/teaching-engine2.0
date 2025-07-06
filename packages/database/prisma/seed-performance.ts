#!/usr/bin/env tsx
/**
 * Performance Test Seed Data
 * 
 * This script seeds the database with large datasets for performance testing
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedPerformanceTestData() {
  console.log('🌱 Seeding performance test data (this may take a while)...');

  const startTime = Date.now();

  try {
    // Clear existing data
    await prisma.lessonPlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating users...');
    // Create many users for performance testing
    const hashedPassword = await hash('performance123', 10);
    const userCount = 50;
    
    const users = await Promise.all(
      Array.from({ length: userCount }, (_, i) => 
        prisma.user.create({
          data: {
            email: `perf.user${i}@test.com`,
            passwordHash: hashedPassword,
            name: `Performance User ${i}`,
            role: i % 10 === 0 ? 'ADMIN' : 'TEACHER',
          },
        })
      )
    );

    console.log(`✅ Created ${users.length} users`);

    console.log('Creating curricula...');
    // Create extensive curriculum data
    const subjects = ['Mathematics', 'Science', 'Language Arts', 'Social Studies', 'Arts', 'Physical Education'];
    const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
    
    for (const subject of subjects) {
      for (const grade of grades) {
        await prisma.curriculum.create({
          data: {
            subject,
            grade,
            board: 'Ontario',
            year: 2024,
            expectations: {
              create: Array.from({ length: 20 }, (_, i) => ({
                code: `${subject.charAt(0)}${grade}.${i + 1}`,
                description: `${subject} expectation ${i + 1} for grade ${grade} - This is a longer description to simulate real curriculum expectations that contain detailed learning outcomes and assessment criteria`,
                category: ['Core', 'Extended', 'Enrichment'][i % 3],
                strand: ['Strand A', 'Strand B', 'Strand C', 'Strand D'][i % 4],
              })),
            },
          },
        });
      }
    }

    const curriculumCount = await prisma.curriculum.count();
    const expectationCount = await prisma.curriculumExpectation.count();
    console.log(`✅ Created ${curriculumCount} curricula with ${expectationCount} expectations`);

    console.log('Creating lesson plans...');
    // Create many lesson plans
    const lessonPlanCount = 500;
    const lessonPlanBatches = [];
    const batchSize = 50;

    for (let batch = 0; batch < lessonPlanCount / batchSize; batch++) {
      const lessonPlans = Array.from({ length: batchSize }, (_, i) => {
        const index = batch * batchSize + i;
        const user = users[index % users.length];
        const subject = subjects[index % subjects.length];
        const grade = grades[index % grades.length];
        
        return {
          title: `Performance Test Lesson ${index}`,
          subject,
          grade,
          duration: 30 + (index % 90),
          objectives: `Objective ${index}: This is a detailed objective that explains what students will learn, understand, and be able to do by the end of this lesson. It includes specific learning outcomes and success criteria.`,
          materials: `Materials for lesson ${index}: paper, pencils, textbooks, digital resources, manipulatives, art supplies, science equipment, and various other classroom resources`,
          introduction: `Introduction ${index}: A comprehensive introduction that sets the stage for learning, activates prior knowledge, and engages students in the topic through various strategies and activities.`,
          mainActivity: `Main Activity ${index}: The core learning experience where students engage with new concepts through hands-on activities, collaborative work, problem-solving, and guided practice with teacher support.`,
          conclusion: `Conclusion ${index}: A reflective wrap-up that consolidates learning, allows students to share their understanding, and prepares them for future lessons on this topic.`,
          assessment: `Assessment ${index}: Multiple assessment strategies including formative assessment through observation, exit tickets, peer assessment, self-reflection, and summative evaluation methods.`,
          userId: user.id,
          isPublic: index % 3 !== 0,
          status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'][index % 3],
          startDate: new Date(2024, 8, 1 + (index % 30)),
          endDate: new Date(2024, 8, 1 + (index % 30)),
        };
      });

      await prisma.lessonPlan.createMany({
        data: lessonPlans,
      });

      console.log(`  Created batch ${batch + 1}/${lessonPlanCount / batchSize}`);
    }

    const totalLessonPlans = await prisma.lessonPlan.count();
    console.log(`✅ Created ${totalLessonPlans} lesson plans`);

    console.log('Creating templates...');
    // Create lesson plan templates
    const templateCount = 50;
    const templates = await Promise.all(
      Array.from({ length: templateCount }, (_, i) => 
        prisma.lessonPlanTemplate.create({
          data: {
            title: `Performance Template ${i}`,
            subject: subjects[i % subjects.length],
            grade: grades[i % grades.length],
            duration: 60,
            objectives: 'Template objectives for performance testing',
            materials: 'Standard template materials',
            introduction: 'Template introduction section',
            mainActivity: 'Template main activity section',
            conclusion: 'Template conclusion section',
            assessment: 'Template assessment section',
            category: ['MATH', 'SCIENCE', 'LITERACY', 'ARTS', 'OTHER'][i % 5],
            userId: users[i % users.length].id,
            isPublic: true,
          },
        })
      )
    );

    console.log(`✅ Created ${templates.length} templates`);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ Performance test data seeded successfully!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log('\n📊 Final database statistics:');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Curricula: ${await prisma.curriculum.count()}`);
    console.log(`- Expectations: ${await prisma.curriculumExpectation.count()}`);
    console.log(`- Lesson Plans: ${await prisma.lessonPlan.count()}`);
    console.log(`- Templates: ${await prisma.lessonPlanTemplate.count()}`);
  } catch (error) {
    console.error('❌ Error seeding performance test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedPerformanceTestData().catch((error) => {
  console.error(error);
  process.exit(1);
});