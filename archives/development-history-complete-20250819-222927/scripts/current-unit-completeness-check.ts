import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentCompleteness() {
  console.log('🔍 CURRENT UNIT COMPLETENESS DETAILED ANALYSIS');
  console.log('===============================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  let overallComplete = 0;
  let overallTotal = 0;

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()}`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      select: {
        id: true,
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
      }
    });

    console.log(`Units found: ${units.length}`);
    
    let subjectMissingFields = [];
    
    for (const [index, unit] of units.entries()) {
      const missingFields = [];
      
      if (!unit.description) missingFields.push('description');
      if (!unit.bigIdeas) missingFields.push('bigIdeas');
      if (!unit.essentialQuestions) missingFields.push('essentialQuestions');
      if (!unit.successCriteria) missingFields.push('successCriteria');
      if (!unit.assessmentPlan) missingFields.push('assessmentPlan');
      if (!unit.differentiationStrategies) missingFields.push('differentiationStrategies');
      if (!unit.indigenousPerspectives) missingFields.push('indigenousPerspectives');
      if (!unit.keyVocabulary) missingFields.push('keyVocabulary');

      const fieldsPresent = 8 - missingFields.length;
      const completionPercent = Math.round((fieldsPresent / 8) * 100);

      console.log(`  Unit ${index + 1}: "${unit.title}" - ${completionPercent}% complete (${fieldsPresent}/8 fields)`);
      if (missingFields.length > 0) {
        console.log(`    Missing: ${missingFields.join(', ')}`);
        subjectMissingFields.push(...missingFields);
      }

      // Check date range alignment
      if (unit.startDate && unit.endDate && unit.estimatedHours) {
        const daysBetween = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const expectedDays = Math.ceil(unit.estimatedHours / 0.75);
        if (Math.abs(daysBetween - expectedDays) > 3) {
          console.log(`    ⚠️ Date range mismatch: ${daysBetween} days vs ${expectedDays} expected`);
        }
      }

      overallTotal += 8;
      overallComplete += fieldsPresent;
    }

    // Calculate subject completion
    const subjectTotal = units.length * 8;
    const subjectPresent = subjectTotal - subjectMissingFields.length;
    const subjectCompletion = Math.round((subjectPresent / subjectTotal) * 100);
    
    console.log(`\n${subject.name} Summary:`);
    console.log(`  Overall completion: ${subjectCompletion}%`);
    console.log(`  Average hours per unit: ${Math.round(units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) / units.length * 10) / 10}`);
    
    // Count common missing fields
    const fieldCounts = {};
    subjectMissingFields.forEach(field => {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });
    
    if (Object.keys(fieldCounts).length > 0) {
      console.log(`  Most missing fields: ${Object.entries(fieldCounts).map(([field, count]) => `${field}(${count})`).join(', ')}`);
    }
    
    console.log('---\n');
  }

  // Overall system assessment  
  const systemCompletion = Math.round((overallComplete / overallTotal) * 100);
  console.log(`🎯 SYSTEM WIDE ASSESSMENT`);
  console.log(`Overall completion: ${systemCompletion}%`);
  console.log(`Total fields: ${overallTotal}`);
  console.log(`Complete fields: ${overallComplete}`);
  console.log(`Missing fields: ${overallTotal - overallComplete}`);

  await prisma.$disconnect();
}

checkCurrentCompleteness().catch(console.error);