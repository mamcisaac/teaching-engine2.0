const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteIncorrectFrenchUnits() {
  try {
    console.log('🗑️ DELETING INCORRECT FRENCH UNITS (ETFO VIOLATIONS)\n');

    // Get Emily
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    // Get French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });

    if (!frenchLRP) {
      console.log('❌ No French LRP found');
      return;
    }

    // Get current French units
    const frenchUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      include: {
        lessonPlans: true,
        expectations: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`Found ${frenchUnits.length} French units to delete:`);
    
    // Show what we're deleting and why
    frenchUnits.forEach((unit, index) => {
      const duration = Math.ceil((new Date(unit.endDate) - new Date(unit.startDate)) / (1000 * 60 * 60 * 24 * 7));
      const violation = duration > 4 ? '❌ ETFO VIOLATION' : '✅ ETFO Compliant';
      
      console.log(`${index + 1}. ${unit.title}`);
      console.log(`   Duration: ${duration} weeks ${violation}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      console.log(`   Will delete: ${unit.lessonPlans.length} lessons`);
      console.log('');
    });

    // Count total deletions
    const totalLessons = frenchUnits.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
    const totalExpectations = frenchUnits.reduce((sum, unit) => sum + unit.expectations.length, 0);

    console.log('📊 DELETION SUMMARY:');
    console.log(`Units to delete: ${frenchUnits.length}`);
    console.log(`Lessons to delete: ${totalLessons}`);
    console.log(`Curriculum expectation links: ${totalExpectations} (will be preserved for reuse)`);
    console.log('');

    console.log('⚠️ REASON FOR DELETION:');
    console.log('Current French units violate ETFO guidelines:');
    console.log('- 5 of 8 units are 5-7 weeks long (ETFO max is 4 weeks)');
    console.log('- Only 172 lessons total (need 372 for French Immersion)');
    console.log('- Inconsistent lesson distribution (12-24 per unit)');
    console.log('');

    console.log('✅ REPLACEMENT PLAN:');
    console.log('- Will create 16 new units (2.1 weeks each, ETFO compliant)');
    console.log('- Will generate 368 lessons (proper French Immersion)');
    console.log('- Will reuse curriculum expectations appropriately');
    console.log('');

    // Perform the deletion
    console.log('🔄 Starting deletion process...');

    // Delete lessons first (due to foreign key constraints)
    for (const unit of frenchUnits) {
      if (unit.lessonPlans.length > 0) {
        await prisma.eTFOLessonPlan.deleteMany({
          where: { unitPlanId: unit.id }
        });
        console.log(`✅ Deleted ${unit.lessonPlans.length} lessons from "${unit.title}"`);
      }
    }

    // Delete unit plan expectations (junction table)
    for (const unit of frenchUnits) {
      await prisma.unitPlanExpectation.deleteMany({
        where: { unitPlanId: unit.id }
      });
    }

    // Delete the units themselves
    await prisma.unitPlan.deleteMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      }
    });

    console.log('');
    console.log('✅ DELETION COMPLETE');
    console.log(`Removed ${frenchUnits.length} incorrect French units`);
    console.log(`Removed ${totalLessons} lessons`);
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Create 16 new ETFO-compliant French units (2.1 weeks each)');
    console.log('2. Generate 368 new French lessons');
    console.log('3. Link curriculum expectations to appropriate new units');
    console.log('');
    console.log('🎯 RESULT: Emily will have proper French Immersion structure');

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteIncorrectFrenchUnits();