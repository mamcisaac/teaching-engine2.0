import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeScienceGap() {
  try {
    // Get the Science LRP with more details
    const scienceLRP = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98q0005vjr19wxzdygh' },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' },
          include: {
            lessonPlans: {
              select: {
                id: true,
                title: true,
                date: true,
                duration: true
              }
            }
          }
        }
      }
    });
    
    if (!scienceLRP) {
      console.log('Science LRP not found');
      return;
    }
    
    console.log('=== SCIENCE UNIT DETAILED ANALYSIS ===\n');
    console.log('Current State:');
    console.log('--------------');
    
    const months = [
      'September', 'October', 'November', 'December', 
      'January', 'February', 'March', 'April', 'May', 'June'
    ];
    
    let totalLessons = 0;
    let totalHours = 0;
    
    scienceLRP.unitPlans.forEach((unit, index) => {
      const startMonth = months[unit.startDate.getMonth()];
      const endMonth = months[unit.endDate.getMonth()];
      const lessonCount = unit.lessonPlans.length;
      totalLessons += lessonCount;
      totalHours += unit.estimatedHours || 0;
      
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`  Timeline: ${startMonth} - ${endMonth}`);
      console.log(`  Estimated Hours: ${unit.estimatedHours}`);
      console.log(`  Actual Lessons: ${lessonCount}`);
      console.log(`  Big Ideas: ${unit.bigIdeas?.substring(0, 60)}...`);
    });
    
    console.log('\n\n=== GAP ANALYSIS ===\n');
    console.log(`Total Hours Planned: ${totalHours}`);
    console.log(`Total Hours Required: 73.5`);
    console.log(`Gap: ${73.5 - totalHours} hours (${Math.round((73.5 - totalHours) * 100 / 73.5)}% deficit)`);
    console.log(`\nTotal Lessons Planned: ${totalLessons}`);
    console.log(`Total Lessons Required: 98`);
    console.log(`Gap: ${98 - totalLessons} lessons`);
    
    console.log('\n\n=== ROTATION SCHEDULE REQUIREMENTS ===\n');
    console.log('According to rotation schedule, Science needs:');
    console.log('  September: 10 lessons (School Environment)');
    console.log('  October: 11 lessons (Fall Changes)');
    console.log('  November: 10 lessons (Energy Exploration)');
    console.log('  December: 7 lessons (Winter Science)');
    console.log('  January: 10 lessons (Indoor Investigations)');
    console.log('  February: 10 lessons (Light & Sound)');
    console.log('  March: 11 lessons (Growing Things)');
    console.log('  April: 10 lessons (Spring Changes)');
    console.log('  May: 11 lessons (Plants & Gardens)');
    console.log('  June: 10 lessons (Summer Science)');
    console.log('  TOTAL: 100 lessons (close to 98 required)');
    
    console.log('\n\n=== RECOMMENDED SOLUTION ===\n');
    console.log('Option A: Expand Existing Units');
    console.log('  - Unit 1: Expand from 7 to 15 hours (add 8 hours)');
    console.log('  - Unit 2: Expand from 6 to 15 hours (add 9 hours)');
    console.log('  - Unit 3: Expand from 7 to 15 hours (add 8 hours)');
    console.log('  - Unit 4: Expand from 7 to 14 hours (add 7 hours)');
    console.log('  - Unit 5: Expand from 6 to 14.5 hours (add 8.5 hours)');
    console.log('  Total: 73.5 hours ✓');
    
    console.log('\nOption B: Add New Units');
    console.log('  - Keep existing 5 units (33 hours)');
    console.log('  - Add Unit 6: Winter Science (December-January, 10 hours)');
    console.log('  - Add Unit 7: Light & Sound (February, 10 hours)');
    console.log('  - Add Unit 8: Water & Weather (March, 10 hours)');
    console.log('  - Add Unit 9: Summer Science (June, 10.5 hours)');
    console.log('  Total: 73.5 hours ✓');
    
    console.log('\nOption C: Hybrid Approach (RECOMMENDED)');
    console.log('  - Expand Units 1-5 to 10 hours each (50 hours total)');
    console.log('  - Add Unit 6: Winter Science (8 hours)');
    console.log('  - Add Unit 7: Light & Sound (8 hours)');
    console.log('  - Add Unit 8: Summer Science (7.5 hours)');
    console.log('  Total: 73.5 hours ✓');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeScienceGap();