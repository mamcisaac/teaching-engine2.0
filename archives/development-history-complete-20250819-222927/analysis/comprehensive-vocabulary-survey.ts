import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveVocabularySurvey() {
  console.log('📚 COMPREHENSIVE VOCABULARY SURVEY - EMILY\'S GRADE 1 SYSTEM\n');
  console.log('==============================================================');
  
  // Query all Long Range Plans (all users to find Emily's data)
  const allLRPs = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  console.log(`📊 Found ${allLRPs.length} Long Range Plans for Emily\n`);
  
  let totalUnits = 0;
  let unitsWithVocab = 0;
  let unitsNeedingVocab = 0;
  
  const vocabStatus: { [subject: string]: { total: number; complete: number; missing: string[] } } = {};
  
  for (const lrp of allLRPs) {
    const subject = lrp.subject;
    const units = lrp.unitPlans;
    
    totalUnits += units.length;
    
    vocabStatus[subject] = {
      total: units.length,
      complete: 0,
      missing: []
    };
    
    console.log(`\n🎯 ${subject.toUpperCase()} - ${units.length} units`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const hasVocab = unit.keyVocabulary && Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length > 0;
      
      if (hasVocab) {
        unitsWithVocab++;
        vocabStatus[subject].complete++;
        const vocabCount = (unit.keyVocabulary as any[]).length;
        console.log(`✅ Unit ${i+1}: ${unit.title} (${vocabCount} words)`);
      } else {
        unitsNeedingVocab++;
        vocabStatus[subject].missing.push(`Unit ${i+1}: ${unit.title}`);
        console.log(`❌ Unit ${i+1}: ${unit.title} - NO VOCABULARY`);
      }
    }
    
    const completionRate = Math.round((vocabStatus[subject].complete / vocabStatus[subject].total) * 100);
    console.log(`\n📈 ${subject}: ${vocabStatus[subject].complete}/${vocabStatus[subject].total} complete (${completionRate}%)`);
  }
  
  console.log('\n\n📊 OVERALL VOCABULARY STATUS SUMMARY');
  console.log('=====================================');
  console.log(`📚 Total Units: ${totalUnits}`);
  console.log(`✅ Units with Vocabulary: ${unitsWithVocab}`);
  console.log(`❌ Units Missing Vocabulary: ${unitsNeedingVocab}`);
  console.log(`📈 Overall Completion: ${Math.round((unitsWithVocab / totalUnits) * 100)}%\n`);
  
  console.log('📋 DETAILED SUBJECT BREAKDOWN:');
  console.log('==============================');
  
  for (const [subject, status] of Object.entries(vocabStatus)) {
    const rate = Math.round((status.complete / status.total) * 100);
    console.log(`\n${subject}:`);
    console.log(`  ✅ Complete: ${status.complete}/${status.total} (${rate}%)`);
    if (status.missing.length > 0) {
      console.log(`  ❌ Missing vocabulary:`);
      status.missing.forEach(unit => console.log(`     • ${unit}`));
    }
  }
  
  console.log('\n\n🎯 PRIORITY COMPLETION PLAN:');
  console.log('=============================');
  
  const prioritySubjects = Object.entries(vocabStatus)
    .filter(([_, status]) => status.missing.length > 0)
    .sort((a, b) => b[1].missing.length - a[1].missing.length);
  
  prioritySubjects.forEach(([subject, status], index) => {
    console.log(`${index + 1}. ${subject}: ${status.missing.length} units need vocabulary`);
  });
  
  if (unitsNeedingVocab > 0) {
    console.log(`\n🚀 NEXT STEPS: Complete vocabulary for ${unitsNeedingVocab} units`);
    console.log('📝 Each unit needs 15-25 Grade 1 appropriate vocabulary items');
    console.log('🎓 All in French for immersion instruction');
    console.log('🎯 Connected to unit\'s specific big ideas and content');
  } else {
    console.log('\n🎉 ALL UNITS HAVE VOCABULARY COMPLETE!');
  }
  
  await prisma.$disconnect();
}

comprehensiveVocabularySurvey().catch(console.error);