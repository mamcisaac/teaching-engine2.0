#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLessonStatus() {
  console.log('📊 LESSON PLANS STATUS BY MONTH AND SUBJECT\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get lessons by month and subject
  const months = [
    { name: 'September', start: '2025-09-01', end: '2025-09-30' },
    { name: 'October', start: '2025-10-01', end: '2025-10-31' },
    { name: 'November', start: '2025-11-01', end: '2025-11-30' },
    { name: 'December', start: '2025-12-01', end: '2025-12-31' }
  ];

  let totalLessons = 0;
  
  for (const month of months) {
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date(month.start), lte: new Date(month.end) } 
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    totalLessons += lessons.length;
    console.log(`📅 ${month.name.toUpperCase()} 2025: ${lessons.length} lessons`);
    
    // Group by subject
    const bySubject: Record<string, any[]> = {};
    lessons.forEach(l => {
      if (!bySubject[l.subject]) {
        bySubject[l.subject] = [];
      }
      bySubject[l.subject].push(l);
    });

    Object.entries(bySubject).forEach(([subject, subjectLessons]) => {
      console.log(`  📚 ${subject}: ${subjectLessons.length} lessons`);
      
      // Show unit plans for this subject
      const units = [...new Set(subjectLessons.map(l => l.unitPlan?.title).filter(Boolean))];
      if (units.length > 0) {
        console.log(`     Units: ${units.join(', ')}`);
      }
    });
    console.log();
  }

  console.log(`📈 TOTAL LESSONS: ${totalLessons}\n`);

  // Get all unit plans
  console.log('📋 ALL UNIT PLANS STATUS:\n');
  const unitPlans = await prisma.unitPlan.findMany({
    where: { userId: emily.id },
    include: { lessonPlans: true },
    orderBy: { startDate: 'asc' }
  });

  unitPlans.forEach(unit => {
    const lessonCount = unit.lessonPlans.length;
    const status = lessonCount > 0 ? '✅' : '⚠️';
    console.log(`${status} ${unit.title} (${unit.subject}) - ${lessonCount} lessons`);
    console.log(`   Period: ${unit.startDate?.toDateString()} to ${unit.endDate?.toDateString()}`);
  });

  console.log(`\n📊 SUMMARY:`);
  console.log(`Total Unit Plans: ${unitPlans.length}`);
  const unitsWithLessons = unitPlans.filter(u => u.lessonPlans.length > 0).length;
  const unitsWithoutLessons = unitPlans.length - unitsWithLessons;
  console.log(`Units with lessons: ${unitsWithLessons}`);
  console.log(`Units without lessons: ${unitsWithoutLessons}`);

  // Check for missing subjects/gaps
  console.log(`\n🔍 GAPS ANALYSIS:`);
  const expectedSubjects = [
    'Français langue première',
    'Mathématiques', 
    'Sciences de la nature',
    'Arts visuels',
    'Éducation physique',
    'Music'
  ];

  for (const month of months) {
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date(month.start), lte: new Date(month.end) } 
      }
    });

    const subjectsWithLessons = [...new Set(lessons.map(l => l.subject))];
    const missingSubjects = expectedSubjects.filter(s => !subjectsWithLessons.includes(s));
    
    if (missingSubjects.length > 0) {
      console.log(`⚠️ ${month.name}: Missing subjects: ${missingSubjects.join(', ')}`);
    } else {
      console.log(`✅ ${month.name}: All core subjects covered`);
    }
  }

  await prisma.$disconnect();
}

checkLessonStatus()
  .then(() => {
    console.log('\n✅ Lesson status check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });