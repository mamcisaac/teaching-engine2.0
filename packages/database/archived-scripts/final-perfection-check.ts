#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalPerfectionCheck() {
  console.log('🏆 FINAL COMPREHENSIVE PERFECTION CHECK\n');
  console.log('=' + '='.repeat(60));
  console.log('Verifying every aspect of the Teaching Engine 2.0 system...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    let perfectScore = 100;
    const issues: string[] = [];
    const strengths: string[] = [];

    // Get all first semester lessons
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 1),
          lte: new Date(2025, 11, 31)
        }
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    console.log(`Total First Semester Lessons: ${allLessons.length}\n`);

    // === 1. CALENDAR ALIGNMENT CHECK ===
    console.log('📅 CALENDAR ALIGNMENT CHECK:');
    
    // Weekend check
    const weekendLessons = allLessons.filter(l => {
      const day = l.date.getDay();
      return day === 0 || day === 6;
    });

    if (weekendLessons.length === 0) {
      console.log('  ✅ No weekend lessons');
      strengths.push('Perfect weekday-only schedule');
    } else {
      console.log(`  ❌ ${weekendLessons.length} weekend lessons found`);
      issues.push(`${weekendLessons.length} weekend lessons`);
      perfectScore -= 10;
    }

    // Holiday check
    const holidays = [
      { date: new Date(2025, 8, 1), name: 'Labour Day' },
      { date: new Date(2025, 9, 14), name: 'Thanksgiving' }, // Oct 14
      { date: new Date(2025, 10, 11), name: 'Remembrance Day' }
    ];

    let holidayIssues = 0;
    for (const holiday of holidays) {
      const holidayLessons = allLessons.filter(l => 
        l.date.toDateString() === holiday.date.toDateString()
      );
      
      if (holidayLessons.length > 0) {
        // Exception for Remembrance Day ceremony
        if (holiday.name === 'Remembrance Day' && 
            holidayLessons.length === 1 &&
            holidayLessons[0].title?.includes('Ceremony')) {
          console.log(`  ✅ ${holiday.name}: Appropriate ceremony only`);
          strengths.push('Appropriate Remembrance Day ceremony');
        } else {
          console.log(`  ❌ ${holiday.name}: ${holidayLessons.length} lessons`);
          holidayIssues++;
        }
      } else {
        console.log(`  ✅ ${holiday.name}: No lessons`);
      }
    }

    if (holidayIssues > 0) {
      issues.push(`${holidayIssues} holiday conflicts`);
      perfectScore -= 5 * holidayIssues;
    }

    // PD Day check
    const pdDays = [
      { date: new Date(2025, 9, 17), name: 'October PD Day' },
      { date: new Date(2025, 10, 7), name: 'November PD Day' }
    ];

    let pdDayLessons = 0;
    for (const pdDay of pdDays) {
      const pdLessons = allLessons.filter(l => 
        l.date.toDateString() === pdDay.date.toDateString()
      );
      
      if (pdLessons.length === 0) {
        console.log(`  ✅ ${pdDay.name}: Clear`);
      } else {
        console.log(`  ❌ ${pdDay.name}: ${pdLessons.length} lessons`);
        pdDayLessons += pdLessons.length;
      }
    }

    if (pdDayLessons === 0) {
      strengths.push('All PD days properly cleared');
    } else {
      issues.push(`${pdDayLessons} lessons on PD days`);
      perfectScore -= 5;
    }

    // === 2. WORKLOAD BALANCE CHECK ===
    console.log('\n⚖️ WORKLOAD BALANCE CHECK:');
    
    const dailyLoads = new Map<string, number>();
    allLessons.forEach(lesson => {
      const dateStr = lesson.date.toDateString();
      dailyLoads.set(dateStr, (dailyLoads.get(dateStr) || 0) + 1);
    });

    const maxLoad = Math.max(...Array.from(dailyLoads.values()));
    const avgLoad = (allLessons.length / dailyLoads.size).toFixed(2);
    
    console.log(`  Daily load range: 1-${maxLoad} lessons`);
    console.log(`  Average daily load: ${avgLoad} lessons`);
    
    const overloadedDays = Array.from(dailyLoads.entries())
      .filter(([_, count]) => count > 6)
      .map(([date, count]) => `${date}: ${count}`);

    if (overloadedDays.length === 0) {
      console.log('  ✅ No overloaded days (all ≤6 lessons)');
      strengths.push('Perfect workload balance');
    } else {
      console.log(`  ❌ ${overloadedDays.length} overloaded days`);
      overloadedDays.forEach(day => console.log(`    - ${day}`));
      issues.push(`${overloadedDays.length} overloaded days`);
      perfectScore -= 10;
    }

    // === 3. SUBJECT COVERAGE CHECK ===
    console.log('\n📚 SUBJECT COVERAGE CHECK:');
    
    const subjectCounts: Record<string, number> = {};
    allLessons.forEach(lesson => {
      subjectCounts[lesson.subject] = (subjectCounts[lesson.subject] || 0) + 1;
    });

    const expectedSubjects = [
      'Français langue première',
      'Mathématiques',
      'Sciences de la nature',
      'Arts visuels',
      'Éducation physique',
      'Music'
    ];

    let missingSubjects = 0;
    expectedSubjects.forEach(subject => {
      const count = subjectCounts[subject] || 0;
      if (count === 0) {
        console.log(`  ❌ ${subject}: MISSING`);
        missingSubjects++;
      } else if (count < 8) {
        console.log(`  ⚠️ ${subject}: ${count} lessons (low)`);
      } else {
        console.log(`  ✅ ${subject}: ${count} lessons`);
      }
    });

    if (missingSubjects === 0) {
      strengths.push('All subjects fully covered');
    } else {
      issues.push(`${missingSubjects} subjects missing`);
      perfectScore -= 15 * missingSubjects;
    }

    // === 4. LESSON QUALITY CHECK ===
    console.log('\n🎓 LESSON QUALITY CHECK:');
    
    let qualityIssues = 0;
    allLessons.forEach(lesson => {
      if (!lesson.mindsOn || lesson.mindsOn.length < 10) qualityIssues++;
      else if (!lesson.action || lesson.action.length < 20) qualityIssues++;
      else if (!lesson.consolidation || lesson.consolidation.length < 10) qualityIssues++;
      else if (!lesson.learningGoals || lesson.learningGoals.length < 20) qualityIssues++;
      else if (!lesson.materials) qualityIssues++;
      else if (!lesson.differentiationStrategies) qualityIssues++;
    });

    const qualityPercentage = Math.round(((allLessons.length - qualityIssues) / allLessons.length) * 100);
    console.log(`  Lesson quality: ${qualityPercentage}% complete`);
    
    if (qualityPercentage === 100) {
      console.log('  ✅ All lessons have complete ETFO structure');
      strengths.push('100% complete lesson quality');
    } else if (qualityPercentage >= 95) {
      console.log('  ✅ Excellent lesson quality');
      strengths.push('Excellent lesson quality');
    } else {
      console.log(`  ⚠️ ${qualityIssues} lessons need improvement`);
      issues.push(`${qualityIssues} incomplete lessons`);
      perfectScore -= 5;
    }

    // === 5. THEMATIC FLOW CHECK ===
    console.log('\n🎨 THEMATIC FLOW CHECK:');
    
    const septemberTheme = allLessons.filter(l => 
      l.date.getMonth() === 8 && 
      (l.titleFr?.includes('école') || l.titleFr?.includes('classe'))
    ).length;
    
    const octoberTheme = allLessons.filter(l => 
      l.date.getMonth() === 9 && 
      (l.titleFr?.includes('famille') || l.titleFr?.includes('familial'))
    ).length;
    
    const novemberTheme = allLessons.filter(l => 
      l.date.getMonth() === 10 && 
      (l.titleFr?.includes('automne') || l.titleFr?.includes('novembre'))
    ).length;
    
    const decemberTheme = allLessons.filter(l => 
      l.date.getMonth() === 11 && 
      (l.titleFr?.includes('hiver') || l.titleFr?.includes('décembre') || l.titleFr?.includes('Noël'))
    ).length;

    console.log(`  September (school theme): ${septemberTheme} lessons`);
    console.log(`  October (family theme): ${octoberTheme} lessons`);
    console.log(`  November (fall theme): ${novemberTheme} lessons`);
    console.log(`  December (winter theme): ${decemberTheme} lessons`);
    
    if (septemberTheme > 5 && octoberTheme > 5 && novemberTheme > 3 && decemberTheme > 3) {
      console.log('  ✅ Strong thematic consistency');
      strengths.push('Excellent thematic progression');
    } else {
      console.log('  ⚠️ Thematic flow could be stronger');
    }

    // === 6. FRENCH INTEGRATION CHECK ===
    console.log('\n🇫🇷 FRENCH INTEGRATION CHECK:');
    
    const frenchLessons = allLessons.filter(l => l.subject === 'Français langue première');
    const frenchPercentage = Math.round((frenchLessons.length / allLessons.length) * 100);
    
    const nonFrenchWithIntegration = allLessons.filter(l => 
      l.subject !== 'Français langue première' &&
      l.subject !== 'Éducation physique' &&
      l.subject !== 'Music' &&
      (l.learningGoals?.includes('vocabulaire') || 
       l.learningGoals?.includes('français') ||
       l.learningGoals?.includes('French'))
    );
    
    const integrationPercentage = Math.round((nonFrenchWithIntegration.length / 
      allLessons.filter(l => l.subject !== 'Français langue première' && 
                            l.subject !== 'Éducation physique' && 
                            l.subject !== 'Music').length) * 100);
    
    console.log(`  French lessons: ${frenchPercentage}% of total`);
    console.log(`  French integration in core subjects: ${integrationPercentage}%`);
    
    if (frenchPercentage >= 25 && integrationPercentage >= 80) {
      console.log('  ✅ Excellent French immersion coverage');
      strengths.push('Strong French immersion integration');
    } else {
      console.log('  ⚠️ French integration could be improved');
    }

    // === 7. DATA INTEGRITY CHECK ===
    console.log('\n🔧 DATA INTEGRITY CHECK:');
    
    const orphanedLessons = allLessons.filter(l => !l.unitPlanId);
    const duplicateCheck = new Map<string, number>();
    allLessons.forEach(lesson => {
      const key = `${lesson.date.toDateString()}-${lesson.subject}-${lesson.title}`;
      duplicateCheck.set(key, (duplicateCheck.get(key) || 0) + 1);
    });
    
    const duplicates = Array.from(duplicateCheck.entries())
      .filter(([_, count]) => count > 1);
    
    console.log(`  Orphaned lessons: ${orphanedLessons.length}`);
    console.log(`  Duplicate lessons: ${duplicates.length}`);
    
    if (orphanedLessons.length === 0 && duplicates.length === 0) {
      console.log('  ✅ Perfect data integrity');
      strengths.push('Perfect data integrity');
    } else {
      if (orphanedLessons.length > 0) issues.push(`${orphanedLessons.length} orphaned lessons`);
      if (duplicates.length > 0) issues.push(`${duplicates.length} duplicate lessons`);
      perfectScore -= 5;
    }

    // === FINAL PERFECTION SCORE ===
    console.log('\n' + '='.repeat(60));
    console.log('🏆 FINAL PERFECTION ASSESSMENT');
    console.log('='.repeat(60) + '\n');

    console.log(`PERFECTION SCORE: ${perfectScore}/100\n`);

    if (strengths.length > 0) {
      console.log('✅ SYSTEM STRENGTHS:');
      strengths.forEach(strength => console.log(`   • ${strength}`));
    }

    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }

    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`   • Total lessons: ${allLessons.length}`);
    console.log(`   • Teaching days: ${dailyLoads.size}`);
    console.log(`   • Average daily load: ${avgLoad} lessons`);
    console.log(`   • Subject variety: ${Object.keys(subjectCounts).length} subjects`);
    console.log(`   • Quality rating: ${qualityPercentage}%`);

    console.log('\n🎯 FINAL VERDICT:');
    if (perfectScore === 100) {
      console.log('🌟 ABSOLUTE PERFECTION ACHIEVED! 🌟');
      console.log('The Teaching Engine 2.0 is flawless and ready for implementation!');
    } else if (perfectScore >= 95) {
      console.log('🏆 NEAR PERFECTION - PROFESSIONAL EXCELLENCE!');
      console.log('The system is exceptional and ready for use!');
    } else if (perfectScore >= 90) {
      console.log('✅ EXCELLENT SYSTEM - Minor improvements optional');
    } else if (perfectScore >= 80) {
      console.log('👍 GOOD SYSTEM - Some improvements recommended');
    } else {
      console.log('⚠️ SYSTEM NEEDS ATTENTION - Address issues before implementation');
    }

    return perfectScore;

  } catch (error) {
    console.error('❌ Error during perfection check:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

finalPerfectionCheck()
  .then((score) => {
    console.log(`\n✅ Final perfection check complete! Score: ${score}/100`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Perfection check failed:', error);
    process.exit(1);
  });