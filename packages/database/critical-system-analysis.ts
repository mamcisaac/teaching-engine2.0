import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalAnalysis() {
  console.log('🔍 CRITICAL SYSTEM ANALYSIS - TEACHING ENGINE 2.0');
  console.log('='.repeat(70));
  
  // 1. Get all lessons with unit information
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  // 2. Get all units
  const units = await prisma.unitPlan.findMany({
    orderBy: { startDate: 'asc' }
  });
  
  console.log('\n📊 SYSTEM OVERVIEW');
  console.log('Total Units:', units.length);
  console.log('Total Lessons:', lessons.length);
  console.log('Average Lessons per Unit:', (lessons.length / units.length).toFixed(1));
  
  // 3. Check date distribution
  console.log('\n📅 DATE ANALYSIS');
  const monthCounts = new Map();
  const duplicateDates = new Map();
  
  lessons.forEach(lesson => {
    const month = lesson.date.toISOString().substring(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    
    const dateStr = lesson.date.toISOString().substring(0, 10);
    if (!duplicateDates.has(dateStr)) {
      duplicateDates.set(dateStr, []);
    }
    duplicateDates.get(dateStr).push(lesson.title);
  });
  
  console.log('Lessons by Month:');
  Array.from(monthCounts.entries()).sort().forEach(([month, count]) => {
    console.log(`  ${month}: ${count} lessons`);
  });
  
  // Find dates with multiple lessons
  const overloadedDates = Array.from(duplicateDates.entries())
    .filter(([_, titles]) => titles.length > 5);
  
  if (overloadedDates.length > 0) {
    console.log('\n⚠️  OVERLOADED DATES (>5 lessons):');
    overloadedDates.forEach(([date, titles]) => {
      console.log(`  ${date}: ${titles.length} lessons`);
    });
  }
  
  // 4. Check unit lesson distribution
  console.log('\n📚 UNIT ANALYSIS');
  const unitLessonCounts = new Map();
  lessons.forEach(lesson => {
    const unitTitle = lesson.unitPlan.title;
    unitLessonCounts.set(unitTitle, (unitLessonCounts.get(unitTitle) || 0) + 1);
  });
  
  const lessonStats = Array.from(unitLessonCounts.values());
  const minLessons = Math.min(...lessonStats);
  const maxLessons = Math.max(...lessonStats);
  
  console.log(`Lesson Distribution: ${minLessons} min, ${maxLessons} max`);
  
  // Units with extreme counts
  const extremeUnits = Array.from(unitLessonCounts.entries())
    .filter(([_, count]) => count < 10 || count > 30);
  
  if (extremeUnits.length > 0) {
    console.log('\n⚠️  UNITS WITH EXTREME LESSON COUNTS:');
    extremeUnits.forEach(([unit, count]) => {
      console.log(`  ${unit}: ${count} lessons`);
    });
  }
  
  // 5. Check field completeness
  console.log('\n✅ FIELD COMPLETENESS CHECK');
  let missingFields: any[] = [];
  lessons.forEach(lesson => {
    const issues = [];
    if (!lesson.mindsOn) issues.push('mindsOn');
    if (!lesson.action) issues.push('action');
    if (!lesson.consolidation) issues.push('consolidation');
    if (!lesson.materials) issues.push('materials');
    if (!lesson.assessmentType) issues.push('assessmentType');
    if (!lesson.learningGoals) issues.push('learningGoals');
    if (!lesson.accommodations) issues.push('accommodations');
    if (!lesson.modifications) issues.push('modifications');
    if (!lesson.extensions) issues.push('extensions');
    if (!lesson.grouping) issues.push('grouping');
    if (lesson.isSubFriendly === null) issues.push('isSubFriendly');
    if (!lesson.subNotes) issues.push('subNotes');
    
    if (issues.length > 0) {
      missingFields.push({ title: lesson.title, unit: lesson.unitPlan.title, issues });
    }
  });
  
  if (missingFields.length > 0) {
    console.log('⚠️  Lessons with missing fields:', missingFields.length);
    missingFields.slice(0, 3).forEach(lesson => {
      console.log(`  ${lesson.unit} - ${lesson.title}: Missing ${lesson.issues.join(', ')}`);
    });
  } else {
    console.log('✅ All lessons have complete ETFO fields!');
  }
  
  // 6. Check text quality
  console.log('\n📝 CONTENT QUALITY ANALYSIS');
  let shortContent = 0;
  let longContent = 0;
  let duplicateContent = new Set();
  const contentMap = new Map();
  
  lessons.forEach(lesson => {
    // Check for short content
    if (lesson.mindsOn && lesson.mindsOn.length < 50) shortContent++;
    if (lesson.action && lesson.action.length < 100) shortContent++;
    
    // Check for overly long content
    if (lesson.mindsOn && lesson.mindsOn.length > 1000) longContent++;
    if (lesson.action && lesson.action.length > 2000) longContent++;
    
    // Check for duplicate content
    const contentKey = lesson.mindsOn + lesson.action;
    if (contentMap.has(contentKey)) {
      duplicateContent.add(lesson.title);
      duplicateContent.add(contentMap.get(contentKey));
    } else {
      contentMap.set(contentKey, lesson.title);
    }
  });
  
  if (shortContent > 0) console.log(`⚠️  Lessons with potentially short content: ${shortContent}`);
  if (longContent > 0) console.log(`⚠️  Lessons with potentially long content: ${longContent}`);
  if (duplicateContent.size > 0) console.log(`⚠️  Potential duplicate content in ${duplicateContent.size} lessons`);
  
  // 7. Subject coverage analysis
  console.log('\n🎯 SUBJECT COVERAGE');
  const subjectKeywords = {
    'Français': ['français', 'lecture', 'écriture', 'communication'],
    'Mathématiques': ['math', 'nombre', 'calcul', 'géométrie'],
    'Sciences': ['science', 'expérience', 'observation', 'hypothèse'],
    'Études sociales': ['communauté', 'société', 'géographie', 'histoire'],
    'Arts': ['art', 'musique', 'danse', 'théâtre', 'créatif'],
    'Éducation physique': ['physique', 'mouvement', 'sport', 'exercice']
  };
  
  const subjectCoverage = new Map();
  Object.keys(subjectKeywords).forEach(subject => {
    subjectCoverage.set(subject, 0);
  });
  
  lessons.forEach(lesson => {
    const fullText = (lesson.title + ' ' + lesson.learningGoals + ' ' + lesson.action).toLowerCase();
    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        subjectCoverage.set(subject, subjectCoverage.get(subject) + 1);
      }
    });
  });
  
  console.log('Subject representation in lessons:');
  subjectCoverage.forEach((count, subject) => {
    const percentage = ((count / lessons.length) * 100).toFixed(1);
    console.log(`  ${subject}: ${count} lessons (${percentage}%)`);
  });
  
  // 8. Assessment variety check
  console.log('\n📊 ASSESSMENT VARIETY');
  const assessmentTypes = new Map();
  lessons.forEach(lesson => {
    if (lesson.assessmentType) {
      assessmentTypes.set(lesson.assessmentType, (assessmentTypes.get(lesson.assessmentType) || 0) + 1);
    }
  });
  
  console.log('Assessment types used:');
  assessmentTypes.forEach((count, type) => {
    console.log(`  ${type}: ${count} times`);
  });
  
  // 9. Materials analysis
  console.log('\n📦 MATERIALS ANALYSIS');
  const materialFrequency = new Map();
  lessons.forEach(lesson => {
    if (lesson.materials && typeof lesson.materials === 'string') {
      const items = lesson.materials.split(',').map(m => m.trim().toLowerCase());
      items.forEach(item => {
        if (item) {
          materialFrequency.set(item, (materialFrequency.get(item) || 0) + 1);
        }
      });
    }
  });
  
  const topMaterials = Array.from(materialFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('Top 10 most used materials:');
  topMaterials.forEach(([material, count]) => {
    console.log(`  ${material}: ${count} times`);
  });
  
  // 10. Date gaps analysis
  console.log('\n📅 DATE GAPS ANALYSIS');
  const sortedDates = lessons.map(l => l.date).sort((a, b) => a.getTime() - b.getTime());
  const gaps = [];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.round((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      gaps.push({
        from: sortedDates[i-1].toISOString().substring(0, 10),
        to: sortedDates[i].toISOString().substring(0, 10),
        days: diffDays
      });
    }
  }
  
  if (gaps.length > 0) {
    console.log('⚠️  Large gaps (>7 days) between lessons:');
    gaps.slice(0, 5).forEach(gap => {
      console.log(`  ${gap.from} to ${gap.to}: ${gap.days} days`);
    });
  }
  
  await prisma.$disconnect();
}

criticalAnalysis().catch(console.error);