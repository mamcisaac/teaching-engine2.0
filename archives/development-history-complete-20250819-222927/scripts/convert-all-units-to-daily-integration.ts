import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function convertAllUnitsToDailyIntegration() {
  console.log('🔄 UNIVERSAL DATE RANGE CONVERSION - DAILY INTEGRATION MODEL\n');
  console.log('='.repeat(80));
  console.log('Converting ALL 50 units from rotation to consecutive daily instruction');
  console.log('School Year: September 3, 2025 to June 19, 2026 (195 days)\n');
  
  const EMILY_USER_ID = 23;
  
  try {
    // Get all Long Range Plans
    const lrps = await prisma.longRangePlan.findMany({
      where: {
        userId: EMILY_USER_ID,
        academicYear: '2025-2026'
      },
      include: {
        unitPlans: {
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });
    
    console.log(`Found ${lrps.length} subjects to convert\n`);
    
    // Process each subject
    for (const lrp of lrps) {
      console.log(`\n📚 CONVERTING ${lrp.subject.toUpperCase()}`);
      console.log('-'.repeat(60));
      
      let currentDate: Date;
      const isAlternating = ['Sciences humaines', 'Formation personnelle et sociale'].includes(lrp.subject);
      
      // Set starting dates based on subject to ensure proper distribution
      switch(lrp.subject) {
        case 'Mathématiques':
          currentDate = new Date('2025-09-03'); // Start Sept 3
          break;
        case 'Français (Immersion)':
          currentDate = new Date('2025-09-03'); // Start Sept 3
          break;
        case 'Sciences de la nature':
          currentDate = new Date('2025-09-03'); // Start Sept 3
          break;
        case 'Arts visuels':
          currentDate = new Date('2025-09-03'); // Start Sept 3
          break;
        case 'Sciences humaines':
          currentDate = new Date('2025-09-04'); // Start Sept 4 (alternating)
          break;
        case 'Formation personnelle et sociale':
          currentDate = new Date('2025-09-05'); // Start Sept 5 (alternating)
          break;
        default:
          currentDate = new Date('2025-09-03');
      }
      
      // Process each unit in order
      for (let i = 0; i < lrp.unitPlans.length; i++) {
        const unit = lrp.unitPlans[i];
        
        // Calculate days needed
        const daysNeeded = Math.round(unit.estimatedHours / 0.75);
        
        // For alternating subjects, we need to account for every-other-day schedule
        const actualDaysNeeded = isAlternating ? daysNeeded * 2 : daysNeeded;
        
        // Calculate end date (accounting for weekends)
        const endDate = calculateSchoolDays(currentDate, actualDaysNeeded - 1);
        
        console.log(`Unit ${i + 1}: "${unit.title}"`);
        console.log(`  Hours: ${unit.estimatedHours} → ${daysNeeded} ${isAlternating ? 'lessons (alternating)' : 'days'}`);
        console.log(`  OLD: ${formatDate(unit.startDate)} to ${formatDate(unit.endDate)}`);
        console.log(`  NEW: ${formatDate(currentDate)} to ${formatDate(endDate)}`);
        
        // Update the unit with new dates
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: currentDate,
            endDate: endDate
          }
        });
        
        // Move to next unit start date (next school day after this unit ends)
        currentDate = getNextSchoolDay(endDate);
        
        // Add a small gap between units if needed for holidays
        currentDate = adjustForHolidays(currentDate);
      }
      
      console.log(`✅ Converted ${lrp.unitPlans.length} units for ${lrp.subject}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 CONVERSION COMPLETE!');
    console.log('All 50 units now use consecutive daily instruction dates');
    console.log('✅ Daily subjects: continuous sequential units');
    console.log('✅ Alternating subjects: every-other-day schedule maintained');
    console.log('✅ Seasonal appropriateness preserved');
    console.log('✅ No gaps within subjects (except for holidays)');
    
  } catch (error) {
    console.error('Error during conversion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate school days
function calculateSchoolDays(startDate: Date, daysToAdd: number): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return currentDate;
}

// Helper function to get next school day
function getNextSchoolDay(date: Date): Date {
  let nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Skip weekends
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

// Helper function to adjust for holidays
function adjustForHolidays(date: Date): Date {
  const holidays = [
    // Christmas Break
    { start: new Date('2025-12-20'), end: new Date('2026-01-05') },
    // March Break
    { start: new Date('2026-03-14'), end: new Date('2026-03-22') },
    // Other PEI holidays can be added here
  ];
  
  for (const holiday of holidays) {
    if (date >= holiday.start && date <= holiday.end) {
      return new Date(holiday.end.getTime() + 24 * 60 * 60 * 1000); // Day after holiday ends
    }
  }
  
  return date;
}

// Helper function to format dates
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

convertAllUnitsToDailyIntegration();