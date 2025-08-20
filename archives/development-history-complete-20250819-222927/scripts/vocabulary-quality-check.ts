import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVocabularyQuality() {
  console.log('🔍 VOCABULARY QUALITY CHECK ACROSS ALL SUBJECTS');
  console.log('=================================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()}`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      select: {
        title: true,
        keyVocabulary: true
      },
      take: 3 // Sample first 3 units
    });

    for (const [index, unit] of units.entries()) {
      console.log(`\n  Unit ${index + 1}: "${unit.title}"`);
      
      if (unit.keyVocabulary) {
        const vocabContent = typeof unit.keyVocabulary === 'string' ? unit.keyVocabulary : JSON.stringify(unit.keyVocabulary);
        console.log(`  Vocabulary type: ${typeof unit.keyVocabulary}`);
        console.log(`  Vocabulary length: ${vocabContent.length} chars`);
        console.log(`  Sample content: "${vocabContent.substring(0, 100)}..."`);
        
        // Try to parse as JSON if it's a string
        if (typeof unit.keyVocabulary === 'string') {
          try {
            const parsed = JSON.parse(unit.keyVocabulary);
            if (Array.isArray(parsed)) {
              console.log(`  ✅ Valid JSON array with ${parsed.length} items`);
              if (parsed.length > 0) {
                console.log(`  First item: ${JSON.stringify(parsed[0])}`);
              }
            } else {
              console.log(`  ⚠️ Valid JSON but not an array`);
            }
          } catch (error) {
            console.log(`  ❌ Invalid JSON format`);
          }
        } else {
          console.log(`  Raw content: ${JSON.stringify(unit.keyVocabulary)}`);
        }
      } else {
        console.log(`  ❌ No vocabulary present`);
      }
    }
    
    console.log('\n---\n');
  }

  await prisma.$disconnect();
}

checkVocabularyQuality().catch(console.error);