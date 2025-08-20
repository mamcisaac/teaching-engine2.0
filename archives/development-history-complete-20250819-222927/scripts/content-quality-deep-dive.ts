import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function contentQualityDeepDive() {
  console.log('🔬 CONTENT QUALITY DEEP DIVE - LOOKING FOR REAL PROBLEMS');
  console.log('==========================================================\n');

  // Sample problematic units for deep inspection
  const problemUnits = [
    { lrpId: 'cmebyc98k0003vjr1svziz0in', title: 'Addition jusqu\'à 10' }, // Math Unit 3
    { lrpId: 'cmebyc98s0007vjr1v0a2ibp5', title: 'Ma famille et mon foyer' }, // Social Studies Unit 2
    { lrpId: 'cmebyc98x000bvjr1finmuibw', title: 'Nutrition et mode de vie sain' } // Health Unit 4
  ];

  for (const problem of problemUnits) {
    const unit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: problem.lrpId,
        title: problem.title
      }
    });

    if (!unit) {
      console.log(`❌ Unit "${problem.title}" NOT FOUND`);
      continue;
    }

    console.log(`📋 UNIT: "${unit.title}"`);
    console.log('═'.repeat(60));

    // Check Big Ideas length and quality
    console.log('\n💡 BIG IDEAS CHECK:');
    if (unit.bigIdeas) {
      console.log(`Length: ${unit.bigIdeas.length} characters`);
      if (unit.bigIdeas.length < 50) {
        console.log('❌ TOO SHORT - Likely placeholder content');
      }
      console.log(`Content: "${unit.bigIdeas.substring(0, 150)}..."`);
      
      // Check if it's JSON or string
      try {
        const parsed = JSON.parse(unit.bigIdeas);
        if (Array.isArray(parsed)) {
          console.log(`Format: JSON Array with ${parsed.length} items`);
          parsed.forEach((idea, i) => console.log(`  ${i + 1}. ${idea}`));
        }
      } catch {
        console.log('Format: Plain text');
      }
    } else {
      console.log('❌ MISSING');
    }

    // Check Essential Questions
    console.log('\n❓ ESSENTIAL QUESTIONS CHECK:');
    if (unit.essentialQuestions) {
      try {
        const questions = JSON.parse(unit.essentialQuestions);
        if (Array.isArray(questions)) {
          console.log(`✅ ${questions.length} questions found`);
          questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
        }
      } catch {
        const text = typeof unit.essentialQuestions === 'string' ? unit.essentialQuestions : JSON.stringify(unit.essentialQuestions);
        console.log(`Text format: ${text.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ MISSING');
    }

    // Check Success Criteria structure
    console.log('\n🎯 SUCCESS CRITERIA CHECK:');
    if (unit.successCriteria) {
      try {
        const criteria = JSON.parse(unit.successCriteria);
        if (typeof criteria === 'object') {
          console.log('✅ Structured criteria found:');
          Object.keys(criteria).forEach(key => {
            const value = criteria[key];
            const preview = typeof value === 'string' ? value.substring(0, 60) : JSON.stringify(value);
            console.log(`  ${key}: "${preview}..."`);
          });
        }
      } catch {
        const text = typeof unit.successCriteria === 'string' ? unit.successCriteria : JSON.stringify(unit.successCriteria);
        console.log(`Text format: ${text.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ MISSING');
    }

    // Check dates
    console.log('\n📅 DATE CHECK:');
    if (unit.startDate && unit.endDate) {
      const start = unit.startDate.toISOString().split('T')[0];
      const end = unit.endDate.toISOString().split('T')[0];
      const days = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const expectedDays = Math.ceil((unit.estimatedHours || 0) / 0.75);
      
      console.log(`Start: ${start}`);
      console.log(`End: ${end}`);
      console.log(`Duration: ${days} calendar days`);
      console.log(`Expected: ${expectedDays} school days`);
      
      if (Math.abs(days - expectedDays) > 5) {
        console.log('❌ DATE MISMATCH - Does not align with daily model');
      }
    } else {
      console.log('❌ DATES MISSING');
    }

    // Check vocabulary
    console.log('\n📝 VOCABULARY CHECK:');
    if (unit.keyVocabulary) {
      try {
        const vocab = JSON.parse(unit.keyVocabulary);
        if (Array.isArray(vocab)) {
          console.log(`✅ ${vocab.length} vocabulary items`);
          if (vocab.length > 0 && typeof vocab[0] === 'object') {
            console.log('Sample items:');
            vocab.slice(0, 3).forEach((v, i) => {
              console.log(`  ${i + 1}. ${v.word}: ${v.definition}`);
            });
          }
        }
      } catch {
        console.log('❌ Invalid vocabulary format');
      }
    } else {
      console.log('❌ MISSING');
    }

    console.log('\n---\n');
  }

  // Check total lesson plans in system
  console.log('📊 SYSTEM-WIDE LESSON PLAN CHECK:');
  const totalLessonPlans = await prisma.eTFOLessonPlan.count();
  
  console.log(`Total lesson plans in database: ${totalLessonPlans}`);
  console.log(`Required lesson plans: 975`);
  console.log(`Gap: ${975 - totalLessonPlans} lessons missing`);
  
  if (totalLessonPlans === 0) {
    console.log('\n❌ CRITICAL FAILURE: ZERO LESSON PLANS EXIST');
    console.log('Without lesson plans, daily instruction is IMPOSSIBLE.');
  }

  await prisma.$disconnect();
}

contentQualityDeepDive().catch(console.error);