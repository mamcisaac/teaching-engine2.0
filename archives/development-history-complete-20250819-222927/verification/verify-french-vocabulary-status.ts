import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFrenchVocabularyStatus() {
  console.log('🔍 VERIFYING FRENCH LANGUAGE ARTS VOCABULARY STATUS\n');
  console.log('===================================================');
  
  // Query French LRP specifically
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!frenchLRP) {
    console.log('❌ No French Language Arts LRP found');
    return;
  }
  
  console.log(`📚 Found French LRP: ${frenchLRP.title}`);
  console.log(`🆔 LRP ID: ${frenchLRP.id}`);
  console.log(`📊 Units: ${frenchLRP.unitPlans.length}\n`);
  
  console.log('📖 DETAILED UNIT VOCABULARY STATUS:');
  console.log('─'.repeat(60));
  
  let totalVocabWords = 0;
  
  for (let i = 0; i < frenchLRP.unitPlans.length; i++) {
    const unit = frenchLRP.unitPlans[i];
    
    console.log(`\nUnit ${i+1}: ${unit.title}`);
    console.log(`ID: ${unit.id}`);
    
    // Check vocabulary field
    if (unit.keyVocabulary === null) {
      console.log('❌ keyVocabulary: NULL');
    } else if (unit.keyVocabulary === undefined) {
      console.log('❌ keyVocabulary: UNDEFINED');
    } else if (Array.isArray(unit.keyVocabulary)) {
      const vocabArray = unit.keyVocabulary as any[];
      if (vocabArray.length === 0) {
        console.log('❌ keyVocabulary: EMPTY ARRAY');
      } else {
        console.log(`✅ keyVocabulary: ${vocabArray.length} words`);
        totalVocabWords += vocabArray.length;
        
        // Show sample vocabulary
        console.log('   Sample words:');
        vocabArray.slice(0, 3).forEach(item => {
          if (typeof item === 'object' && item.word && item.definition) {
            console.log(`   • ${item.word}: ${item.definition} (${item.category || 'no category'})`);
          } else {
            console.log(`   • Invalid format: ${JSON.stringify(item)}`);
          }
        });
      }
    } else {
      console.log(`❌ keyVocabulary: WRONG TYPE (${typeof unit.keyVocabulary})`);
      console.log(`   Value: ${JSON.stringify(unit.keyVocabulary)}`);
    }
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('═'.repeat(40));
  console.log(`📚 Total French Units: ${frenchLRP.unitPlans.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalVocabWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalVocabWords / frenchLRP.unitPlans.length)}`);
  
  if (totalVocabWords === 0) {
    console.log('\n❌ ISSUE: No vocabulary found in any French units');
    console.log('🚨 The add-key-vocabulary.ts script may not have been run');
    console.log('💡 Need to run vocabulary completion process');
  } else if (totalVocabWords < 200) {
    console.log('\n⚠️ WARNING: Vocabulary seems incomplete');
    console.log('💡 Expected ~20 words per unit × 10 units = ~200 words');
  } else {
    console.log('\n✅ SUCCESS: French vocabulary appears complete');
  }
  
  await prisma.$disconnect();
}

verifyFrenchVocabularyStatus().catch(console.error);