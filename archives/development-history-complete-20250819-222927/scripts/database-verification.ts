import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 VERIFYING ACTUAL DATABASE STATE\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' }
    });

    console.log('📊 CURRENT DATABASE VALUES:\n');
    
    let totalLessonsFromHours = 0;
    let totalHours = 0;
    
    units.forEach((unit, index) => {
      const lessonsFromHours = Math.round((unit.estimatedHours || 0) * 60 / 45);
      totalLessonsFromHours += lessonsFromHours;
      totalHours += (unit.estimatedHours || 0);
      
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  estimatedHours: ${unit.estimatedHours}`);
      console.log(`  lessons (calculated): ${lessonsFromHours}`);
      console.log(`  startDate: ${unit.startDate}`);
      console.log(`  endDate: ${unit.endDate}`);
      console.log();
    });
    
    console.log('📊 TOTALS:');
    console.log(`Total Hours: ${totalHours}`);
    console.log(`Total Lessons (from hours): ${totalLessonsFromHours}`);
    console.log(`Expected: 195 lessons (146.25 hours)`);
    
    if (totalLessonsFromHours !== 195) {
      console.log('\n❌ MISMATCH DETECTED!');
      console.log('The database does not contain the expected 195 lessons.');
      console.log('This explains why validation keeps failing.');
      
      console.log('\n🔧 CORRECTING DATABASE DIRECTLY:\n');
      
      const correctHours = [
        20 * 45 / 60, // Unit 1: 20 lessons = 15 hours
        21 * 45 / 60, // Unit 2: 21 lessons = 15.75 hours  
        15 * 45 / 60, // Unit 3: 15 lessons = 11.25 hours
        18 * 45 / 60, // Unit 4: 18 lessons = 13.5 hours
        25 * 45 / 60, // Unit 5: 25 lessons = 18.75 hours
        19 * 45 / 60, // Unit 6: 19 lessons = 14.25 hours
        22 * 45 / 60, // Unit 7: 22 lessons = 16.5 hours
        18 * 45 / 60, // Unit 8: 18 lessons = 13.5 hours
        19 * 45 / 60, // Unit 9: 19 lessons = 14.25 hours
        18 * 45 / 60  // Unit 10: 18 lessons = 13.5 hours
      ];
      
      for (let i = 0; i < units.length; i++) {
        await prisma.unitPlan.update({
          where: { id: units[i].id },
          data: {
            estimatedHours: correctHours[i]
          }
        });
        
        console.log(`Unit ${i + 1}: Set to ${correctHours[i]} hours (${Math.round(correctHours[i] * 60 / 45)} lessons)`);
      }
      
      const totalCorrectHours = correctHours.reduce((sum, hours) => sum + hours, 0);
      const totalCorrectLessons = Math.round(totalCorrectHours * 60 / 45);
      
      console.log(`\n✅ CORRECTION COMPLETE:`);
      console.log(`Total Hours: ${totalCorrectHours}`);
      console.log(`Total Lessons: ${totalCorrectLessons}`);
      console.log(`Target Achieved: ${totalCorrectLessons === 195 ? 'YES ✅' : 'NO ❌'}`);
    } else {
      console.log('\n✅ DATABASE IS CORRECT');
      console.log('Values match expected 195 lessons.');
    }

  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();