#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDailyLessons() {
  console.log('📊 ANALYZING DAILY LESSON DISTRIBUTION\n');
  console.log('='.repeat(80));
  
  // Get all lessons with dates
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });
  
  // Group by date
  const byDate: Record<string, any[]> = {};
  lessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().split('T')[0];
    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }
    byDate[dateStr].push({
      subject: lesson.unitPlan.longRangePlan.subject,
      title: lesson.title,
      duration: lesson.duration,
      time: lesson.startTime
    });
  });
  
  // Analyze daily coverage
  const dates = Object.keys(byDate).sort();
  let totalDays = 0;
  let totalMinutes = 0;
  const dailyMinutes: number[] = [];
  
  console.log('SAMPLE DAYS (First 10):');
  console.log('-'.repeat(80));
  
  dates.slice(0, 10).forEach(date => {
    const dayLessons = byDate[date];
    const dayMinutes = dayLessons.reduce((sum, l) => sum + l.duration, 0);
    dailyMinutes.push(dayMinutes);
    totalDays++;
    totalMinutes += dayMinutes;
    
    console.log(`\n${date} (${dayLessons.length} lessons, ${dayMinutes} minutes):`);
    dayLessons.forEach(l => {
      console.log(`  - ${l.time || '??:??'}: ${l.subject} - ${l.title} (${l.duration} min)`);
    });
  });
  
  // Overall statistics
  console.log('\n' + '='.repeat(80));
  console.log('OVERALL STATISTICS:');
  console.log('-'.repeat(80));
  console.log(`Total Lessons: ${lessons.length}`);
  console.log(`Unique Days: ${dates.length}`);
  console.log(`Date Range: ${dates[0]} to ${dates[dates.length - 1]}`);
  console.log(`Average Lessons per Day: ${(lessons.length / dates.length).toFixed(1)}`);
  
  // Minutes analysis
  const avgMinutesPerDay = totalMinutes / totalDays;
  console.log(`\nINSTRUCTIONAL TIME:`);
  console.log(`Average Minutes per Day: ${Math.round(avgMinutesPerDay)}`);
  console.log(`Required Minutes per Day: 285`);
  console.log(`Gap: ${285 - Math.round(avgMinutesPerDay)} minutes`);
  
  // Subject distribution
  console.log(`\nLESSONS BY SUBJECT:`);
  const subjectCounts: Record<string, number> = {};
  lessons.forEach(l => {
    const subject = l.unitPlan.longRangePlan.subject;
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });
  
  Object.entries(subjectCounts).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} lessons`);
  });
  
  // What's needed for proper coverage
  console.log('\n' + '='.repeat(80));
  console.log('REQUIRED FOR FULL COVERAGE (181 instructional days):');
  console.log('-'.repeat(80));
  console.log('Daily (every day):');
  console.log('  - Français: 181 lessons (60 min each) - Currently: ' + (subjectCounts['Français langue première'] || 0));
  console.log('  - Mathématiques: 181 lessons (45 min each) - Currently: ' + (subjectCounts['Mathématiques'] || 0));
  console.log('\n3x per week:');
  console.log('  - Sciences: 108 lessons (45 min each) - Currently: ' + (subjectCounts['Sciences de la nature'] || 0));
  console.log('  - Éducation physique: 108 lessons (45 min each) - Currently: ' + (subjectCounts['Éducation physique'] || 0));
  console.log('\n2x per week:');
  console.log('  - Études sociales: 72 lessons (45 min each) - Currently: ' + (subjectCounts['Sciences humaines'] || 0));
  console.log('  - Arts visuels: 72 lessons (45 min each) - Currently: ' + (subjectCounts['Arts visuels'] || 0));
  console.log('  - Musique: 72 lessons (45 min each) - Currently: ' + (subjectCounts['Music'] || 0));
  console.log('\n1x per week:');
  console.log('  - Santé/FPS: 36 lessons (45 min each) - Currently: ' + (subjectCounts['Formation personnelle et sociale'] || 0));
  
  const totalRequired = 181 + 181 + 108 + 108 + 72 + 72 + 72 + 36;
  console.log(`\nTOTAL REQUIRED: ${totalRequired} lessons`);
  console.log(`CURRENTLY HAVE: ${lessons.length} lessons`);
  console.log(`GAP: ${totalRequired - lessons.length} lessons needed`);
  
  await prisma.$disconnect();
}

analyzeDailyLessons().catch(console.error);