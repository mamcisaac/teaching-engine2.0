#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewContinuity() {
  console.log('📊 SEPTEMBER-OCTOBER-NOVEMBER CONTINUITY REVIEW');
  console.log('=' + '='.repeat(60) + '\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get lessons by month
  const septLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: emily.id,
      date: {
        gte: new Date('2025-09-01'),
        lte: new Date('2025-09-30')
      }
    },
    orderBy: { date: 'asc' }
  });

  const octLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: emily.id,
      date: {
        gte: new Date('2025-10-01'),
        lte: new Date('2025-10-31')
      }
    },
    orderBy: { date: 'asc' }
  });

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

  console.log('📅 LESSON DISTRIBUTION');
  console.log(`September: ${septLessons.length} lessons`);
  console.log(`October:   ${octLessons.length} lessons`);
  console.log(`November:  ${novLessons.length} lessons`);
  console.log(`TOTAL:     ${septLessons.length + octLessons.length + novLessons.length} lessons\n`);

  // Subject distribution
  const countBySubject = (lessons: any[]) => {
    const counts: Record<string, number> = {};
    lessons.forEach(l => {
      const subject = l.subject || 'Unknown';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    return counts;
  };

  console.log('📚 SUBJECT PROGRESSION');
  console.log('\nSeptember:');
  Object.entries(countBySubject(septLessons)).forEach(([subj, count]) => {
    console.log(`  ${subj}: ${count}`);
  });
  
  console.log('\nOctober:');
  Object.entries(countBySubject(octLessons)).forEach(([subj, count]) => {
    console.log(`  ${subj}: ${count}`);
  });
  
  console.log('\nNovember:');
  Object.entries(countBySubject(novLessons)).forEach(([subj, count]) => {
    console.log(`  ${subj}: ${count}`);
  });

  // Check for French integration
  console.log('\n🇫🇷 FRENCH INTEGRATION');
  const checkFrench = (lessons: any[], month: string) => {
    const nonFrench = lessons.filter(l => l.subject !== 'Français langue première');
    const withFrench = nonFrench.filter(l => 
      l.learningGoals?.toLowerCase().includes('french') || 
      l.learningGoals?.toLowerCase().includes('français')
    );
    const percent = nonFrench.length > 0 ? Math.round((withFrench.length / nonFrench.length) * 100) : 0;
    console.log(`${month}: ${withFrench.length}/${nonFrench.length} (${percent}%)`);
  };

  checkFrench(septLessons, 'September');
  checkFrench(octLessons, 'October  ');
  checkFrench(novLessons, 'November ');

  // Check daily loads
  console.log('\n📊 DAILY LOAD ANALYSIS');
  const analyzeDailyLoads = (lessons: any[], month: string) => {
    const byDate: Record<string, number> = {};
    lessons.forEach(l => {
      const key = l.date.toDateString();
      byDate[key] = (byDate[key] || 0) + 1;
    });
    
    const counts = Object.values(byDate);
    if (counts.length === 0) {
      console.log(`${month}: No lessons`);
      return;
    }
    
    const max = Math.max(...counts);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const overloaded = counts.filter(c => c > 5).length;
    
    console.log(`${month}: Max=${max} lessons, Avg=${avg.toFixed(1)}, Overloaded days=${overloaded}`);
  };

  analyzeDailyLoads(septLessons, 'September');
  analyzeDailyLoads(octLessons, 'October  ');
  analyzeDailyLoads(novLessons, 'November ');

  // Theme progression
  console.log('\n🎨 THEME PROGRESSION');
  console.log('September: Bienvenue à l\'école (Welcome to school)');
  console.log('October:   Ma famille et moi (My family and me)');
  console.log('November:  Les fêtes d\'automne (Fall celebrations)');
  
  // Vocabulary progression
  console.log('\n📖 VOCABULARY PROGRESSION');
  console.log('September: école, ami, ensemble, bonjour, merci');
  console.log('October:   famille, maman, papa, maison, aimer');
  console.log('November:  gratitude, hiver, paix, célébrer, lumière');

  // Check for gaps and weekend lessons
  console.log('\n⚠️ POTENTIAL ISSUES');
  
  // Check for weekend lessons
  const allLessons = [...septLessons, ...octLessons, ...novLessons];
  const weekendLessons = allLessons.filter(l => {
    const day = l.date.getDay();
    return day === 0 || day === 6;
  });
  
  if (weekendLessons.length > 0) {
    console.log(`❌ Weekend lessons found: ${weekendLessons.length}`);
    weekendLessons.forEach(l => {
      console.log(`   - ${l.titleFr} on ${l.date.toDateString()}`);
    });
  } else {
    console.log('✅ No weekend lessons');
  }

  // Check for duplicate dates
  const duplicates = await prisma.$queryRaw`
    SELECT date, subject, COUNT(*) as count
    FROM ETFOLessonPlan
    WHERE userId = ${emily.id}
    GROUP BY date, subject
    HAVING COUNT(*) > 1
  ` as any[];

  if (duplicates.length > 0) {
    console.log(`❌ Duplicate date/subject combinations: ${duplicates.length}`);
  } else {
    console.log('✅ No duplicate dates');
  }

  // Assessment types
  console.log('\n📊 ASSESSMENT BALANCE');
  const formative = allLessons.filter(l => l.assessmentType === 'formative').length;
  const summative = allLessons.filter(l => l.assessmentType === 'summative').length;
  const diagnostic = allLessons.filter(l => l.assessmentType === 'diagnostic').length;
  
  console.log(`Formative:  ${formative} (${Math.round((formative / allLessons.length) * 100)}%)`);
  console.log(`Summative:  ${summative} (${Math.round((summative / allLessons.length) * 100)}%)`);
  console.log(`Diagnostic: ${diagnostic} (${Math.round((diagnostic / allLessons.length) * 100)}%)`);

  // Overall quality metrics
  console.log('\n🏆 QUALITY METRICS');
  const subFriendly = allLessons.filter(l => l.isSubFriendly).length;
  const withAssessment = allLessons.filter(l => l.assessmentNotes).length;
  
  console.log(`Sub-friendly: ${subFriendly}/${allLessons.length} (${Math.round((subFriendly / allLessons.length) * 100)}%)`);
  console.log(`With assessment notes: ${withAssessment}/${allLessons.length} (${Math.round((withAssessment / allLessons.length) * 100)}%)`);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONTINUITY ASSESSMENT');
  console.log('='.repeat(60));
  
  const issues = [];
  const strengths = [];
  
  if (weekendLessons.length === 0) strengths.push('No weekend lessons');
  else issues.push('Weekend lessons need fixing');
  
  if (duplicates.length === 0) strengths.push('No scheduling conflicts');
  else issues.push('Duplicate dates need resolution');
  
  if (formative > summative * 10) strengths.push('Good assessment balance');
  else issues.push('Consider assessment balance');
  
  if (subFriendly === allLessons.length) strengths.push('100% sub-friendly');
  else issues.push('Some lessons not sub-friendly');

  console.log('\nSTRENGTHS:');
  strengths.forEach(s => console.log(`  ✅ ${s}`));
  
  if (issues.length > 0) {
    console.log('\nISSUES:');
    issues.forEach(i => console.log(`  ⚠️ ${i}`));
  }
  
  console.log('\nFINAL VERDICT:');
  if (issues.length === 0) {
    console.log('✅ EXCELLENT CONTINUITY - Ready for classroom use!');
  } else if (issues.length <= 2) {
    console.log('⚠️ GOOD CONTINUITY - Minor issues to address');
  } else {
    console.log('❌ NEEDS WORK - Several issues require attention');
  }

  await prisma.$disconnect();
}

reviewContinuity()
  .then(() => {
    console.log('\n✅ Continuity review complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });