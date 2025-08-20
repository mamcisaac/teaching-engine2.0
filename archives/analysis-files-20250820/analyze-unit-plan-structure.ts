import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function analyzeUnitPlanStructure() {
  console.log('🔍 ANALYZING UNIT PLAN STRUCTURES FOR LESSON TEMPLATE CREATION');
  console.log('=' .repeat(80));

  // Get sample unit plans from each subject
  const subjects = [
    'Français (Immersion)',
    'Mathématiques', 
    'Sciences de la nature',
    'Arts visuels',
    'Sciences humaines',
    'Formation personnelle et sociale'
  ];

  const analysis: any = {};

  for (const subjectName of subjects) {
    console.log(`\n📚 ANALYZING: ${subjectName.toUpperCase()}`);
    console.log('-'.repeat(60));

    // Get LRP for this subject
    const lrp = await prisma.longRangePlan.findFirst({
      where: { subject: subjectName },
      include: {
        unitPlans: {
          take: 2, // Sample first 2 units
          select: {
            id: true,
            title: true,
            description: true,
            bigIdeas: true,
            essentialQuestions: true,
            successCriteria: true,
            keyVocabulary: true,
            differentiationStrategies: true,
            assessmentPlan: true,
            startDate: true,
            endDate: true,
            estimatedHours: true,
            indigenousPerspectives: true,
            isLocked: true
          }
        }
      }
    });

    if (!lrp) {
      console.log(`❌ No LRP found for ${subjectName}`);
      continue;
    }

    analysis[subjectName] = {
      lrpId: lrp.id,
      totalUnits: lrp.unitPlans.length,
      sampleUnits: lrp.unitPlans
    };

    // Analyze unit structure
    for (const unit of lrp.unitPlans) {
      console.log(`\n  📋 Unit: ${unit.title}`);
      console.log(`    Hours: ${unit.estimatedHours}`);
      console.log(`    Locked: ${unit.isLocked ? 'YES (Protected)' : 'No'}`);
      console.log(`    Big Ideas: ${unit.bigIdeas ? 'Present' : 'Missing'}`);
      console.log(`    Essential Questions: ${unit.essentialQuestions ? 'Present' : 'Missing'}`);
      console.log(`    Success Criteria: ${unit.successCriteria ? 'Present' : 'Missing'}`);
      console.log(`    Vocabulary: ${unit.keyVocabulary ? 'Present' : 'Missing'}`);
      console.log(`    Differentiation: ${unit.differentiationStrategies ? 'Present' : 'Missing'}`);
      console.log(`    Assessment Plan: ${unit.assessmentPlan ? 'Present' : 'Missing'}`);
      console.log(`    Indigenous Perspectives: ${unit.indigenousPerspectives ? 'Present' : 'Missing'}`);
      
      // Sample actual content structure
      if (unit.bigIdeas) {
        console.log(`    Big Ideas Structure: Text format (${unit.bigIdeas.length} chars)`);
      }

      if (unit.essentialQuestions) {
        console.log(`    Essential Questions Structure: JSON format`);
      }

      if (unit.keyVocabulary) {
        console.log(`    Vocabulary Structure: JSON format`);
      }

      if (unit.differentiationStrategies) {
        console.log(`    Differentiation Structure: JSON format`);
      }
    }
  }

  console.log('\n🎯 LESSON TEMPLATE REQUIREMENTS ANALYSIS');
  console.log('=' .repeat(80));

  // Calculate lesson requirements
  for (const [subject, data] of Object.entries(analysis)) {
    const subjectData = data as any;
    const totalHours = subjectData.sampleUnits.reduce((sum: number, unit: any) => sum + (unit.estimatedHours || 0), 0);
    const estimatedLessons = Math.ceil(totalHours / 0.75); // 45 min = 0.75 hours
    
    console.log(`\n📊 ${subject}:`);
    console.log(`  - Total Units: ${subjectData.totalUnits}`);
    console.log(`  - Sample Hours: ${totalHours}`);
    console.log(`  - Est. Lessons per Sample: ${estimatedLessons}`);
  }

  console.log('\n🏗️ TEMPLATE STRUCTURE REQUIREMENTS:');
  console.log('✅ Must integrate with existing unit plan fields:');
  console.log('  - bigIdeas (String - text format)');
  console.log('  - essentialQuestions (Json array/object)');
  console.log('  - successCriteria (Json array/object)');
  console.log('  - keyVocabulary (Json array/object)');
  console.log('  - differentiationStrategies (Json array/object)');
  console.log('  - assessmentPlan (String - text format)');
  console.log('  - indigenousPerspectives (String - text format)');
  
  console.log('\n✅ Must follow ETFO structure:');
  console.log('  - Minds On (10-15 minutes)');
  console.log('  - Action (25-30 minutes)');
  console.log('  - Consolidation (5-10 minutes)');
  
  console.log('\n✅ Must be Grade 1 French Immersion appropriate');
  console.log('✅ Must include safety protocols');
  console.log('✅ Must include Indigenous perspectives');
  console.log('✅ Must be 45-minute duration');

  await prisma.$disconnect();
}

analyzeUnitPlanStructure().catch(console.error);