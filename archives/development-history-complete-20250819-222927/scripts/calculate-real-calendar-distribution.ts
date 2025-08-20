import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateRealCalendarDistribution() {
  try {
    console.log('🎯 PHASE 1: Calculating Real School Calendar Distribution');
    console.log('Fixing fatal scheduling flaws with mathematical precision');
    
    // Real school calendar from DAILY_SCHEDULE_FINAL.md
    const schoolCalendar = [
      { month: 'September', year: 2025, teachingDays: 19, startDate: new Date('2025-09-02') },
      { month: 'October', year: 2025, teachingDays: 21, startDate: new Date('2025-10-01') },
      { month: 'November', year: 2025, teachingDays: 20, startDate: new Date('2025-11-01') },
      { month: 'December', year: 2025, teachingDays: 14, startDate: new Date('2025-12-01') }, // Christmas break
      { month: 'January', year: 2026, teachingDays: 20, startDate: new Date('2026-01-06') }, // Return after break
      { month: 'February', year: 2026, teachingDays: 19, startDate: new Date('2026-02-01') },
      { month: 'March', year: 2026, teachingDays: 21, startDate: new Date('2026-03-01') },
      { month: 'April', year: 2026, teachingDays: 20, startDate: new Date('2026-04-01') },
      { month: 'May', year: 2026, teachingDays: 21, startDate: new Date('2026-05-01') },
      { month: 'June', year: 2026, teachingDays: 20, startDate: new Date('2026-06-01') }
    ];

    console.log('\\n📅 REAL SCHOOL CALENDAR:');
    let totalTeachingDays = 0;
    for (const month of schoolCalendar) {
      totalTeachingDays += month.teachingDays;
      console.log(`  ${month.month} ${month.year}: ${month.teachingDays} teaching days`);
    }
    console.log(`  TOTAL: ${totalTeachingDays} teaching days`);

    // Calculate Social Studies lessons per month (every other day, starting with SS)
    console.log('\\n📊 SOCIAL STUDIES LESSON DISTRIBUTION:');
    console.log('Every-other-day pattern: Day 1,3,5,7,9... = Social Studies');
    
    let totalSSLessons = 0;
    const monthlySSLessons = [];
    
    for (const month of schoolCalendar) {
      // For odd-day months, Social Studies gets the extra lesson
      let ssLessons;
      if (month.teachingDays % 2 === 1) {
        ssLessons = Math.ceil(month.teachingDays / 2); // Round up for odd months
      } else {
        ssLessons = month.teachingDays / 2; // Even split for even months
      }
      
      totalSSLessons += ssLessons;
      monthlySSLessons.push({
        month: month.month,
        year: month.year,
        teachingDays: month.teachingDays,
        ssLessons: ssLessons,
        startDate: month.startDate
      });
      
      console.log(`  ${month.month}: ${month.teachingDays} days → ${ssLessons} SS lessons`);
    }
    
    console.log(`\\n📈 TOTAL SOCIAL STUDIES LESSONS: ${totalSSLessons}`);
    console.log(`Target: 97 lessons`);
    console.log(`Difference: ${totalSSLessons - 97} lessons`);

    // Adjust to exactly 97 lessons
    console.log('\\n🔧 ADJUSTING TO EXACTLY 97 LESSONS:');
    
    if (totalSSLessons > 97) {
      const excess = totalSSLessons - 97;
      console.log(`Need to remove ${excess} lessons from calculation`);
      
      // Remove from June (last month) first
      if (monthlySSLessons[monthlySSLessons.length - 1].ssLessons >= excess) {
        monthlySSLessons[monthlySSLessons.length - 1].ssLessons -= excess;
        console.log(`Removed ${excess} lessons from June`);
      } else {
        // More complex adjustment needed
        let remaining = excess;
        for (let i = monthlySSLessons.length - 1; i >= 0 && remaining > 0; i--) {
          if (monthlySSLessons[i].ssLessons > 0) {
            const reduction = Math.min(remaining, 1);
            monthlySSLessons[i].ssLessons -= reduction;
            remaining -= reduction;
            console.log(`Removed ${reduction} lesson from ${monthlySSLessons[i].month}`);
          }
        }
      }
    } else if (totalSSLessons < 97) {
      const deficit = 97 - totalSSLessons;
      console.log(`Need to add ${deficit} lessons to calculation`);
      
      // Add to months with room
      let remaining = deficit;
      for (let i = 0; i < monthlySSLessons.length && remaining > 0; i++) {
        if (monthlySSLessons[i].ssLessons < Math.ceil(monthlySSLessons[i].teachingDays / 2)) {
          monthlySSLessons[i].ssLessons += 1;
          remaining -= 1;
          console.log(`Added 1 lesson to ${monthlySSLessons[i].month}`);
        }
      }
    }

    // Recalculate total
    const finalTotal = monthlySSLessons.reduce((sum, month) => sum + month.ssLessons, 0);
    console.log(`\\n✅ FINAL TOTAL: ${finalTotal} lessons`);

    if (finalTotal === 97) {
      console.log('🎉 Perfect! Exactly 97 Social Studies lessons achieved');
    } else {
      console.log(`❌ Still off by ${finalTotal - 97} lessons`);
    }

    console.log('\\n📋 CORRECTED MONTHLY DISTRIBUTION:');
    for (const month of monthlySSLessons) {
      console.log(`  ${month.month} ${month.year}: ${month.ssLessons} lessons`);
    }

    // Define Christmas break boundaries
    console.log('\\n🎄 CHRISTMAS BREAK CONSTRAINTS:');
    const christmasBreak = {
      start: new Date('2025-12-19'), // Estimate - school usually ends Dec 19
      end: new Date('2026-01-05'),   // Return Jan 6
      description: 'No teaching during Christmas break'
    };
    
    console.log(`Christmas Break: ${christmasBreak.start.toDateString()} - ${christmasBreak.end.toDateString()}`);
    console.log('Units cannot span this period');

    // Calculate optimal unit structure
    console.log('\\n🏗️ OPTIMAL 7-UNIT STRUCTURE DESIGN:');
    
    const units = [
      {
        title: 'Notre école communautaire',
        period: 'September',
        lessons: 10, // September only
        rationale: 'Full September + start strong'
      },
      {
        title: 'Les aides de notre quartier', 
        period: 'October',
        lessons: 11, // October only
        rationale: 'Community helpers in fall'
      },
      {
        title: 'Nos familles et traditions',
        period: 'November + early December',
        lessons: 17, // November (10) + early December (7)
        rationale: 'Family traditions before Christmas'
      },
      // Christmas Break Gap
      {
        title: 'Notre quartier et notre ville',
        period: 'January + early February', 
        lessons: 15, // January (10) + early February (5)
        rationale: 'New year, explore community'
      },
      {
        title: 'Géographie et cartographie',
        period: 'February + early March',
        lessons: 15, // Late February (5) + early March (10)
        rationale: 'Geography and mapping skills'
      },
      {
        title: 'Citoyenneté et responsabilité',
        period: 'March + April',
        lessons: 21, // Late March (1) + April (10) + early May (10)
        rationale: 'Citizenship and responsibility'
      },
      {
        title: 'Notre monde connecté',
        period: 'May + June',
        lessons: 8, // Late May (1) + June (7)
        rationale: 'Global connections to end year'
      }
    ];

    // Adjust lesson distribution to total exactly 97
    let unitTotal = units.reduce((sum, unit) => sum + unit.lessons, 0);
    console.log(`Initial unit total: ${unitTotal} lessons`);
    
    // Need to adjust - let me recalculate more precisely
    const adjustedUnits = [
      { title: 'Notre école communautaire', lessons: 10, period: 'September' },
      { title: 'Les aides de notre quartier', lessons: 11, period: 'October' }, 
      { title: 'Nos familles et traditions', lessons: 17, period: 'November + early December' },
      { title: 'Notre quartier et notre ville', lessons: 15, period: 'January + early February' },
      { title: 'Géographie et cartographie', lessons: 14, period: 'Late February + early March' },
      { title: 'Citoyenneté et responsabilité', lessons: 15, period: 'March + April' },
      { title: 'Notre monde connecté', lessons: 15, period: 'May + June' }
    ];

    unitTotal = adjustedUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    console.log(`\\nAdjusted unit total: ${unitTotal} lessons`);

    if (unitTotal === 97) {
      console.log('✅ Perfect distribution across 7 units');
    } else {
      console.log(`❌ Need further adjustment: ${unitTotal - 97} lesson difference`);
    }

    console.log('\\n📚 PROPOSED UNIT STRUCTURE:');
    for (let i = 0; i < adjustedUnits.length; i++) {
      const unit = adjustedUnits[i];
      const hours = (unit.lessons * 0.75).toFixed(2);
      console.log(`  Unit ${i+1}: ${unit.title}`);
      console.log(`    Period: ${unit.period}`);
      console.log(`    Lessons: ${unit.lessons}`);
      console.log(`    Hours: ${hours}`);
    }

    const totalHours = adjustedUnits.reduce((sum, unit) => sum + (unit.lessons * 0.75), 0);
    console.log(`\\n📊 TOTALS:`);
    console.log(`  Lessons: ${unitTotal}/97`);
    console.log(`  Hours: ${totalHours.toFixed(2)}/72.75`);
    console.log(`  Units: ${adjustedUnits.length}/7`);

    // Store results for next phase
    const results = {
      monthlyDistribution: monthlySSLessons,
      christmasBreak: christmasBreak,
      unitStructure: adjustedUnits,
      totals: {
        lessons: unitTotal,
        hours: totalHours,
        units: adjustedUnits.length
      }
    };

    console.log('\\n🎉 PHASE 1 COMPLETE: Real Calendar Distribution Calculated');
    console.log('Ready for Phase 2: Precise unit design and implementation');

    return results;

  } catch (error) {
    console.error('❌ Error calculating calendar distribution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

calculateRealCalendarDistribution();