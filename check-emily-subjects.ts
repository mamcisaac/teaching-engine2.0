#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmilySubjects() {
  console.log('🔍 Checking Emily McIsaac\'s ALL curriculum data...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get ALL Long Range Plans for Emily
    const lrps = await prisma.longRangePlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true
      }
    });

    console.log(`📋 LONG RANGE PLANS (${lrps.length} total):`);
    lrps.forEach((lrp, index) => {
      console.log(`${index + 1}. "${lrp.title}" - Subject: "${lrp.subject}" - Grade: ${lrp.grade}`);
    });

    // Get ALL Unit Plans for Emily
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id
      },
      include: {
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        }
      },
      take: 20  // Limit to first 20 to see what exists
    });

    console.log(`\n📚 UNIT PLANS (${unitPlans.length} total, showing first 20):`);
    unitPlans.forEach((unit, index) => {
      console.log(`${index + 1}. "${unit.title}" - Subject: "${unit.longRangePlan.subject}"`);
    });

    // Get ALL Lesson Plans for Emily
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        date: true
      },
      take: 20  // Limit to first 20 to see what exists
    });

    console.log(`\n📝 LESSON PLANS (${lessonPlans.length} total, showing first 20):`);
    lessonPlans.forEach((lesson, index) => {
      console.log(`${index + 1}. "${lesson.title}" - Subject: "${lesson.subject}" - Grade: ${lesson.grade} - Date: ${lesson.date.toDateString()}`);
    });

    // Get unique subjects from lesson plans
    const uniqueSubjects = [...new Set(lessonPlans.map(l => l.subject).filter(Boolean))];
    console.log(`\n🎯 UNIQUE SUBJECTS IN LESSON PLANS:`);
    uniqueSubjects.forEach(subject => {
      const count = lessonPlans.filter(l => l.subject === subject).length;
      console.log(`   "${subject}": ${count} lessons`);
    });

    // Get unique subjects from LRPs
    const uniqueLRPSubjects = [...new Set(lrps.map(l => l.subject).filter(Boolean))];
    console.log(`\n🎯 UNIQUE SUBJECTS IN LONG RANGE PLANS:`);
    uniqueLRPSubjects.forEach(subject => {
      const count = lrps.filter(l => l.subject === subject).length;
      console.log(`   "${subject}": ${count} LRPs`);
    });

    console.log('\n✅ Emily\'s subject check complete!');

  } catch (error) {
    console.error('❌ Error checking Emily\'s subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkEmilySubjects()
  .then(() => console.log('🎉 Subject check completed successfully!'))
  .catch((error) => {
    console.error('💥 Subject check failed:', error);
    process.exit(1);
  });