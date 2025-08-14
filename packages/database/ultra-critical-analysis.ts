import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultraCriticalAnalysis() {
  console.log('🔬 ULTRA-CRITICAL SYSTEM ANALYSIS - FINDING ALL IMPERFECTIONS');
  console.log('='.repeat(70));
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  const units = await prisma.unitPlan.findMany({
    include: { 
      lessonPlans: true,
      expectations: { include: { expectation: true } }
    }
  });
  
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 }
  });
  
  const users = await prisma.user.findMany();
  const longRangePlans = await prisma.longRangePlan.findMany();
  
  const imperfections: string[] = [];
  
  // 1. Check lesson distribution by day of week
  console.log('\n📅 LESSON DISTRIBUTION BY DAY OF WEEK');
  const dayDistribution = new Map();
  lessons.forEach(lesson => {
    const day = lesson.date.getDay();
    dayDistribution.set(day, (dayDistribution.get(day) || 0) + 1);
  });
  
  Array.from(dayDistribution.entries()).sort((a, b) => a[0] - b[0]).forEach(([day, count]) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    console.log(`${dayName}: ${count} lessons`);
    if (day === 0 || day === 6) {
      imperfections.push(`Weekend lessons still exist: ${count} on ${dayName}`);
    }
  });
  
  // 2. Check for duplicate lesson titles
  console.log('\n📝 DUPLICATE LESSON TITLES');
  const titleCounts = new Map();
  lessons.forEach(lesson => {
    titleCounts.set(lesson.title, (titleCounts.get(lesson.title) || 0) + 1);
  });
  
  let duplicates = 0;
  const duplicateTitles: string[] = [];
  titleCounts.forEach((count, title) => {
    if (count > 1) {
      duplicates++;
      if (duplicateTitles.length < 5) {
        duplicateTitles.push(`"${title}" (${count} times)`);
      }
    }
  });
  console.log(`Duplicate titles found: ${duplicates}`);
  if (duplicateTitles.length > 0) {
    console.log('Examples:', duplicateTitles.join(', '));
  }
  if (duplicates > 0) {
    imperfections.push(`Duplicate lesson titles: ${duplicates}`);
  }
  
  // 3. Check lesson duration consistency
  console.log('\n⏱️ LESSON DURATION ANALYSIS');
  const durations = lessons.map(l => l.duration);
  const uniqueDurations = [...new Set(durations)];
  console.log(`Unique durations: ${uniqueDurations.sort((a, b) => a - b).join(', ')}`);
  
  const tooShort = lessons.filter(l => l.duration < 30).length;
  const tooLong = lessons.filter(l => l.duration > 60).length;
  const oddDurations = lessons.filter(l => l.duration % 5 !== 0).length;
  
  if (tooShort > 0) imperfections.push(`Lessons too short (<30 min): ${tooShort}`);
  if (tooLong > 0) imperfections.push(`Lessons too long (>60 min): ${tooLong}`);
  if (oddDurations > 0) imperfections.push(`Lessons with odd durations (not multiple of 5): ${oddDurations}`);
  
  // 4. Check for missing or weak content
  console.log('\n📚 CONTENT QUALITY ANALYSIS');
  let weakMindsOn = 0;
  let weakAction = 0;
  let weakConsolidation = 0;
  let missingGoals = 0;
  let missingMaterials = 0;
  let genericAccommodations = 0;
  
  lessons.forEach(lesson => {
    if (!lesson.mindsOn || lesson.mindsOn.length < 50) weakMindsOn++;
    if (!lesson.action || lesson.action.length < 100) weakAction++;
    if (!lesson.consolidation || lesson.consolidation.length < 50) weakConsolidation++;
    if (!lesson.learningGoals || lesson.learningGoals.length < 20) missingGoals++;
    if (!lesson.materials || (typeof lesson.materials === 'string' && lesson.materials.length < 10)) missingMaterials++;
    
    // Check for generic/copy-pasted accommodations
    if (lesson.accommodations && typeof lesson.accommodations === 'string' && lesson.accommodations.includes('[object Object]')) {
      genericAccommodations++;
    } else if (lesson.accommodations && typeof lesson.accommodations === 'object') {
      genericAccommodations++;
    }
  });
  
  console.log(`Weak Minds On: ${weakMindsOn}`);
  console.log(`Weak Action: ${weakAction}`);
  console.log(`Weak Consolidation: ${weakConsolidation}`);
  console.log(`Missing Goals: ${missingGoals}`);
  console.log(`Missing Materials: ${missingMaterials}`);
  console.log(`Generic Accommodations: ${genericAccommodations}`);
  
  if (weakMindsOn > 0) imperfections.push(`Weak Minds On sections: ${weakMindsOn}`);
  if (weakAction > 0) imperfections.push(`Weak Action sections: ${weakAction}`);
  if (weakConsolidation > 0) imperfections.push(`Weak Consolidation sections: ${weakConsolidation}`);
  if (missingGoals > 0) imperfections.push(`Missing learning goals: ${missingGoals}`);
  if (missingMaterials > 0) imperfections.push(`Missing materials: ${missingMaterials}`);
  if (genericAccommodations > 0) imperfections.push(`Generic accommodations (copy-pasted): ${genericAccommodations}`);
  
  // 5. Check unit-expectation mapping
  console.log('\n🎯 CURRICULUM MAPPING ANALYSIS');
  const unitsWithoutExpectations = units.filter(u => u.expectations.length === 0);
  const unmappedExpectations = expectations.filter(e => {
    return !units.some(u => u.expectations.some(ue => ue.expectationId === e.id));
  });
  
  console.log(`Units without expectations: ${unitsWithoutExpectations.length}`);
  if (unitsWithoutExpectations.length > 0) {
    console.log('Units missing curriculum mapping:');
    unitsWithoutExpectations.slice(0, 5).forEach(u => {
      console.log(`  - ${u.title}`);
    });
  }
  
  console.log(`Unmapped expectations: ${unmappedExpectations.length}`);
  if (unmappedExpectations.length > 0) {
    console.log('Expectations not covered:');
    unmappedExpectations.slice(0, 5).forEach(e => {
      console.log(`  - ${e.code}: ${e.description?.substring(0, 50)}...`);
    });
  }
  
  if (unitsWithoutExpectations.length > 0) {
    imperfections.push(`Units without curriculum mapping: ${unitsWithoutExpectations.length}`);
  }
  if (unmappedExpectations.length > 0) {
    imperfections.push(`Curriculum expectations not covered: ${unmappedExpectations.length}`);
  }
  
  // 6. Check date sequencing and gaps
  console.log('\n📆 DATE SEQUENCING ANALYSIS');
  let dateIssues = 0;
  let largeGaps = 0;
  let sameDay = 0;
  
  for (let i = 1; i < lessons.length; i++) {
    const diff = lessons[i].date.getTime() - lessons[i-1].date.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    
    if (diff < 0) {
      dateIssues++;
    }
    if (daysDiff > 14) {
      largeGaps++;
    }
    if (daysDiff === 0) {
      sameDay++;
    }
  }
  
  // Check for lessons outside school year
  const beforeSchool = lessons.filter(l => l.date < new Date('2025-09-01')).length;
  const afterSchool = lessons.filter(l => l.date > new Date('2026-06-30')).length;
  const summerLessons = lessons.filter(l => {
    const month = l.date.getMonth();
    return month === 6 || month === 7; // July or August
  }).length;
  
  console.log(`Lessons out of order: ${dateIssues}`);
  console.log(`Large gaps (>14 days): ${largeGaps}`);
  console.log(`Multiple lessons same day: ${sameDay}`);
  console.log(`Before school year: ${beforeSchool}`);
  console.log(`After school year: ${afterSchool}`);
  console.log(`During summer: ${summerLessons}`);
  
  if (dateIssues > 0) imperfections.push(`Lessons out of chronological order: ${dateIssues}`);
  if (largeGaps > 0) imperfections.push(`Large gaps between lessons (>14 days): ${largeGaps}`);
  if (beforeSchool > 0) imperfections.push(`Lessons before school year: ${beforeSchool}`);
  if (afterSchool > 0) imperfections.push(`Lessons after school year: ${afterSchool}`);
  if (summerLessons > 0) imperfections.push(`Lessons during summer vacation: ${summerLessons}`);
  
  // 7. Check assessment balance and variety
  console.log('\n📊 ASSESSMENT BALANCE');
  const assessmentTypes = new Map();
  lessons.forEach(l => {
    assessmentTypes.set(l.assessmentType, (assessmentTypes.get(l.assessmentType) || 0) + 1);
  });
  
  const assessmentCount = assessmentTypes.size;
  console.log(`Different assessment types: ${assessmentCount}`);
  
  // Check for proper distribution
  const formativeCount = assessmentTypes.get('Formative') || 0;
  const summativeCount = assessmentTypes.get('Sommative') || 0;
  const diagnosticCount = assessmentTypes.get('Diagnostique') || 0;
  
  const formativePercent = (formativeCount / lessons.length * 100).toFixed(1);
  const summativePercent = (summativeCount / lessons.length * 100).toFixed(1);
  
  console.log(`Formative: ${formativeCount} (${formativePercent}%)`);
  console.log(`Sommative: ${summativeCount} (${summativePercent}%)`);
  console.log(`Diagnostique: ${diagnosticCount}`);
  
  if (assessmentCount > 5) imperfections.push(`Too many assessment type variations: ${assessmentCount}`);
  if (parseFloat(formativePercent) < 60) imperfections.push(`Too few formative assessments: ${formativePercent}%`);
  if (parseFloat(summativePercent) < 10) imperfections.push(`Too few summative assessments: ${summativePercent}%`);
  if (diagnosticCount < units.length) imperfections.push(`Not enough diagnostic assessments (${diagnosticCount} for ${units.length} units)`);
  
  // 8. Check language consistency and French immersion compliance
  console.log('\n🇫🇷 LANGUAGE CONSISTENCY');
  let mixedLanguage = 0;
  let englishOnly = 0;
  let frenchOnly = 0;
  
  lessons.forEach(lesson => {
    const content = ((lesson.mindsOn || '') + ' ' + (lesson.action || '') + ' ' + (lesson.consolidation || '')).toLowerCase();
    const hasFrench = /[àâäæçéèêëïîôùûüÿœ]/.test(content) || content.includes('français');
    const hasEnglish = /\b(the|and|or|but|with|for|this|that|have|from|will|can|should)\b/.test(content);
    
    if (hasFrench && hasEnglish) {
      mixedLanguage++;
    } else if (hasEnglish && !hasFrench) {
      englishOnly++;
    } else if (hasFrench && !hasEnglish) {
      frenchOnly++;
    }
  });
  
  const frenchPercent = ((frenchOnly + mixedLanguage) / lessons.length * 100).toFixed(1);
  console.log(`French only: ${frenchOnly}`);
  console.log(`English only: ${englishOnly}`);
  console.log(`Mixed language: ${mixedLanguage}`);
  console.log(`French content: ${frenchPercent}%`);
  
  if (mixedLanguage > 50) imperfections.push(`Too many mixed language lessons: ${mixedLanguage}`);
  if (parseFloat(frenchPercent) < 80) imperfections.push(`Insufficient French content for immersion: ${frenchPercent}%`);
  
  // 9. Check unit balance and progression
  console.log('\n⚖️ UNIT BALANCE');
  const lessonCounts = units.map(u => ({
    title: u.title,
    count: u.lessonPlans.length,
    start: u.startDate,
    end: u.endDate
  }));
  
  const minLessons = Math.min(...lessonCounts.map(u => u.count));
  const maxLessons = Math.max(...lessonCounts.map(u => u.count));
  const avgLessons = lessonCounts.reduce((a, b) => a + b.count, 0) / lessonCounts.length;
  
  console.log(`Lessons per unit: min=${minLessons}, avg=${avgLessons.toFixed(1)}, max=${maxLessons}`);
  
  const unbalanced = units.filter(u => u.lessonPlans.length < 15 || u.lessonPlans.length > 25);
  const emptyUnits = units.filter(u => u.lessonPlans.length === 0);
  
  if (unbalanced.length > 0) {
    console.log('Unbalanced units:');
    unbalanced.slice(0, 5).forEach(u => {
      console.log(`  - ${u.title}: ${u.lessonPlans.length} lessons`);
    });
    imperfections.push(`Unbalanced units (<15 or >25 lessons): ${unbalanced.length}`);
  }
  
  if (emptyUnits.length > 0) {
    imperfections.push(`Empty units with no lessons: ${emptyUnits.length}`);
  }
  
  // 10. Check for data integrity issues
  console.log('\n🔗 DATA INTEGRITY');
  const orphanedLessons = lessons.filter(l => !l.unitPlan).length;
  const lessonsWithoutUser = lessons.filter(l => !l.userId).length;
  const unitsWithoutLRP = units.filter(u => !u.longRangePlanId).length;
  const unitsWithoutDates = units.filter(u => !u.startDate || !u.endDate).length;
  
  // Check for materials field issues
  let materialTypeIssues = 0;
  lessons.forEach(lesson => {
    if (lesson.materials && typeof lesson.materials !== 'string') {
      materialTypeIssues++;
    }
  });
  
  console.log(`Orphaned lessons: ${orphanedLessons}`);
  console.log(`Lessons without user: ${lessonsWithoutUser}`);
  console.log(`Units without long range plan: ${unitsWithoutLRP}`);
  console.log(`Units without dates: ${unitsWithoutDates}`);
  console.log(`Material field type issues: ${materialTypeIssues}`);
  
  if (orphanedLessons > 0) imperfections.push(`Orphaned lessons: ${orphanedLessons}`);
  if (lessonsWithoutUser > 0) imperfections.push(`Lessons without user: ${lessonsWithoutUser}`);
  if (unitsWithoutLRP > 0) imperfections.push(`Units without long range plan: ${unitsWithoutLRP}`);
  if (unitsWithoutDates > 0) imperfections.push(`Units without proper dates: ${unitsWithoutDates}`);
  if (materialTypeIssues > 0) imperfections.push(`Material field type errors: ${materialTypeIssues}`);
  
  // 11. Check subject distribution
  console.log('\n📚 SUBJECT DISTRIBUTION');
  const subjectKeywords = {
    'Français': ['français', 'lecture', 'écriture', 'vocabulaire', 'grammaire'],
    'Mathématiques': ['math', 'nombre', 'calcul', 'géométrie', 'mesure'],
    'Sciences': ['science', 'expérience', 'observation', 'hypothèse', 'nature'],
    'Études sociales': ['communauté', 'société', 'géographie', 'histoire', 'culture'],
    'Arts': ['art', 'musique', 'danse', 'théâtre', 'créatif', 'dessin'],
    'Éducation physique': ['physique', 'mouvement', 'sport', 'exercice', 'motricité']
  };
  
  const subjectCounts = new Map();
  Object.keys(subjectKeywords).forEach(s => subjectCounts.set(s, 0));
  
  lessons.forEach(lesson => {
    const content = ((lesson.title || '') + ' ' + (lesson.learningGoals || '') + ' ' + (lesson.action || '')).toLowerCase();
    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        subjectCounts.set(subject, subjectCounts.get(subject) + 1);
      }
    });
  });
  
  console.log('Subject representation:');
  subjectCounts.forEach((count, subject) => {
    const percent = (count / lessons.length * 100).toFixed(1);
    console.log(`  ${subject}: ${count} lessons (${percent}%)`);
    
    // Check for imbalances
    if (subject === 'Français' && parseFloat(percent) < 25) {
      imperfections.push(`Insufficient Français coverage: ${percent}%`);
    }
    if (subject === 'Mathématiques' && parseFloat(percent) < 20) {
      imperfections.push(`Insufficient Math coverage: ${percent}%`);
    }
    if (subject === 'Arts' && parseFloat(percent) > 30) {
      imperfections.push(`Excessive Arts coverage: ${percent}%`);
    }
  });
  
  // 12. Check for substitute teacher readiness
  console.log('\n👩‍🏫 SUBSTITUTE TEACHER READINESS');
  const notSubFriendly = lessons.filter(l => !l.isSubFriendly).length;
  const subFriendlyNoNotes = lessons.filter(l => l.isSubFriendly && (!l.subNotes || l.subNotes.length < 20)).length;
  
  console.log(`Not sub-friendly: ${notSubFriendly}`);
  console.log(`Sub-friendly without adequate notes: ${subFriendlyNoNotes}`);
  
  const subFriendlyPercent = ((lessons.length - notSubFriendly) / lessons.length * 100).toFixed(1);
  if (parseFloat(subFriendlyPercent) < 80) {
    imperfections.push(`Too few sub-friendly lessons: ${subFriendlyPercent}%`);
  }
  if (subFriendlyNoNotes > 10) {
    imperfections.push(`Sub-friendly lessons lacking notes: ${subFriendlyNoNotes}`);
  }
  
  // FINAL SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('🚨 TOTAL IMPERFECTIONS FOUND: ' + imperfections.length);
  
  if (imperfections.length === 0) {
    console.log('\n✅ SYSTEM IS PERFECT! No imperfections found.');
  } else {
    console.log('\n❌ All Imperfections:');
    imperfections.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    // Categorize severity
    const critical = imperfections.filter(i => 
      i.includes('Units without curriculum') || 
      i.includes('Weekend lessons') ||
      i.includes('Material field type errors')
    );
    
    const major = imperfections.filter(i => 
      i.includes('Insufficient French') ||
      i.includes('expectations not covered') ||
      i.includes('Unbalanced units')
    );
    
    const minor = imperfections.filter(i => 
      !critical.includes(i) && !major.includes(i)
    );
    
    console.log(`\n🔴 Critical Issues: ${critical.length}`);
    console.log(`🟠 Major Issues: ${major.length}`);
    console.log(`🟡 Minor Issues: ${minor.length}`);
  }
  
  await prisma.$disconnect();
}

ultraCriticalAnalysis().catch(console.error);