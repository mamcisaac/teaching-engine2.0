import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function examineSingleUnit() {
  console.log('🔍 EXAMINING SINGLE UNIT PLAN IN DETAIL');
  console.log('=' .repeat(60));

  // Get one unit plan with all fields
  const unit = await prisma.unitPlan.findFirst({
    where: { title: { contains: 'Mon corps et ma sécurité' } }
  });

  if (!unit) {
    console.log('❌ No unit found with that title');
    return;
  }

  console.log(`📋 UNIT: ${unit.title}`);
  console.log('=' .repeat(60));
  
  // Show all fields
  for (const [field, value] of Object.entries(unit)) {
    const displayValue = value === null ? 'NULL' : 
                        value === undefined ? 'UNDEFINED' :
                        typeof value === 'string' && value.length > 100 ? `"${value.substring(0, 100)}..."` :
                        typeof value === 'object' ? JSON.stringify(value) :
                        value;
    
    console.log(`${field.padEnd(25)}: ${displayValue}`);
  }

  console.log('\n🎯 TEMPLATE INTEGRATION ANALYSIS:');
  console.log('=' .repeat(60));
  
  const hasContent = {
    bigIdeas: !!unit.bigIdeas,
    essentialQuestions: !!unit.essentialQuestions,
    successCriteria: !!unit.successCriteria,
    keyVocabulary: !!unit.keyVocabulary,
    differentiationStrategies: !!unit.differentiationStrategies,
    assessmentPlan: !!unit.assessmentPlan,
    indigenousPerspectives: !!unit.indigenousPerspectives
  };

  console.log('Content availability for lesson templates:');
  for (const [field, hasValue] of Object.entries(hasContent)) {
    console.log(`  ${field.padEnd(25)}: ${hasValue ? '✅ Available' : '❌ Missing'}`);
  }

  await prisma.$disconnect();
}

examineSingleUnit().catch(console.error);