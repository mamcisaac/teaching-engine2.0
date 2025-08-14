import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function pedagogicalQualityCheck() {
  console.log('🎓 PEDAGOGICAL QUALITY ANALYSIS');
  console.log('='.repeat(70));
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  const qualityIssues: string[] = [];
  
  // 1. DIFFERENTIATION QUALITY CHECK
  console.log('\n🎯 DIFFERENTIATION QUALITY ANALYSIS');
  console.log('-'.repeat(50));
  
  const genericDifferentiation = new Map();
  
  lessons.forEach(lesson => {
    // Check if accommodations, modifications, and extensions are generic
    const accommodations = lesson.accommodations || '';
    const modifications = lesson.modifications || '';
    const extensions = lesson.extensions || '';
    
    // Track duplicates
    const diffKey = accommodations + '|' + modifications + '|' + extensions;
    if (!genericDifferentiation.has(diffKey)) {
      genericDifferentiation.set(diffKey, []);
    }
    genericDifferentiation.get(diffKey).push(lesson.title);
  });
  
  // Find duplicate differentiation (copy-pasted)
  const duplicates = Array.from(genericDifferentiation.entries())
    .filter(([_, lessons]) => lessons.length > 5);
  
  if (duplicates.length > 0) {
    console.log(`❌ Found ${duplicates.length} sets of copy-pasted differentiation!`);
    duplicates.slice(0, 3).forEach(([key, lessons]) => {
      const parts = key.split('|');
      console.log(`\n   Duplicated ${lessons.length} times:`);
      console.log(`   Accommodations: "${parts[0].substring(0, 50)}..."`);
      qualityIssues.push(`Copy-pasted differentiation in ${lessons.length} lessons`);
    });
  }
  
  // 2. LEARNING GOALS ALIGNMENT
  console.log('\n🎯 LEARNING GOALS ALIGNMENT CHECK');
  console.log('-'.repeat(50));
  
  let vagueGoals = 0;
  let misalignedGoals = 0;
  
  lessons.forEach(lesson => {
    const goals = lesson.learningGoals || '';
    
    // Check for vague goals
    if (goals.length < 30 || 
        goals.includes('apprendre') && !goals.includes('comment') && !goals.includes('pourquoi')) {
      vagueGoals++;
    }
    
    // Check if goals align with activities
    const action = lesson.action || '';
    const goalsLower = goals.toLowerCase();
    const actionLower = action.toLowerCase();
    
    // Goals should relate to activities
    const goalWords = goalsLower.split(' ').filter(w => w.length > 4);
    const hasAlignment = goalWords.some(word => actionLower.includes(word));
    
    if (!hasAlignment && goals.length > 0 && action.length > 0) {
      misalignedGoals++;
    }
  });
  
  if (vagueGoals > 50) {
    console.log(`❌ ${vagueGoals} lessons have vague or minimal learning goals`);
    qualityIssues.push(`Vague learning goals: ${vagueGoals} lessons`);
  }
  
  if (misalignedGoals > 100) {
    console.log(`❌ ${misalignedGoals} lessons have goals that don't align with activities`);
    qualityIssues.push(`Misaligned goals/activities: ${misalignedGoals} lessons`);
  }
  
  // 3. THREE-PART LESSON STRUCTURE QUALITY
  console.log('\n📐 THREE-PART LESSON STRUCTURE ANALYSIS');
  console.log('-'.repeat(50));
  
  let poorMindsOn = 0;
  let poorAction = 0;
  let poorConsolidation = 0;
  
  lessons.forEach(lesson => {
    const mindsOn = lesson.mindsOn || '';
    const action = lesson.action || '';
    const consolidation = lesson.consolidation || '';
    
    // Minds On should activate prior knowledge or create interest
    if (mindsOn.length < 50 || !mindsOn.includes('?')) {
      poorMindsOn++;
    }
    
    // Action should be substantive and active
    if (action.length < 100 || !action.match(/\d\./)) {
      poorAction++;
    }
    
    // Consolidation should include reflection or sharing
    if (consolidation.length < 50 || 
        (!consolidation.includes('partage') && !consolidation.includes('réflex'))) {
      poorConsolidation++;
    }
  });
  
  if (poorMindsOn > 100) {
    console.log(`❌ ${poorMindsOn} lessons have weak Minds On sections`);
    qualityIssues.push(`Weak Minds On: ${poorMindsOn} lessons`);
  }
  
  if (poorAction > 100) {
    console.log(`❌ ${poorAction} lessons have weak Action sections`);
    qualityIssues.push(`Weak Action: ${poorAction} lessons`);
  }
  
  if (poorConsolidation > 100) {
    console.log(`❌ ${poorConsolidation} lessons have weak Consolidation sections`);
    qualityIssues.push(`Weak Consolidation: ${poorConsolidation} lessons`);
  }
  
  // 4. GROUPING VARIETY CHECK
  console.log('\n👥 GROUPING STRATEGIES ANALYSIS');
  console.log('-'.repeat(50));
  
  const groupingTypes = new Map();
  
  lessons.forEach(lesson => {
    const grouping = lesson.grouping || '';
    if (!groupingTypes.has(grouping)) {
      groupingTypes.set(grouping, 0);
    }
    groupingTypes.set(grouping, groupingTypes.get(grouping) + 1);
  });
  
  const overusedGrouping = Array.from(groupingTypes.entries())
    .filter(([_, count]) => count > 100);
  
  if (overusedGrouping.length > 0) {
    console.log(`❌ Overused grouping strategies:`);
    overusedGrouping.forEach(([strategy, count]) => {
      console.log(`   "${strategy.substring(0, 50)}..." used ${count} times`);
      qualityIssues.push(`Overused grouping: ${count} times`);
    });
  }
  
  // 5. ASSESSMENT AUTHENTICITY
  console.log('\n📊 ASSESSMENT AUTHENTICITY CHECK');
  console.log('-'.repeat(50));
  
  const assessmentNotes = new Map();
  let genericAssessments = 0;
  
  lessons.forEach(lesson => {
    const notes = lesson.assessmentNotes || '';
    
    // Check for generic assessment notes
    if (notes.length < 30 || notes === 'Observer les élèves') {
      genericAssessments++;
    }
    
    // Track duplicates
    if (!assessmentNotes.has(notes)) {
      assessmentNotes.set(notes, 0);
    }
    assessmentNotes.set(notes, assessmentNotes.get(notes) + 1);
  });
  
  if (genericAssessments > 100) {
    console.log(`❌ ${genericAssessments} lessons have generic assessment notes`);
    qualityIssues.push(`Generic assessment: ${genericAssessments} lessons`);
  }
  
  // 6. MATERIALS FEASIBILITY
  console.log('\n📦 MATERIALS FEASIBILITY CHECK');
  console.log('-'.repeat(50));
  
  let expensiveMaterials = 0;
  let rareMaterials = 0;
  
  lessons.forEach(lesson => {
    const materials = lesson.materials || '';
    const materialsLower = materials.toLowerCase();
    
    // Check for expensive items
    if (materialsLower.includes('ipad') || materialsLower.includes('tablette') || 
        materialsLower.includes('ordinateur') || materialsLower.includes('camera')) {
      expensiveMaterials++;
    }
    
    // Check for rare/unusual items
    if (materialsLower.includes('spécialis') || materialsLower.includes('professionnel') ||
        materialsLower.includes('expert')) {
      rareMaterials++;
    }
  });
  
  if (expensiveMaterials > 50) {
    console.log(`❌ ${expensiveMaterials} lessons require expensive technology`);
    qualityIssues.push(`Expensive materials: ${expensiveMaterials} lessons`);
  }
  
  if (rareMaterials > 20) {
    console.log(`❌ ${rareMaterials} lessons require rare/specialized materials`);
    qualityIssues.push(`Rare materials: ${rareMaterials} lessons`);
  }
  
  // 7. DEVELOPMENTAL APPROPRIATENESS
  console.log('\n👶 DEVELOPMENTAL APPROPRIATENESS (GRADE 1)');
  console.log('-'.repeat(50));
  
  let tooComplex = 0;
  let tooLong = 0;
  let inappropriateContent = 0;
  
  lessons.forEach(lesson => {
    const fullContent = (lesson.mindsOn + ' ' + lesson.action + ' ' + lesson.consolidation).toLowerCase();
    
    // Check for overly complex concepts for Grade 1
    if (fullContent.includes('analyser') || fullContent.includes('synthétiser') ||
        fullContent.includes('évaluer de manière critique') || fullContent.includes('dissertation')) {
      tooComplex++;
    }
    
    // Check lesson duration
    if (lesson.duration > 60) {
      tooLong++;
    }
    
    // Check for inappropriate content
    if (fullContent.includes('politique') || fullContent.includes('économie') ||
        fullContent.includes('algèbre') || fullContent.includes('fraction')) {
      inappropriateContent++;
    }
  });
  
  if (tooComplex > 20) {
    console.log(`❌ ${tooComplex} lessons contain overly complex concepts for Grade 1`);
    qualityIssues.push(`Too complex for Grade 1: ${tooComplex} lessons`);
  }
  
  if (tooLong > 50) {
    console.log(`❌ ${tooLong} lessons exceed 60 minutes (too long for Grade 1)`);
    qualityIssues.push(`Lessons too long: ${tooLong} exceed 60 min`);
  }
  
  if (inappropriateContent > 10) {
    console.log(`❌ ${inappropriateContent} lessons contain age-inappropriate content`);
    qualityIssues.push(`Age-inappropriate content: ${inappropriateContent} lessons`);
  }
  
  // FINAL PEDAGOGICAL QUALITY SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('📊 PEDAGOGICAL QUALITY SUMMARY');
  console.log('='.repeat(70));
  
  if (qualityIssues.length === 0) {
    console.log('✅ EXCELLENT PEDAGOGICAL QUALITY - NO ISSUES FOUND!');
  } else {
    console.log(`\n❌ TOTAL QUALITY ISSUES: ${qualityIssues.length}`);
    console.log('\nCritical Quality Problems:');
    qualityIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    console.log('\n⚠️  PEDAGOGICAL QUALITY NEEDS IMPROVEMENT!');
  }
  
  await prisma.$disconnect();
}

pedagogicalQualityCheck().catch(console.error);