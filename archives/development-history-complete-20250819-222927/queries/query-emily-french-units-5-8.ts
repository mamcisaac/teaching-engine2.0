import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFrenchUnits() {
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('Emily not found in database');
      return;
    }

    // Get all French units with detailed info
    const frenchUnits = await prisma.unitPlan.findMany({
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
        createdAt: true,
        updatedAt: true,
        startDate: true,
        endDate: true,
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Order by creation to understand sequence
      }
    });

    console.log(`Found ${frenchUnits.length} French units for Emily\n`);

    // Display all units with index to identify Units 5-8
    frenchUnits.forEach((unit, index) => {
      const unitNumber = index + 1;
      console.log(`=== UNIT ${unitNumber} ===`);
      console.log(`ID: ${unit.id}`);
      console.log(`Title: ${unit.title}`);
      console.log(`Title (FR): ${unit.titleFr || 'Not set'}`);
      console.log(`Description: ${unit.description ? unit.description.substring(0, 100) + '...' : 'No description'}`);
      console.log(`Description (FR): ${unit.descriptionFr ? unit.descriptionFr.substring(0, 100) + '...' : 'Not set'}`);
      console.log(`Essential Questions: ${Array.isArray(unit.essentialQuestions) ? unit.essentialQuestions.length : 'Not set'}`);
      console.log(`Big Ideas: ${unit.bigIdeas ? 'Set' : 'Not set'}`);
      console.log(`Big Ideas (FR): ${unit.bigIdeasFr ? 'Set' : 'Not set'}`);
      console.log(`Key Vocabulary: ${unit.keyVocabulary ? 'Set' : 'Not set'}`);
      console.log(`Culminating Task: ${unit.culminatingTask ? 'Set' : 'Not set'}`);
      console.log(`Assessment Plan: ${unit.assessmentPlan ? 'Set' : 'Not set'}`);
      console.log(`Differentiation Strategies: ${unit.differentiationStrategies ? 'Set' : 'Not set'}`);
      console.log(`Parent Communication: ${unit.parentCommunicationPlan ? 'Set' : 'Not set'}`);
      console.log(`Community Connections: ${unit.communityConnections ? 'Set' : 'Not set'}`);
      console.log(`Indigenous Perspectives: ${unit.indigenousPerspectives ? 'Set' : 'Not set'}`);
      console.log(`Start Date: ${unit.startDate.toDateString()}`);
      console.log(`End Date: ${unit.endDate.toDateString()}`);
      console.log(`Created: ${unit.createdAt.toDateString()}`);
      console.log(`Updated: ${unit.updatedAt.toDateString()}`);
      console.log('---');
    });

    // Focus on Units 5-8 specifically
    console.log('\n=== FOCUS: UNITS 5-8 ===');
    const targetUnits = frenchUnits.slice(4, 8); // Units 5-8 (0-indexed)
    
    if (targetUnits.length < 4) {
      console.log(`Warning: Only found ${targetUnits.length} units in positions 5-8`);
    }

    targetUnits.forEach((unit, index) => {
      const unitNumber = index + 5; // Units 5-8
      console.log(`\nUNIT ${unitNumber}: ${unit.title}`);
      console.log(`ID: ${unit.id}`);
      
      // Analyze completeness for ETFO requirements
      const completeness = {
        titleFr: !!unit.titleFr,
        descriptionFr: !!unit.descriptionFr && unit.descriptionFr.length > 50,
        essentialQuestions: !!unit.essentialQuestions && Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0,
        bigIdeas: !!unit.bigIdeas && unit.bigIdeas.length > 50,
        bigIdeasFr: !!unit.bigIdeasFr && unit.bigIdeasFr.length > 50,
        keyVocabulary: !!unit.keyVocabulary && Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length > 10,
        culminatingTask: !!unit.culminatingTask && unit.culminatingTask.length > 100,
        assessmentPlan: !!unit.assessmentPlan && unit.assessmentPlan.length > 50,
        successCriteria: !!unit.successCriteria && Array.isArray(unit.successCriteria) && unit.successCriteria.length > 0,
        differentiationStrategies: !!unit.differentiationStrategies && Array.isArray(unit.differentiationStrategies) && unit.differentiationStrategies.length > 0,
        parentCommunicationPlan: !!unit.parentCommunicationPlan && unit.parentCommunicationPlan.length > 50,
        communityConnections: !!unit.communityConnections && unit.communityConnections.length > 50,
        indigenousPerspectives: !!unit.indigenousPerspectives && unit.indigenousPerspectives.length > 50,
        environmentalEducation: !!unit.environmentalEducation && unit.environmentalEducation.length > 30,
        socialJusticeConnections: !!unit.socialJusticeConnections && unit.socialJusticeConnections.length > 30,
        crossCurricularConnections: !!unit.crossCurricularConnections && unit.crossCurricularConnections.length > 30
      };

      const completedFields = Object.values(completeness).filter(Boolean).length;
      const totalFields = Object.keys(completeness).length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      console.log(`ETFO Completeness: ${completionPercentage}% (${completedFields}/${totalFields})`);
      
      // List missing fields
      const missingFields = Object.entries(completeness)
        .filter(([_, isComplete]) => !isComplete)
        .map(([field, _]) => field);
      
      if (missingFields.length > 0) {
        console.log(`Missing/Incomplete: ${missingFields.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('Error querying French units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFrenchUnits();