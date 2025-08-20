import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFinalState() {
  try {
    console.log('🔍 VERIFYING FRENCH LANGUAGE ARTS UNITS FINAL STATE...\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        title: true,
        estimatedHours: true,
        startDate: true,
        endDate: true
      }
    });

    let totalHours = 0;
    console.log('📊 CURRENT UNITS:');
    units.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      const weeks = (lessons / 5).toFixed(1);
      totalHours += unit.estimatedHours || 0;
      
      console.log(`${index + 1}. ${unit.title}`);
      console.log(`   Hours: ${unit.estimatedHours} | Lessons: ${lessons} | Weeks: ${weeks}`);
      console.log(`   Start: ${unit.startDate.toISOString().split('T')[0]} | End: ${unit.endDate.toISOString().split('T')[0]}`);
      console.log();
    });

    console.log(`📈 TOTALS:`);
    console.log(`Total Hours: ${totalHours}`);
    console.log(`Required Hours: 146.25`);
    console.log(`Difference: ${146.25 - totalHours}`);
    
    if (totalHours === 146.25) {
      console.log('✅ PERFECT PRECISION ACHIEVED!');
    } else {
      console.log('❌ PRECISION ISSUE DETECTED');
      console.log('\n🔧 ANALYSIS:');
      console.log('The database schema defines estimatedHours as Int? (integer)');
      console.log('But we need decimal precision (14.25 hours for 19 lessons)');
      console.log('This explains why our updates are not working correctly.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFinalState();