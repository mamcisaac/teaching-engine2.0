import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getActualSchoolDays(startDate: Date, endDate: Date): number {
  let schoolDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      schoolDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return schoolDays;
}

async function ultrathinkPerfect195() {
  try {
    console.log('🎯 ULTRATHINK PERFECT 195: EXACT SOLUTION\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' }
    });

    // EXACT INTEGER HOURS FOR PRECISELY 195 LESSONS
    // Testing different combinations to get exactly 195
    const perfectHours = [
      { hours: 15, lessons: 20 }, // Unit 1: 15*60/45 = 20
      { hours: 17, lessons: 23 }, // Unit 2: 17*60/45 = 22.67 → 23
      { hours: 10, lessons: 13 }, // Unit 3: 10*60/45 = 13.33 → 13
      { hours: 14, lessons: 19 }, // Unit 4: 14*60/45 = 18.67 → 19
      { hours: 19, lessons: 25 }, // Unit 5: 19*60/45 = 25.33 → 25
      { hours: 13, lessons: 17 }, // Unit 6: 13*60/45 = 17.33 → 17
      { hours: 19, lessons: 25 }, // Unit 7: 19*60/45 = 25.33 → 25
      { hours: 15, lessons: 20 }, // Unit 8: 15*60/45 = 20
      { hours: 15, lessons: 20 }, // Unit 9: 15*60/45 = 20
      { hours: 10, lessons: 13 }  // Unit 10: 10*60/45 = 13.33 → 13
    ];

    console.log('📊 EXACT CALCULATION VERIFICATION:\n');
    let totalCalculated = 0;
    perfectHours.forEach((unit, index) => {
      const actualLessons = Math.round(unit.hours * 60 / 45);
      totalCalculated += actualLessons;
      console.log(`Unit ${index + 1}: ${unit.hours} hours → ${actualLessons} lessons`);
    });
    
    console.log(`\nTOTAL: ${totalCalculated} lessons (Target: 195)\n`);

    if (totalCalculated === 195) {
      console.log('✅ PERFECT! Applying to database...\n');
      
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        const hours = perfectHours[i].hours;
        const lessons = Math.round(hours * 60 / 45);
        const actualDays = getActualSchoolDays(new Date(unit.startDate), new Date(unit.endDate));
        const buffer = actualDays - lessons;
        
        console.log(`Unit ${i + 1}: ${unit.title}`);
        console.log(`  ${hours} hours = ${lessons} lessons`);
        console.log(`  School days: ${actualDays}, Buffer: ${buffer}`);
        
        let strategy = "";
        if (buffer < 0) {
          strategy = `INTENSIVE: ${Math.abs(buffer)} days with 2 French lessons`;
        } else if (buffer === 0) {
          strategy = "PERFECT FIT: One lesson per day";
        } else {
          strategy = `FLEXIBLE: ${buffer} buffer day(s) available`;
        }
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: hours,
            differentiationStrategies: {
              implementation: strategy,
              buffer: buffer,
              intensive: buffer < 0,
              flexible: buffer > 0
            }
          }
        });
        
        console.log(`  Strategy: ${strategy}`);
        console.log(`  ✅ Updated\n`);
      }
      
      console.log('🎉 ULTRATHINK PERFECT 195 ACHIEVED! 🎉');
    } else {
      console.log('❌ Need to adjust calculation...');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ultrathinkPerfect195();