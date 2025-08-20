import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeUnits58() {
  try {
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('Emily not found');
      return;
    }

    // Get detailed information for Units 5-8
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        description: true,
        descriptionFr: true,
        essentialQuestions: true,
        bigIdeas: true,
        bigIdeasFr: true,
        keyVocabulary: true,
        culminatingTask: true,
        assessmentPlan: true,
        successCriteria: true,
        differentiationStrategies: true,
        parentCommunicationPlan: true,
        communityConnections: true,
        indigenousPerspectives: true,
        environmentalEducation: true,
        socialJusticeConnections: true,
        crossCurricularConnections: true,
        startDate: true,
        endDate: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Filter to Units 5-8 (indices 4-7)
    const targetUnits = units.slice(4, 8);
    
    targetUnits.forEach((unit, index) => {
      const unitNumber = index + 5;
      console.log(`\n======== UNIT ${unitNumber} DETAILED ANALYSIS ========`);
      console.log(`Title: ${unit.title}`);
      console.log(`Title (FR): ${unit.titleFr || 'MISSING'}`);
      console.log(`ID: ${unit.id}`);
      console.log(`Dates: ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
      
      console.log(`\n--- DESCRIPTION ---`);
      console.log(unit.description || 'No description');
      
      if (unit.descriptionFr) {
        console.log(`\n--- DESCRIPTION (FR) ---`);
        console.log(unit.descriptionFr);
      } else {
        console.log('\n--- DESCRIPTION (FR) ---');
        console.log('MISSING');
      }
      
      console.log(`\n--- ESSENTIAL QUESTIONS ---`);
      if (Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0) {
        unit.essentialQuestions.forEach((q, i) => {
          console.log(`${i + 1}. ${q}`);
        });
      } else {
        console.log('No essential questions found');
      }
      
      console.log(`\n--- BIG IDEAS (EN) ---`);
      console.log(unit.bigIdeas || 'MISSING');
      
      console.log(`\n--- BIG IDEAS (FR) ---`);
      console.log(unit.bigIdeasFr || 'MISSING');
      
      console.log(`\n--- KEY VOCABULARY ---`);
      if (Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length > 0) {
        console.log(`Found ${unit.keyVocabulary.length} vocabulary items:`);
        unit.keyVocabulary.forEach((vocab, i) => {
          console.log(`${i + 1}. ${vocab}`);
        });
      } else {
        console.log('MISSING - No vocabulary set');
      }
      
      console.log(`\n--- CULMINATING TASK ---`);
      console.log(unit.culminatingTask || 'MISSING');
      
      console.log(`\n--- ASSESSMENT PLAN ---`);
      console.log(unit.assessmentPlan || 'MISSING');
      
      console.log(`\n--- SUCCESS CRITERIA ---`);
      if (Array.isArray(unit.successCriteria) && unit.successCriteria.length > 0) {
        unit.successCriteria.forEach((criteria, i) => {
          console.log(`${i + 1}. ${criteria}`);
        });
      } else {
        console.log('MISSING');
      }
      
      console.log(`\n--- DIFFERENTIATION STRATEGIES ---`);
      if (Array.isArray(unit.differentiationStrategies) && unit.differentiationStrategies.length > 0) {
        unit.differentiationStrategies.forEach((strategy, i) => {
          console.log(`${i + 1}. ${strategy}`);
        });
      } else {
        console.log('MISSING');
      }
      
      console.log(`\n--- PARENT COMMUNICATION ---`);
      console.log(unit.parentCommunicationPlan || 'MISSING');
      
      console.log(`\n--- COMMUNITY CONNECTIONS ---`);
      console.log(unit.communityConnections || 'MISSING');
      
      console.log(`\n--- INDIGENOUS PERSPECTIVES ---`);
      console.log(unit.indigenousPerspectives || 'MISSING');
      
      console.log(`\n--- ENVIRONMENTAL EDUCATION ---`);
      console.log(unit.environmentalEducation || 'MISSING');
      
      console.log(`\n--- SOCIAL JUSTICE CONNECTIONS ---`);
      console.log(unit.socialJusticeConnections || 'MISSING');
      
      console.log(`\n--- CROSS-CURRICULAR CONNECTIONS ---`);
      console.log(unit.crossCurricularConnections || 'MISSING');
      
      console.log(`\n${'='.repeat(50)}\n`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeUnits58();