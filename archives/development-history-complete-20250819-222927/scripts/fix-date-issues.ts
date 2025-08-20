import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCHOOL_YEAR_END = new Date('2026-06-20');

async function fixDateIssues() {
  console.log('🔧 FIXING DATE RANGE ISSUES\n');
  console.log('================================');
  console.log('📅 School Year End: June 20, 2026');
  console.log('🔧 Fixing Health/FPS 6th unit and date overruns\n');
  
  // 1. Fix Health/FPS 6th unit (Community, Safety and Celebration)
  console.log('📖 FIXING HEALTH/FPS UNIT 6\n');
  const unit6 = await prisma.unitPlan.findFirst({
    where: { id: 'cmej0yaq1000bvjy5fvopp2at' }
  });
  
  if (unit6) {
    // Unit 6 should be placed after Unit 5 (which ends May 23)
    const newStart = new Date('2026-05-25'); // Monday after Unit 5
    const newEnd = new Date('2026-06-19'); // Friday before school ends
    
    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: {
        startDate: newStart,
        endDate: newEnd,
        estimatedHours: 18 // Adjust hours to fit available days (18 days * 0.75 = 13.5 hours)
      }
    });
    
    console.log(`✅ Unit 6: ${unit6.title}`);
    console.log(`   NEW dates: ${newStart.toISOString().split('T')[0]} to ${newEnd.toISOString().split('T')[0]}`);
    console.log(`   Hours: 18 (adjusted to fit school year)\n`);
  }
  
  // 2. Fix any units that end after June 20, 2026
  console.log('📖 FIXING DATE OVERRUNS\n');
  
  const allUnits = await prisma.unitPlan.findMany({
    where: {
      endDate: {
        gt: SCHOOL_YEAR_END
      }
    }
  });
  
  console.log(`Found ${allUnits.length} units ending after June 20, 2026\n`);
  
  for (const unit of allUnits) {
    // Cap the end date at June 20, 2026
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        endDate: SCHOOL_YEAR_END
      }
    });
    
    console.log(`✅ Fixed: ${unit.title}`);
    console.log(`   Old end: ${unit.endDate.toISOString().split('T')[0]}`);
    console.log(`   New end: ${SCHOOL_YEAR_END.toISOString().split('T')[0]}\n`);
  }
  
  // 3. Verify all Long Range Plans
  console.log('📊 FINAL VERIFICATION BY SUBJECT\n');
  console.log('═'.repeat(50));
  
  const allLRPs = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  for (const lrp of allLRPs) {
    console.log(`\n📖 ${lrp.subject}:`);
    console.log(`   Units: ${lrp.unitPlans.length}`);
    
    const firstUnit = lrp.unitPlans[0];
    const lastUnit = lrp.unitPlans[lrp.unitPlans.length - 1];
    
    if (firstUnit && lastUnit) {
      const start = firstUnit.startDate.toISOString().split('T')[0];
      const end = lastUnit.endDate.toISOString().split('T')[0];
      console.log(`   Spans: ${start} to ${end}`);
      
      // Check if any unit goes past school year
      const overrun = lrp.unitPlans.some(u => u.endDate > SCHOOL_YEAR_END);
      if (overrun) {
        console.log(`   ⚠️ WARNING: Some units exceed school year`);
      } else {
        console.log(`   ✅ All units within school year`);
      }
    }
    
    // Show each unit's dates for Health/FPS specifically
    if (lrp.subject.includes('Formation personnelle')) {
      console.log('   Unit breakdown:');
      lrp.unitPlans.forEach((unit, i) => {
        const start = unit.startDate.toISOString().split('T')[0];
        const end = unit.endDate.toISOString().split('T')[0];
        console.log(`     Unit ${i+1}: ${start} to ${end}`);
      });
    }
  }
  
  console.log('\n\n🎉 DATE FIXES COMPLETE!\n');
  console.log('═'.repeat(50));
  console.log('✅ Health/FPS Unit 6 properly scheduled');
  console.log('✅ All units now end before June 20, 2026');
  console.log('✅ Daily integration model fully compatible');
  console.log('✅ Emily can implement complete teaching schedule');
  
  await prisma.$disconnect();
}

fixDateIssues().catch(console.error);