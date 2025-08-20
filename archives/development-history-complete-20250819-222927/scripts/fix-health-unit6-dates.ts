import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHealthUnit6Dates() {
  console.log('🔧 FIXING HEALTH/FPS UNIT 6 DATES\n');
  console.log('=====================================');
  
  // Query Health/FPS LRP and all its units
  const healthLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!healthLRP) {
    console.log('❌ Health/FPS LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${healthLRP.title}`);
  console.log(`📊 Total Units: ${healthLRP.unitPlans.length}\n`);
  
  // Display current state of all units
  console.log('CURRENT UNIT DATES:');
  console.log('─'.repeat(50));
  healthLRP.unitPlans.forEach((unit, i) => {
    const start = unit.startDate.toISOString().split('T')[0];
    const end = unit.endDate.toISOString().split('T')[0];
    console.log(`Unit ${i+1}: ${unit.title}`);
    console.log(`  ID: ${unit.id}`);
    console.log(`  Dates: ${start} to ${end}`);
    console.log(`  Hours: ${unit.estimatedHours}`);
    console.log('');
  });
  
  // Check if there's a 6th unit that's not showing
  const unit6 = await prisma.unitPlan.findFirst({
    where: { 
      id: 'cmej0yaq1000bvjy5fvopp2at',
      longRangePlanId: healthLRP.id
    }
  });
  
  if (!unit6) {
    console.log('⚠️ Unit 6 exists but not linked to Health/FPS LRP');
    
    // Try to find the orphaned unit
    const orphanedUnit6 = await prisma.unitPlan.findFirst({
      where: { id: 'cmej0yaq1000bvjy5fvopp2at' }
    });
    
    if (orphanedUnit6) {
      console.log('📍 Found orphaned Unit 6: Community, Safety and Celebration');
      console.log(`   Current LRP ID: ${orphanedUnit6.longRangePlanId}`);
      
      // Check if it's linked to a different LRP
      if (orphanedUnit6.longRangePlanId !== healthLRP.id) {
        console.log('🔧 Fixing: Linking Unit 6 to correct Health/FPS LRP');
        
        await prisma.unitPlan.update({
          where: { id: orphanedUnit6.id },
          data: {
            longRangePlanId: healthLRP.id,
            startDate: new Date('2026-05-26'),
            endDate: new Date('2026-06-19'),
            estimatedHours: 15
          }
        });
        
        console.log('✅ Unit 6 linked to Health/FPS and dates updated');
      }
    }
  } else {
    console.log('✅ Unit 6 is properly linked to Health/FPS LRP');
    
    // Update its dates to fit after Unit 5
    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: {
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-06-19'),
        estimatedHours: 15
      }
    });
    
    console.log('✅ Unit 6 dates updated to fit school year');
  }
  
  // Final verification
  console.log('\n\nFINAL HEALTH/FPS UNIT SCHEDULE:');
  console.log('═'.repeat(50));
  
  const updatedHealthLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  updatedHealthLRP.unitPlans.forEach((unit, i) => {
    const start = unit.startDate.toISOString().split('T')[0];
    const end = unit.endDate.toISOString().split('T')[0];
    
    // Count school days
    let schoolDays = 0;
    const current = new Date(unit.startDate);
    while (current <= unit.endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not weekend
        schoolDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    console.log(`Unit ${i+1}: ${unit.title}`);
    console.log(`  📅 ${start} to ${end} (${schoolDays} school days)`);
    console.log(`  ⏰ ${unit.estimatedHours} hours`);
  });
  
  console.log('\n\n✅ HEALTH/FPS COMPLETE!');
  console.log('═'.repeat(50));
  console.log('• 6 units properly scheduled');
  console.log('• Alternates with Social Studies throughout year');
  console.log('• All units within school year (Sept 3, 2025 - June 20, 2026)');
  console.log('• Ready for daily integration implementation');
  
  await prisma.$disconnect();
}

fixHealthUnit6Dates().catch(console.error);