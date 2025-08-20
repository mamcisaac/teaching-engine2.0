import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyMathUnits() {
  console.log('📊 ANALYZING EMILY\'S CURRENT MATH UNITS FOR PERFECTION\n');
  console.log('=' .repeat(80));
  
  try {
    // Get Emily's Math LRP
    const mathLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Mathématiques'
      }
    });
    
    if (!mathLRP) {
      console.log('❌ No Math LRP found for Emily');
      return;
    }
    
    // Get all Math units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: mathLRP.id
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Found ${units.length} Math units:\n`);
    
    units.forEach((unit, index) => {
      const duration = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = (duration / 7).toFixed(1);
      const lessonsNeeded = Math.round(unit.estimatedHours! / 0.75);
      
      console.log(`UNIT ${index + 1}: ${unit.title}`);
      console.log(`  ID: ${unit.id}`);
      console.log(`  Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`  Duration: ${duration} days (${weeks} weeks)`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Lessons needed: ${lessonsNeeded}`);
      console.log(`  Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
      
      // Check for flexibility issues
      const issues = [];
      if (parseFloat(weeks) > 4) issues.push('❌ ETFO violation: > 4 weeks');
      if (parseFloat(weeks) < 2) issues.push('⚠️ Very short unit');
      if (!unit.differentiationStrategies) issues.push('❌ No differentiation');
      if (lessonsNeeded !== Math.round(unit.estimatedHours! / 0.75)) issues.push('❌ Math error');
      
      // Check for real flexibility markers
      const hasFlexibility = unit.description?.includes('flex') || 
                            unit.assessmentPlan?.includes('FLEX') ||
                            unit.assessmentPlan?.includes('buffer');
      
      if (!hasFlexibility) issues.push('❌ No flexibility built in');
      
      if (issues.length > 0) {
        console.log(`  ISSUES: ${issues.join(', ')}`);
      } else {
        console.log(`  ✅ Appears compliant`);
      }
      
      // Check essential questions
      const essentialQs = unit.essentialQuestions as string[] || [];
      console.log(`  Essential Questions: ${essentialQs.length} questions`);
      if (essentialQs.length > 0) {
        essentialQs.forEach(q => {
          const wordCount = q.split(' ').length;
          if (wordCount > 6) {
            console.log(`    ⚠️ Too long (${wordCount} words): "${q.substring(0, 30)}..."`);
          }
        });
      }
      
      console.log('');
    });
    
    // Summary statistics
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const totalExpectations = new Set(units.flatMap(u => u.expectations.map(e => e.expectation.code))).size;
    
    console.log('=' .repeat(80));
    console.log('SUMMARY:');
    console.log(`Total units: ${units.length}`);
    console.log(`Total hours: ${totalHours} (Target: 117 core + 29.25 flex = 146.25)`);
    console.log(`Unique expectations covered: ${totalExpectations}/14`);
    
    const etfoViolations = units.filter(u => {
      const weeks = (Math.ceil((u.endDate.getTime() - u.startDate.getTime()) / (1000 * 60 * 60 * 24)) / 7);
      return weeks > 4;
    });
    
    console.log(`ETFO violations: ${etfoViolations.length} units exceed 4 weeks`);
    
    const flexibleUnits = units.filter(u => 
      u.description?.includes('flex') || 
      u.assessmentPlan?.includes('flex') ||
      u.assessmentPlan?.includes('buffer')
    ).length;
    
    console.log(`Units with flexibility: ${flexibleUnits}/${units.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyMathUnits();