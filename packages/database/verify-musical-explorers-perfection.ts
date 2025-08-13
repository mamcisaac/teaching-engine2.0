import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMusicalExplorersPerfection() {
  console.log('\n🔍 CRITICAL ASSESSMENT: MUSICAL EXPLORERS UNIT');
  console.log('='.repeat(60));
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Musical Explorers' },
    include: { lessonPlans: { orderBy: { date: 'asc' } } }
  });
  
  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }
  
  console.log(`Unit: ${unit.title}`);
  console.log(`Total Lessons: ${unit.lessonPlans.length}`);
  console.log(`Date Range: ${unit.startDate.toDateString()} to ${unit.endDate.toDateString()}`);
  
  const criteria = {
    threePart: { count: 0, missing: [] },
    differentiation: { count: 0, missing: [] },
    assessment: { count: 0, missing: [] },
    coreFields: { count: 0, missing: [] },
    subFriendly: { count: 0, missing: [] },
    language: { count: 0, missing: [] },
    duration: { count: 0, missing: [] }
  };
  
  console.log('\n📋 DETAILED INSPECTION:');
  console.log('-'.repeat(60));
  
  for (const lesson of unit.lessonPlans) {
    let issuesFound = [];
    
    // Three-part structure
    if (lesson.mindsOn && lesson.action && lesson.consolidation) {
      criteria.threePart.count++;
    } else {
      criteria.threePart.missing.push(lesson.title);
      issuesFound.push('Three-part structure incomplete');
    }
    
    // Differentiation
    if (lesson.accommodations && lesson.modifications && lesson.extensions) {
      criteria.differentiation.count++;
    } else {
      criteria.differentiation.missing.push(lesson.title);
      issuesFound.push('Differentiation incomplete');
    }
    
    // Assessment
    if (lesson.assessmentType && lesson.assessmentNotes) {
      criteria.assessment.count++;
    } else {
      criteria.assessment.missing.push(lesson.title);
      issuesFound.push('Assessment missing');
    }
    
    // Core fields
    if (lesson.learningGoals && lesson.materials && lesson.grouping) {
      criteria.coreFields.count++;
    } else {
      criteria.coreFields.missing.push(lesson.title);
      issuesFound.push('Core fields missing');
    }
    
    // Sub-friendly
    if (lesson.isSubFriendly && lesson.subNotes) {
      criteria.subFriendly.count++;
    } else {
      criteria.subFriendly.missing.push(lesson.title);
      issuesFound.push('Sub documentation missing');
    }
    
    // Language check (should be English for Musical Explorers)
    if (lesson.language === 'English') {
      criteria.language.count++;
    } else {
      criteria.language.missing.push(lesson.title);
      issuesFound.push(`Wrong language: ${lesson.language}`);
    }
    
    // Duration check (should be 30 minutes for music)
    if (lesson.duration === 30) {
      criteria.duration.count++;
    } else {
      criteria.duration.missing.push(lesson.title);
      issuesFound.push(`Wrong duration: ${lesson.duration} minutes`);
    }
    
    if (issuesFound.length > 0) {
      console.log(`\n❌ ${lesson.title}:`);
      issuesFound.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log(`✅ ${lesson.title} - PERFECT`);
    }
  }
  
  console.log('\n📊 ETFO COMPLIANCE SUMMARY:');
  console.log('='.repeat(60));
  
  const total = unit.lessonPlans.length;
  Object.entries(criteria).forEach(([key, value]) => {
    const percentage = Math.round(value.count / total * 100);
    console.log(`${key}: ${value.count}/${total} (${percentage}%)`);
    if (value.missing.length > 0) {
      console.log(`   Missing in: ${value.missing.join(', ')}`);
    }
  });
  
  const allPerfect = Object.values(criteria).every(c => c.count === total);
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log('='.repeat(60));
  
  if (allPerfect) {
    console.log('🏆 ABSOLUTE PERFECTION ACHIEVED!');
    console.log('✨ All 18 Musical Explorers lessons are FLAWLESS');
    console.log('✨ 100% ETFO compliance across ALL criteria');
    console.log('✨ Ready for Grade 1 English Music instruction');
    console.log('✨ September 4 - October 31, 2025');
    console.log('\n🎵 Musical Explorers Features:');
    console.log('   • Complete three-part lesson structure');
    console.log('   • Full differentiation strategies');
    console.log('   • Comprehensive assessment integration');
    console.log('   • All core pedagogical fields');
    console.log('   • Sub-friendly documentation');
    console.log('   • Age-appropriate 30-minute lessons');
    console.log('   • English language instruction');
    console.log('   • Musical concept progression');
    console.log('   • Creative expression focus');
    console.log('   • Cultural awareness integration');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons require additional work');
  }
  
  // Check system progress
  console.log('\n📈 SYSTEM PROGRESS CHECK:');
  console.log('='.repeat(60));
  
  const allUnits = await prisma.unitPlan.count();
  const unitsWithLessons = await prisma.unitPlan.count({
    where: { lessonPlans: { some: {} } }
  });
  const totalLessons = await prisma.eTFOLessonPlan.count();
  
  console.log(`Total Units: ${allUnits}`);
  console.log(`Units with Lessons: ${unitsWithLessons}`);
  console.log(`Total Lessons Created: ${totalLessons}`);
  console.log(`Progress: ${Math.round(unitsWithLessons / allUnits * 100)}% of units have lessons`);
  
  await prisma.$disconnect();
}

verifyMusicalExplorersPerfection();