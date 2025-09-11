import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit7Precision() {
  try {
    console.log('🔧 FIXING UNIT 7 MATHEMATICAL PRECISION\n');
    
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });
    
    if (!frenchLRP) throw new Error('French LRP not found');
    
    // Find Unit 7: Littérature jeunesse
    const unit7 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: frenchLRP.id,
        title: 'Littérature jeunesse'
      }
    });
    
    if (!unit7) throw new Error('Unit 7 not found');
    
    console.log(`📊 CURRENT STATE:`);
    console.log(`  Unit 7: ${unit7.title}`);
    console.log(`  Current Hours: ${unit7.estimatedHours}`);
    console.log(`  Calculated Lessons: ${Math.round((unit7.estimatedHours || 0) * 60 / 45)}`);
    console.log(`  Target Lessons: 26\n`);
    
    // Fix: Set to 19 hours so calculation gives 25.33 → 25 lessons
    // Then adjust another unit to compensate
    
    console.log('🔧 APPLYING PRECISION FIX:\n');
    
    // Update Unit 7 to 19 hours (will calculate to 25 lessons)
    await prisma.unitPlan.update({
      where: { id: unit7.id },
      data: { estimatedHours: 19 }
    });
    
    console.log('  ✅ Unit 7 adjusted to 19 hours (25 calculated lessons)');
    
    // Find Unit 8 to add the extra lesson
    const unit8 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: frenchLRP.id,
        title: 'Célébration de nos apprentissages'
      }
    });
    
    if (unit8) {
      // Update Unit 8 to 20 hours (will calculate to 27 lessons)
      await prisma.unitPlan.update({
        where: { id: unit8.id },
        data: { estimatedHours: 20 }
      });
      
      console.log('  ✅ Unit 8 adjusted to 20 hours (27 calculated lessons)');
    }
    
    // Verify the fix
    const allUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      select: { title: true, estimatedHours: true },
      orderBy: { startDate: 'asc' }
    });
    
    let totalHours = 0;
    let totalCalculatedLessons = 0;
    
    console.log('\n📊 POST-FIX VERIFICATION:\n');
    
    allUnits.forEach((unit, i) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      totalHours += unit.estimatedHours || 0;
      totalCalculatedLessons += lessons;
      console.log(`  Unit ${i + 1}: ${unit.estimatedHours}h → ${lessons} lessons`);
    });
    
    console.log(`\n📊 FINAL TOTALS:`);
    console.log(`  Total Hours: ${totalHours}`);
    console.log(`  Total Calculated Lessons: ${totalCalculatedLessons}`);
    console.log(`  Target: 195 lessons`);
    console.log(`  Status: ${totalCalculatedLessons === 195 ? '✅ PERFECT' : '❌ STILL IMPERFECT'}`);
    
    if (totalCalculatedLessons === 195) {
      console.log('\n🎉 MATHEMATICAL PRECISION ACHIEVED!');
      console.log('✅ All lesson calculations now align perfectly with target.');
    } else {
      console.log(`\n❌ Still ${Math.abs(totalCalculatedLessons - 195)} lesson(s) off target.`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing precision:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit7Precision();