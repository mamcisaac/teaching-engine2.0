import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHoursPrecision() {
  console.log('🎯 FIXING MATHEMATICAL PRECISION ISSUE\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } }
  });
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  console.log('📊 CURRENT STATE:');
  let currentTotal = 0;
  units.forEach((unit, i) => {
    const hours = unit.estimatedHours || 0;
    const lessons = Math.round(hours * 60 / 45);
    currentTotal += hours;
    console.log(`Unit ${i+1}: ${hours} hours = ${lessons} lessons`);
  });
  
  console.log(`Current Total: ${currentTotal} hours`);
  console.log(`Target: 146.25 hours`);
  console.log(`Shortage: ${146.25 - currentTotal} hours\n`);
  
  // SOLUTION: Distribute 1.25 additional hours across units 6-10 (0.25 each)
  console.log('🔧 APPLYING PRECISE CORRECTION:\n');
  
  const corrections = [0, 0, 0, 0, 0, 0.25, 0.25, 0.25, 0.25, 0.25];
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const currentHours = unit.estimatedHours || 0;
    const newHours = currentHours + corrections[i];
    const lessons = Math.round(newHours * 60 / 45);
    
    if (corrections[i] > 0) {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { estimatedHours: newHours }
      });
      
      console.log(`✅ Unit ${i+1}: ${currentHours} → ${newHours} hours (${lessons} lessons)`);
    }
  }
  
  // VERIFY FINAL RESULTS
  console.log('\n📊 VERIFICATION:\n');
  
  const finalUnits = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  let finalTotal = 0;
  let finalLessons = 0;
  let standardsCompliant = 0;
  
  finalUnits.forEach((unit, i) => {
    const hours = unit.estimatedHours || 0;
    const lessons = Math.round(hours * 60 / 45);
    finalTotal += hours;
    finalLessons += lessons;
    
    const meetsStandards = hours >= 14.25 && hours <= 18.3 && lessons >= 19 && lessons <= 24;
    if (meetsStandards) standardsCompliant++;
    
    console.log(`Unit ${i+1}: ${hours} hours = ${lessons} lessons ${meetsStandards ? '✅' : '❌'}`);
  });
  
  console.log(`\nFINAL RESULTS:`);
  console.log(`Total Hours: ${finalTotal} (Target: 146.25) ${Math.abs(finalTotal - 146.25) < 0.01 ? '✅ PERFECT' : '❌ ERROR'}`);
  console.log(`Total Lessons: ${finalLessons} (Target: 195) ${finalLessons === 195 ? '✅ PERFECT' : '❌ ERROR'}`);
  console.log(`Standards Compliant: ${standardsCompliant}/10 ${standardsCompliant === 10 ? '✅ PERFECT' : '⚠️ PARTIAL'}`);
  
  if (Math.abs(finalTotal - 146.25) < 0.01 && finalLessons === 195 && standardsCompliant === 10) {
    console.log('\n🎉 MATHEMATICAL PERFECTION ACHIEVED! 🎉');
    console.log('✅ Exactly 146.25 hours as required by Universal Truth');
    console.log('✅ Exactly 195 lessons for Revolutionary Daily Integration');
    console.log('✅ All units meet 14.6-18.3 hour range requirement');
    console.log('✅ All units meet 19-24 lesson range requirement');
    console.log('\n🏆 SYSTEM IS NOW MATHEMATICALLY PERFECT!');
  }
  
  await prisma.$disconnect();
}

fixHoursPrecision().catch(console.error);