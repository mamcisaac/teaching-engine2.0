import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSystemCheck() {
  console.log('🔍 COMPREHENSIVE SYSTEM VERIFICATION');
  console.log('='.repeat(70));
  
  // 1. Get all units and lessons
  const units = await prisma.unitPlan.findMany({
    include: { 
      lessonPlans: true,
      _count: { select: { lessonPlans: true } }
    },
    orderBy: { startDate: 'asc' }
  });
  
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true }
  });
  
  // 2. System Overview
  console.log('\n📊 SYSTEM OVERVIEW:');
  console.log('Total Units:', units.length);
  console.log('Total Lessons:', allLessons.length);
  console.log('Units with lessons:', units.filter(u => u._count.lessonPlans > 0).length);
  console.log('Units without lessons:', units.filter(u => u._count.lessonPlans === 0).length);
  
  // 3. ETFO Compliance Check
  console.log('\n✅ ETFO COMPLIANCE ANALYSIS:');
  let perfectLessons = 0;
  let issuesFound = [];
  
  for (const lesson of allLessons) {
    const missingFields = [];
    
    if (!lesson.mindsOn) missingFields.push('mindsOn');
    if (!lesson.action) missingFields.push('action');
    if (!lesson.consolidation) missingFields.push('consolidation');
    if (!lesson.accommodations) missingFields.push('accommodations');
    if (!lesson.modifications) missingFields.push('modifications');
    if (!lesson.extensions) missingFields.push('extensions');
    if (!lesson.assessmentType) missingFields.push('assessmentType');
    if (!lesson.assessmentNotes) missingFields.push('assessmentNotes');
    if (!lesson.learningGoals) missingFields.push('learningGoals');
    if (!lesson.materials) missingFields.push('materials');
    if (!lesson.grouping) missingFields.push('grouping');
    if (lesson.isSubFriendly === null || lesson.isSubFriendly === undefined) missingFields.push('isSubFriendly');
    if (!lesson.subNotes) missingFields.push('subNotes');
    
    if (missingFields.length === 0) {
      perfectLessons++;
    } else {
      issuesFound.push({
        lesson: lesson.title,
        unit: lesson.unitPlan?.title || 'Unknown',
        missing: missingFields
      });
    }
  }
  
  console.log('Perfect ETFO-compliant lessons:', perfectLessons + '/' + allLessons.length);
  console.log('Compliance Rate:', Math.round(perfectLessons/allLessons.length * 100) + '%');
  
  if (issuesFound.length > 0) {
    console.log('\n⚠️ LESSONS WITH ISSUES:');
    issuesFound.slice(0, 5).forEach(issue => {
      console.log('  -', issue.lesson, '(' + issue.unit + '):', issue.missing.join(', '));
    });
    if (issuesFound.length > 5) {
      console.log('  ... and', issuesFound.length - 5, 'more');
    }
  }
  
  // 4. Unit Coverage Analysis
  console.log('\n📚 UNIT COVERAGE ANALYSIS:');
  const unitsWithoutLessons = units.filter(u => u._count.lessonPlans === 0);
  if (unitsWithoutLessons.length === 0) {
    console.log('✅ ALL UNITS HAVE LESSONS!');
  } else {
    console.log('⚠️ Units without lessons:');
    unitsWithoutLessons.forEach(u => console.log('  -', u.title));
  }
  
  // 5. Lesson Distribution
  console.log('\n📈 LESSON DISTRIBUTION:');
  const avgLessonsPerUnit = Math.round(allLessons.length / units.length);
  console.log('Average lessons per unit:', avgLessonsPerUnit);
  const lessonCounts = units.map(u => u._count.lessonPlans);
  console.log('Minimum lessons in a unit:', Math.min(...lessonCounts));
  console.log('Maximum lessons in a unit:', Math.max(...lessonCounts));
  
  // 6. Subject Coverage
  console.log('\n📖 SUBJECT COVERAGE:');
  const subjects: Record<string, number> = {};
  allLessons.forEach(l => {
    subjects[l.subject] = (subjects[l.subject] || 0) + 1;
  });
  Object.entries(subjects).sort((a, b) => b[1] - a[1]).forEach(([subject, count]) => {
    console.log('  •', subject + ':', count, 'lessons');
  });
  
  // 7. Language Distribution
  console.log('\n🌐 LANGUAGE DISTRIBUTION:');
  const languages: Record<string, number> = {};
  allLessons.forEach(l => {
    languages[l.language] = (languages[l.language] || 0) + 1;
  });
  Object.entries(languages).forEach(([language, count]) => {
    console.log('  •', language + ':', count, 'lessons');
  });
  
  // 8. Assessment Types
  console.log('\n📝 ASSESSMENT TYPES:');
  const assessments: Record<string, number> = {};
  allLessons.forEach(l => {
    if (l.assessmentType) {
      assessments[l.assessmentType] = (assessments[l.assessmentType] || 0) + 1;
    }
  });
  Object.entries(assessments).forEach(([type, count]) => {
    console.log('  •', type + ':', count, 'lessons');
  });
  
  // 9. Date Coverage
  console.log('\n📅 DATE COVERAGE:');
  const dates = allLessons.map(l => l.date).filter(d => d !== null).sort((a, b) => a.getTime() - b.getTime());
  if (dates.length > 0) {
    console.log('Earliest lesson:', dates[0].toISOString().split('T')[0]);
    console.log('Latest lesson:', dates[dates.length - 1].toISOString().split('T')[0]);
    
    // Check for date gaps
    const months = new Set();
    dates.forEach(d => {
      months.add(d.toISOString().substring(0, 7));
    });
    console.log('Months covered:', months.size);
  }
  
  // 10. Units with most/least lessons
  console.log('\n📊 TOP UNITS BY LESSON COUNT:');
  const sortedUnits = units.sort((a, b) => b._count.lessonPlans - a._count.lessonPlans);
  console.log('Top 5 units:');
  sortedUnits.slice(0, 5).forEach(u => {
    console.log('  •', u.title + ':', u._count.lessonPlans, 'lessons');
  });
  
  // 11. Final Verdict
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FINAL SYSTEM VERDICT:');
  console.log('='.repeat(70));
  
  const isComplete = unitsWithoutLessons.length === 0;
  const isCompliant = perfectLessons === allLessons.length;
  
  if (isComplete && isCompliant) {
    console.log('');
    console.log('🏆🏆🏆 SYSTEM IS PERFECT! 🏆🏆🏆');
    console.log('');
    console.log('✨ 100% Unit Coverage - All', units.length, 'units have lessons');
    console.log('✨ 100% ETFO Compliance - All', allLessons.length, 'lessons are perfect');
    console.log('✨ Complete Grade 1 French Immersion curriculum');
    console.log('✨ Ready for deployment and use!');
    console.log('');
    console.log('🇫🇷 TEACHING ENGINE 2.0 - MISSION ACCOMPLISHED! 🇫🇷');
  } else {
    console.log('⚠️ SYSTEM NEEDS ATTENTION:');
    if (!isComplete) {
      console.log('  - Some units lack lessons');
      console.log('  - Units without lessons:', unitsWithoutLessons.map(u => u.title).join(', '));
    }
    if (!isCompliant) {
      console.log('  - Some lessons have compliance issues');
      console.log('  - Total issues found:', issuesFound.length);
    }
  }
  
  await prisma.$disconnect();
}

comprehensiveSystemCheck().catch(console.error);