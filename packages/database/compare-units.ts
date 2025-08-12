import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function compareUnits() {
  const artsUnit = await prisma.unitPlan.findFirst({
    where: { title: "Je m'exprime par l'art" }
  });
  
  const socialesUnit = await prisma.unitPlan.findFirst({
    where: { title: "Ma famille et ma communauté" }
  });
  
  console.log('Comparing fields between units:\n');
  console.log('Arts unit (88%):', artsUnit?.title);
  console.log('Sociales unit (100%):', socialesUnit?.title);
  console.log('\n');
  
  // Check each of the 25 criteria fields
  const fieldsToCheck = [
    'title',
    'description', 
    'bigIdeas',
    'essentialQuestions',
    'assessmentPlan',
    'performanceTask',
    'successCriteria',
    'assessmentRubric',
    'differentiationStrategies',
    'crossCurricularConnections',
    'communityConnections',
    'indigenousPerspectives',
    'technologyIntegration',
    'socialJusticeConnections',
    'environmentalEducation',
    'estimatedHours',
    'fieldTripsAndGuestSpeakers',
    'parentCommunicationPlan',
    'learningSkills',
    'enduringUnderstandings',
    'keyVocabulary'
  ];
  
  console.log('Field Comparison:');
  console.log('─'.repeat(60));
  
  fieldsToCheck.forEach(field => {
    const artsHas = !!(artsUnit as any)?.[field];
    const socialesHas = !!(socialesUnit as any)?.[field];
    
    if (artsHas !== socialesHas) {
      console.log(`${field}:`);
      console.log(`  Arts: ${artsHas ? '✅' : '❌'}`);
      console.log(`  Sociales: ${socialesHas ? '✅' : '❌'}`);
    }
  });
  
  // Also check resources length
  const artsResources = await prisma.unitPlanResource.count({
    where: { unitPlanId: artsUnit?.id }
  });
  
  const socialesResources = await prisma.unitPlanResource.count({
    where: { unitPlanId: socialesUnit?.id }
  });
  
  console.log('\nResources:');
  console.log(`  Arts: ${artsResources} (needs >= 4)`);
  console.log(`  Sociales: ${socialesResources} (needs >= 4)`);
  
  // Check differentiation content
  if (artsUnit?.differentiationStrategies) {
    const diffStr = JSON.stringify(artsUnit.differentiationStrategies);
    console.log('\nArts Differentiation includes:');
    console.log(`  forStruggling: ${diffStr.includes('forStruggling') ? '✅' : '❌'}`);
    console.log(`  forAdvanced: ${diffStr.includes('forAdvanced') ? '✅' : '❌'}`);
  }
  
  if (socialesUnit?.differentiationStrategies) {
    const diffStr = JSON.stringify(socialesUnit.differentiationStrategies);
    console.log('\nSociales Differentiation includes:');
    console.log(`  forStruggling: ${diffStr.includes('forStruggling') ? '✅' : '❌'}`);
    console.log(`  forAdvanced: ${diffStr.includes('forAdvanced') ? '✅' : '❌'}`);
  }
  
  // Check assessment plan content
  if (artsUnit?.assessmentPlan) {
    console.log('\nArts Assessment includes:');
    console.log(`  FORMATIVE: ${artsUnit.assessmentPlan.includes('FORMATIVE') ? '✅' : '❌'}`);
    console.log(`  SOMMATIVE: ${artsUnit.assessmentPlan.includes('SOMMATIVE') ? '✅' : '❌'}`);
  }
  
  if (socialesUnit?.assessmentPlan) {
    console.log('\nSociales Assessment includes:');
    console.log(`  FORMATIVE: ${socialesUnit.assessmentPlan.includes('FORMATIVE') ? '✅' : '❌'}`);
    console.log(`  SOMMATIVE: ${socialesUnit.assessmentPlan.includes('SOMMATIVE') ? '✅' : '❌'}`);
  }
}

compareUnits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());