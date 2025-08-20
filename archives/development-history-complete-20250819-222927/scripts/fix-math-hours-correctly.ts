import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMathHoursCorrectly() {
  console.log('🔧 FIXING MATH UNIT HOURS TO REACH 146.25 TARGET...\n');
  
  try {
    // Correct distribution to reach 146 hours (closest to 146.25)
    // Units 1-2: 17 hours each = 34 hours
    // Units 3-8: 16 hours each = 96 hours  
    // Unit 9: 16 hours = 16 hours
    // Total: 146 hours (only 0.25 under target - true rounding difference)
    
    const hourDistribution = [
      { id: 'cmebyc9ii0001vjrfkhn13dd1', hours: 17, name: 'Unit 1: Numbers All Around Us' },
      { id: 'cmebyc9im0003vjrf4bfhlo1z', hours: 17, name: 'Unit 2: Making Sense of Numbers' },
      { id: 'cmebyc9io0005vjrfypcwi41t', hours: 16, name: 'Unit 3: Patterns and Shapes' },
      { id: 'cmebyc9iq0007vjrfjbgwmvcv', hours: 16, name: 'Unit 4: Adding and Subtracting' },
      { id: 'cmebyc9ir0009vjrf5bl8l49w', hours: 16, name: 'Unit 5: Mental Math Strategies' },
      { id: 'cmebyc9is000bvjrfmge2bn8k', hours: 16, name: 'Unit 6: Measurement Exploration' },
      { id: 'cmebyc9it000dvjrfyiqtwj9b', hours: 16, name: 'Unit 7: Problem Solving Adventures' },
      { id: 'cmebyc9iu000fvjrfjz3ykc52', hours: 16, name: 'Unit 8: Math Celebration' },
      { id: 'cmeh9o5sg0001vjv00jatq9zn', hours: 16, name: 'Unit 9: Data Collection and Organization' }
    ];
    
    console.log('📊 APPLYING CORRECTED HOUR DISTRIBUTION:\n');
    console.log('Target: 146.25 hours (195 lessons × 45 min ÷ 60)');
    console.log('Integer constraint: Must use whole numbers');
    console.log('Solution: 2 units × 17 hours + 7 units × 16 hours = 146 hours\n');
    
    for (const unit of hourDistribution) {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { estimatedHours: unit.hours }
      });
      console.log(`✅ ${unit.name}: ${unit.hours} hours`);
    }
    
    // Calculate total
    const total = hourDistribution.reduce((sum, unit) => sum + unit.hours, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION:');
    console.log('='.repeat(60));
    console.log(`Total Hours Allocated: ${total}`);
    console.log(`Target Hours: 146.25`);
    console.log(`Difference: ${total - 146.25} hours`);
    console.log(`Status: ${Math.abs(total - 146.25) <= 0.25 ? '✅ PERFECT (true rounding difference only)' : '❌ Still needs adjustment'}`);
    
    // Convert to lessons for verification
    const totalLessons = Math.round(total * 60 / 45);
    console.log(`\nLesson Verification:`);
    console.log(`Total Lessons (based on hours): ${totalLessons}`);
    console.log(`Required Lessons: 195`);
    console.log(`Match: ${totalLessons === 195 ? '✅ EXACT MATCH!' : `Off by ${195 - totalLessons} lessons`}`);
    
    console.log('\n✨ MATH HOURS CORRECTION COMPLETE! ✨');
    
  } catch (error) {
    console.error('❌ Error fixing math hours:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMathHoursCorrectly();