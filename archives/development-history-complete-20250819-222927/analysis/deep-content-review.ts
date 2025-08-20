import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepContentReview() {
  console.log('🔍 DEEP PEDAGOGICAL CONTENT REVIEW');
  console.log('===================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()} - SAMPLE UNIT CONTENT REVIEW`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      select: {
        title: true,
        description: true,
        bigIdeas: true,
        essentialQuestions: true,
        successCriteria: true,
        assessmentPlan: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        keyVocabulary: true,
        estimatedHours: true,
        startDate: true,
        endDate: true
      },
      take: 2 // Sample first 2 units for review
    });

    for (const [index, unit] of units.entries()) {
      console.log(`\n🔍 Unit ${index + 1}: "${unit.title}"`);
      console.log(`Hours: ${unit.estimatedHours}`);
      
      if (unit.startDate && unit.endDate) {
        console.log(`Date Range: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      }
      
      // Check pedagogical completeness
      console.log(`\n📝 PEDAGOGICAL ELEMENTS:`);
      console.log(`Description: ${unit.description ? '✅ Present' : '❌ Missing'}`);
      console.log(`Big Ideas: ${unit.bigIdeas ? '✅ Present' : '❌ Missing'}`);
      console.log(`Essential Questions: ${unit.essentialQuestions ? '✅ Present' : '❌ Missing'}`);
      console.log(`Success Criteria: ${unit.successCriteria ? '✅ Present' : '❌ Missing'}`);
      console.log(`Assessment Plan: ${unit.assessmentPlan ? '✅ Present' : '❌ Missing'}`);
      console.log(`Differentiation: ${unit.differentiationStrategies ? '✅ Present' : '❌ Missing'}`);
      console.log(`Indigenous Perspectives: ${unit.indigenousPerspectives ? '✅ Present' : '❌ Missing'}`);
      console.log(`Key Vocabulary: ${unit.keyVocabulary ? '✅ Present' : '❌ Missing'}`);
      
      // Content quality assessment
      if (unit.description) {
        console.log(`\n📖 DESCRIPTION SAMPLE:`);
        console.log(`"${unit.description.substring(0, 300)}${unit.description.length > 300 ? '...' : ''}"`);
      }
      
      if (unit.bigIdeas) {
        console.log(`\n💡 BIG IDEAS SAMPLE:`);
        console.log(`"${unit.bigIdeas.substring(0, 200)}${unit.bigIdeas.length > 200 ? '...' : ''}"`);
      }
      
      if (unit.essentialQuestions) {
        console.log(`\n❓ ESSENTIAL QUESTIONS SAMPLE:`);
        try {
          const questions = JSON.parse(unit.essentialQuestions);
          if (Array.isArray(questions)) {
            questions.slice(0, 2).forEach((q, i) => console.log(`   ${i + 1}. ${q}`));
          } else {
            console.log(`   "${unit.essentialQuestions.substring(0, 200)}..."`);
          }
        } catch {
          console.log(`   "${unit.essentialQuestions.substring(0, 200)}..."`);
        }
      }
    }
    
    console.log(`\n---\n`);
  }

  await prisma.$disconnect();
}

deepContentReview().catch(console.error);