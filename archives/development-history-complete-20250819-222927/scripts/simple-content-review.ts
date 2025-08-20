import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleContentReview() {
  console.log('🔍 UNIT PLAN CONTENT QUALITY ASSESSMENT');
  console.log('========================================\n');

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
        description: true,
        bigIdeas: true,
        essentialQuestions: true,
        successCriteria: true,
        assessmentPlan: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        keyVocabulary: true,
        estimatedHours: true
      }
    });

    let completeUnits = 0;
    let totalFields = 0;
    let presentFields = 0;

    for (const unit of units) {
      const fields = [
        unit.description,
        unit.bigIdeas,
        unit.essentialQuestions,
        unit.successCriteria,
        unit.assessmentPlan,
        unit.differentiationStrategies,
        unit.indigenousPerspectives,
        unit.keyVocabulary
      ];

      const fieldsPresent = fields.filter(f => f).length;
      totalFields += 8;
      presentFields += fieldsPresent;

      if (fieldsPresent === 8) completeUnits++;
    }

    const completionRate = Math.round((presentFields / totalFields) * 100);
    console.log(`Units: ${units.length}`);
    console.log(`Complete units (all 8 fields): ${completeUnits}/${units.length}`);
    console.log(`Overall completion: ${completionRate}%`);
    console.log(`Average hours per unit: ${Math.round(units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) / units.length * 10) / 10}`);

    // Check for specific quality indicators in descriptions
    let coreExtensionUnits = 0;
    let etfoComplianceUnits = 0;
    let flexibilityUnits = 0;

    for (const unit of units) {
      if (unit.description) {
        const desc = unit.description.toLowerCase();
        if (desc.includes('core') || desc.includes('extension') || desc.includes('essentielles')) {
          coreExtensionUnits++;
        }
        if (desc.includes('etfo') || desc.includes('minds on') || desc.includes('consolidation')) {
          etfoComplianceUnits++;
        }
        if (desc.includes('flexibility') || desc.includes('flexible') || desc.includes('flexib')) {
          flexibilityUnits++;
        }
      }
    }

    console.log(`Units with Core+Extension model: ${coreExtensionUnits}/${units.length}`);
    console.log(`Units mentioning ETFO compliance: ${etfoComplianceUnits}/${units.length}`);
    console.log(`Units with built-in flexibility: ${flexibilityUnits}/${units.length}`);

    console.log('---\n');
  }

  await prisma.$disconnect();
}

simpleContentReview().catch(console.error);