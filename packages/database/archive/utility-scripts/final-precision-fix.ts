import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalPrecisionFix() {
  try {
    console.log('🎯 FINAL PRECISION FIX: Achieving Exactly 195 Lessons\n');
    
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
    
    // Find Unit 6: Écriture créative  
    const unit6 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: frenchLRP.id,
        title: 'Écriture créative'
      }
    });
    
    if (!unit6) throw new Error('Unit 6 not found');
    
    console.log('🔧 APPLYING FINAL ADJUSTMENT:\n');
    console.log(`  Current Unit 6: ${unit6.estimatedHours}h → ${Math.round((unit6.estimatedHours || 0) * 60 / 45)} lessons`);
    
    // Reduce Unit 6 from 19 hours to 18 hours (25 → 24 lessons)
    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: { estimatedHours: 18 }
    });
    
    console.log('  ✅ Unit 6 reduced to 18h → 24 lessons\n');
    
    // Final verification
    const allUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      select: { title: true, estimatedHours: true },
      orderBy: { startDate: 'asc' }
    });
    
    let totalHours = 0;
    let totalCalculatedLessons = 0;
    
    console.log('📊 ULTIMATE VERIFICATION:\n');
    
    allUnits.forEach((unit, i) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      totalHours += unit.estimatedHours || 0;
      totalCalculatedLessons += lessons;
      console.log(`  Unit ${i + 1}: ${unit.title}`);
      console.log(`    ${unit.estimatedHours}h → ${lessons} lessons`);
    });
    
    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`🎯 FINAL MATHEMATICAL VERIFICATION:`);
    console.log(`  Total Hours: ${totalHours}`);
    console.log(`  Total Calculated Lessons: ${totalCalculatedLessons}`);
    console.log(`  Target: 195 lessons`);
    console.log(`  Difference: ${totalCalculatedLessons - 195}`);
    console.log(`  Status: ${totalCalculatedLessons === 195 ? '✅ MATHEMATICALLY PERFECT' : '❌ STILL IMPERFECT'}`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    if (totalCalculatedLessons === 195) {
      console.log('\n🏆 PERFECTION ACHIEVED!');
      console.log('✅ Revolutionary French Language Arts system is now mathematically perfect.');
      console.log('✅ Exactly 195 lessons calculated from stored hours.');
      console.log('✅ System integrity restored.');
      console.log('✅ Ready for implementation.');
    } else {
      console.log(`\n❌ PERFECTION NOT YET ACHIEVED`);
      console.log(`Still ${Math.abs(totalCalculatedLessons - 195)} lesson(s) off target.`);
    }
    
  } catch (error) {
    console.error('❌ Error in final precision fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalPrecisionFix();