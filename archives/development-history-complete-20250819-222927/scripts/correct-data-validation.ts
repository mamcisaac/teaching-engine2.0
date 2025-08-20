import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function correctDataValidation() {
  console.log('🔧 CORRECT DATA VALIDATION - UNDERSTANDING ACTUAL SCHEMA');
  console.log('==========================================================\n');

  // Get Health/FPS units to revalidate
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log(`📊 EXAMINING ${fpsUnits.length} Health/FPS units with CORRECT validation\n`);

  console.log('📋 SCHEMA UNDERSTANDING:');
  console.log('========================');
  console.log('✅ bigIdeas: String field (should be plain text)');
  console.log('✅ essentialQuestions: Json field (should be parsed JSON)');
  console.log('✅ keyVocabulary: Json field (should be parsed JSON)');
  console.log('✅ successCriteria: Json field (should be parsed JSON)\n');

  for (const unit of fpsUnits) {
    console.log(`📋 UNIT: "${unit.title}"`);
    console.log('═'.repeat(60));

    // Big Ideas - Should be String (text)
    console.log('\n💡 BIG IDEAS (String field):');
    if (unit.bigIdeas) {
      console.log(`✅ Content present: ${unit.bigIdeas.length} characters`);
      console.log(`   Preview: "${unit.bigIdeas.substring(0, 100)}..."`);
    } else {
      console.log('❌ Missing content');
    }

    // Essential Questions - Should be JSON
    console.log('\n❓ ESSENTIAL QUESTIONS (JSON field):');
    if (unit.essentialQuestions) {
      if (Array.isArray(unit.essentialQuestions)) {
        console.log(`✅ Valid JSON array with ${unit.essentialQuestions.length} questions`);
        unit.essentialQuestions.forEach((q, i) => {
          console.log(`   ${i + 1}. ${q}`);
        });
      } else {
        console.log('⚠️ JSON present but not array format');
        console.log(`   Type: ${typeof unit.essentialQuestions}`);
        console.log(`   Content: ${JSON.stringify(unit.essentialQuestions).substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Missing content');
    }

    // Key Vocabulary - Should be JSON  
    console.log('\n📝 KEY VOCABULARY (JSON field):');
    if (unit.keyVocabulary) {
      if (Array.isArray(unit.keyVocabulary)) {
        console.log(`✅ Valid JSON array with ${unit.keyVocabulary.length} vocabulary items`);
        if (unit.keyVocabulary.length > 0 && typeof unit.keyVocabulary[0] === 'object') {
          unit.keyVocabulary.slice(0, 3).forEach((vocab, i) => {
            console.log(`   ${i + 1}. "${vocab.word}": ${vocab.definition}`);
          });
        }
      } else {
        console.log('⚠️ JSON present but not array format');
        console.log(`   Type: ${typeof unit.keyVocabulary}`);
      }
    } else {
      console.log('❌ Missing content');
    }

    // Success Criteria - Should be JSON
    console.log('\n🎯 SUCCESS CRITERIA (JSON field):');
    if (unit.successCriteria) {
      if (typeof unit.successCriteria === 'object') {
        console.log('✅ Valid JSON object structure');
        const keys = Object.keys(unit.successCriteria);
        console.log(`   Contains ${keys.length} criteria levels:`);
        keys.forEach(key => {
          const value = unit.successCriteria[key];
          const preview = typeof value === 'string' ? value.substring(0, 60) : JSON.stringify(value);
          console.log(`   ${key}: "${preview}..."`);
        });
      } else {
        console.log('⚠️ JSON present but not object format');
        console.log(`   Type: ${typeof unit.successCriteria}`);
      }
    } else {
      console.log('❌ Missing content');
    }

    console.log('\n---\n');
  }

  // Now test with other subjects to confirm schema consistency
  console.log('🔄 CROSS-SUBJECT SCHEMA VALIDATION');
  console.log('====================================\n');

  const subjects = [
    { name: 'French', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Math', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' }
  ];

  for (const subject of subjects) {
    const sampleUnit = await prisma.unitPlan.findFirst({
      where: { longRangePlanId: subject.lrpId }
    });

    if (!sampleUnit) continue;

    console.log(`${subject.name} - "${sampleUnit.title}"`);
    
    // Check field types match schema
    console.log(`  Big Ideas: ${sampleUnit.bigIdeas ? 'String ✅' : 'Missing ❌'}`);
    console.log(`  Essential Questions: ${sampleUnit.essentialQuestions ? (Array.isArray(sampleUnit.essentialQuestions) ? 'JSON Array ✅' : 'JSON Other ⚠️') : 'Missing ❌'}`);
    console.log(`  Key Vocabulary: ${sampleUnit.keyVocabulary ? (Array.isArray(sampleUnit.keyVocabulary) ? 'JSON Array ✅' : 'JSON Other ⚠️') : 'Missing ❌'}`);
    console.log(`  Success Criteria: ${sampleUnit.successCriteria ? (typeof sampleUnit.successCriteria === 'object' ? 'JSON Object ✅' : 'JSON Other ⚠️') : 'Missing ❌'}`);
    console.log('');
  }

  // Final assessment
  console.log('📊 VALIDATION CORRECTION SUMMARY');
  console.log('==================================');
  console.log('');
  console.log('❌ PREVIOUS SCRIPT ERRORS:');
  console.log('  • Tried to JSON.parse() String fields (bigIdeas)');
  console.log('  • Misinterpreted field types based on content');
  console.log('  • Did not account for Prisma JSON field handling');
  console.log('');
  console.log('✅ CORRECT UNDERSTANDING:');
  console.log('  • bigIdeas: String field = plain text (as designed)');
  console.log('  • essentialQuestions/keyVocabulary/successCriteria: JSON fields = structured data');
  console.log('  • Prisma automatically parses JSON fields on retrieval');
  console.log('');

  await prisma.$disconnect();
}

correctDataValidation().catch(console.error);