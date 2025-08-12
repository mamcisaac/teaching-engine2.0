#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalNovemberReview() {
  console.log('🔍 CRITICAL NOVEMBER REVIEW');
  console.log('=' + '='.repeat(60) + '\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  const novLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: emily.id,
      date: {
        gte: new Date('2025-11-01'),
        lte: new Date('2025-11-30')
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log('📊 NOVEMBER STATISTICS');
  console.log(`Total lessons: ${novLessons.length}`);
  
  // Subject breakdown
  const bySubject: Record<string, number> = {};
  novLessons.forEach(l => {
    const subject = l.subject || 'Unknown';
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  });
  
  console.log('\nBy Subject:');
  Object.entries(bySubject).forEach(([subj, count]) => {
    console.log(`  ${subj}: ${count}`);
  });
  
  // Check by date
  const byDate: Record<string, any[]> = {};
  novLessons.forEach(l => {
    const key = l.date.toDateString();
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(l);
  });
  
  console.log('\n📅 DAILY DISTRIBUTION');
  Object.entries(byDate).sort().forEach(([date, lessons]) => {
    console.log(`${date}: ${lessons.length} lessons`);
    lessons.forEach(l => {
      console.log(`  - ${l.subject}: ${l.titleFr || l.title}`);
    });
  });
  
  // Check for missing fields
  console.log('\n⚠️ QUALITY CHECKS');
  const issues: string[] = [];
  
  novLessons.forEach(l => {
    if (!l.titleFr) issues.push(`Missing French title: ${l.title}`);
    if (!l.learningGoals) issues.push(`Missing learning goals: ${l.titleFr || l.title}`);
    if (!l.materials) issues.push(`Missing materials: ${l.titleFr || l.title}`);
    if (!l.assessmentNotes) issues.push(`Missing assessment: ${l.titleFr || l.title}`);
    if (!l.mindsOn || !l.action || !l.consolidation) {
      issues.push(`Incomplete 3-part structure: ${l.titleFr || l.title}`);
    }
    if (!l.accommodations) issues.push(`Missing accommodations: ${l.titleFr || l.title}`);
    if (!l.differentiationStrategies) issues.push(`Missing differentiation: ${l.titleFr || l.title}`);
  });
  
  if (issues.length > 0) {
    console.log('ISSUES FOUND:');
    issues.slice(0, 10).forEach(i => console.log(`  ❌ ${i}`));
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more issues`);
    }
  } else {
    console.log('✅ All lessons complete with required fields');
  }
  
  // Check for gaps in dates (excluding Nov 11 - Remembrance Day)
  console.log('\n📆 DATE COVERAGE');
  const novemberWeekdays: string[] = [];
  for (let d = 3; d <= 28; d++) {
    const date = new Date(2025, 10, d);
    // Skip weekends and Remembrance Day (Nov 11)
    if (date.getDay() !== 0 && date.getDay() !== 6 && d !== 11) {
      novemberWeekdays.push(date.toDateString());
    }
  }
  
  const lessonDates = Object.keys(byDate);
  const missingDates = novemberWeekdays.filter(d => !lessonDates.includes(d));
  
  if (missingDates.length > 0) {
    console.log('Missing coverage on:');
    missingDates.forEach(d => console.log(`  ⚠️ ${d}`));
  } else {
    console.log('✅ All November weekdays covered (excluding Remembrance Day)');
  }
  
  // Check French integration
  console.log('\n🇫🇷 FRENCH INTEGRATION CHECK');
  const nonFrenchLessons = novLessons.filter(l => l.subject !== 'Français langue première');
  let frenchIntegrated = 0;
  const frenchIssues: string[] = [];
  
  nonFrenchLessons.forEach(l => {
    if (l.learningGoals?.toLowerCase().includes('french') || 
        l.learningGoals?.toLowerCase().includes('français')) {
      frenchIntegrated++;
    } else {
      frenchIssues.push(`No French integration: ${l.subject} - ${l.titleFr}`);
    }
  });
  
  const frenchPercent = nonFrenchLessons.length > 0 ? 
    Math.round((frenchIntegrated / nonFrenchLessons.length) * 100) : 0;
  
  console.log(`French integration: ${frenchIntegrated}/${nonFrenchLessons.length} (${frenchPercent}%)`);
  
  if (frenchIssues.length > 0) {
    console.log('Missing French integration:');
    frenchIssues.slice(0, 5).forEach(i => console.log(`  ⚠️ ${i}`));
  }
  
  // Check daily balance
  console.log('\n⚖️ DAILY BALANCE CHECK');
  const dailyCounts = Object.values(byDate).map(lessons => lessons.length);
  const maxDaily = Math.max(...dailyCounts);
  const avgDaily = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
  const overloadedDays = dailyCounts.filter(c => c > 5).length;
  
  console.log(`Max lessons per day: ${maxDaily}`);
  console.log(`Average lessons per day: ${avgDaily.toFixed(1)}`);
  console.log(`Days with >5 lessons: ${overloadedDays}`);
  
  if (maxDaily > 5) {
    console.log('⚠️ Some days may be overloaded');
  } else {
    console.log('✅ Good daily balance');
  }
  
  // Check assessment balance
  console.log('\n📊 ASSESSMENT BALANCE');
  const assessmentTypes: Record<string, number> = {};
  novLessons.forEach(l => {
    const type = l.assessmentType || 'unknown';
    assessmentTypes[type] = (assessmentTypes[type] || 0) + 1;
  });
  
  Object.entries(assessmentTypes).forEach(([type, count]) => {
    const percent = Math.round((count / novLessons.length) * 100);
    console.log(`${type}: ${count} (${percent}%)`);
  });
  
  // Final November quality score
  console.log('\n🏆 NOVEMBER QUALITY ASSESSMENT');
  let score = 100;
  
  if (issues.length > 0) score -= Math.min(20, issues.length * 2);
  if (frenchPercent < 90) score -= 10;
  if (overloadedDays > 0) score -= 10;
  if (missingDates.length > 0) score -= missingDates.length * 5;
  
  console.log(`NOVEMBER SCORE: ${score}%`);
  
  if (score >= 90) {
    console.log('✅ EXCELLENT - November lessons are production ready!');
  } else if (score >= 75) {
    console.log('⚠️ GOOD - Minor improvements needed');
  } else {
    console.log('❌ NEEDS WORK - Critical issues must be addressed');
  }
  
  await prisma.$disconnect();
  
  return {
    score,
    totalLessons: novLessons.length,
    issues: issues.length,
    frenchIntegration: frenchPercent,
    overloadedDays,
    missingDates: missingDates.length
  };
}

criticalNovemberReview()
  .then((result) => {
    console.log('\n✅ Critical November review complete');
    process.exit(result.score >= 90 ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });