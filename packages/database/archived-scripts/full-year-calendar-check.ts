#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullYearCalendarCheck() {
  console.log('📅 COMPREHENSIVE PEI SCHOOL CALENDAR CHECK 2025-2026\n');
  console.log('=' + '='.repeat(60));
  console.log('Checking entire school year for calendar compliance...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // === COMPLETE PEI SCHOOL CALENDAR 2025-2026 ===
    const schoolCalendar = {
      schoolYear: '2025-2026',
      firstDay: new Date(2025, 8, 3), // September 3, 2025 (Wednesday)
      lastDay: new Date(2026, 5, 26), // June 26, 2026 (Friday)
      
      holidays: [
        // First Semester
        { date: new Date(2025, 8, 1), name: 'Labour Day', type: 'statutory' },
        { date: new Date(2025, 9, 14), name: 'Thanksgiving Day', type: 'statutory' },
        { date: new Date(2025, 10, 11), name: 'Remembrance Day', type: 'statutory' },
        
        // Second Semester
        { date: new Date(2026, 1, 17), name: 'Islander Day', type: 'provincial' },
        { date: new Date(2026, 3, 10), name: 'Good Friday', type: 'statutory' },
        { date: new Date(2026, 3, 13), name: 'Easter Monday', type: 'statutory' },
        { date: new Date(2026, 4, 18), name: 'Victoria Day', type: 'statutory' },
      ],
      
      breaks: [
        { 
          name: 'Christmas Break', 
          start: new Date(2025, 11, 22), // December 22, 2025
          end: new Date(2026, 0, 4)      // January 4, 2026
        },
        { 
          name: 'March Break', 
          start: new Date(2026, 2, 9),   // March 9, 2026
          end: new Date(2026, 2, 13)     // March 13, 2026
        }
      ],
      
      pdDays: [
        // First Semester
        { date: new Date(2025, 8, 2), name: 'September PD Day (before school)' },
        { date: new Date(2025, 9, 17), name: 'October PD Day' },
        { date: new Date(2025, 10, 7), name: 'November PD Day' },
        
        // Second Semester  
        { date: new Date(2026, 0, 30), name: 'January PD Day' },
        { date: new Date(2026, 1, 27), name: 'February PD Day' },
        { date: new Date(2026, 3, 24), name: 'April PD Day' },
        { date: new Date(2026, 4, 1), name: 'May PD Day' },
        { date: new Date(2026, 5, 29), name: 'June PD Day (after school ends)' }
      ],
      
      specialDays: [
        { date: new Date(2025, 9, 31), name: 'Halloween', type: 'celebration' },
        { date: new Date(2026, 1, 14), name: "Valentine's Day", type: 'celebration' },
        { date: new Date(2026, 2, 17), name: "St. Patrick's Day", type: 'celebration' },
        { date: new Date(2026, 5, 26), name: 'Last Day of School', type: 'milestone' }
      ]
    };

    // Get all lessons for the full year
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });

    console.log(`Total lessons in system: ${allLessons.length}\n`);

    // === CHECK HOLIDAYS ===
    console.log('🚫 STATUTORY HOLIDAYS CHECK:\n');
    
    let holidayIssues = 0;
    for (const holiday of schoolCalendar.holidays) {
      const lessonsOnHoliday = allLessons.filter(l => 
        l.date.toDateString() === holiday.date.toDateString()
      );
      
      if (lessonsOnHoliday.length > 0) {
        // Special case for Remembrance Day ceremony
        if (holiday.name === 'Remembrance Day' && 
            lessonsOnHoliday.every(l => l.title?.includes('Ceremony') || l.titleFr?.includes('Cérémonie'))) {
          console.log(`✅ ${holiday.name} (${holiday.date.toDateString()}): Ceremony only`);
        } else {
          console.log(`❌ ${holiday.name} (${holiday.date.toDateString()}): ${lessonsOnHoliday.length} lessons found`);
          lessonsOnHoliday.forEach(l => console.log(`   - ${l.titleFr || l.title}`));
          holidayIssues++;
        }
      } else {
        console.log(`✅ ${holiday.name} (${holiday.date.toDateString()}): Clear`);
      }
    }

    // === CHECK BREAKS ===
    console.log('\n🏖️ SCHOOL BREAKS CHECK:\n');
    
    let breakIssues = 0;
    for (const breakPeriod of schoolCalendar.breaks) {
      const lessonsDuringBreak = allLessons.filter(l => 
        l.date >= breakPeriod.start && l.date <= breakPeriod.end
      );
      
      if (lessonsDuringBreak.length > 0) {
        console.log(`❌ ${breakPeriod.name} (${breakPeriod.start.toDateString()} to ${breakPeriod.end.toDateString()}):`);
        console.log(`   Found ${lessonsDuringBreak.length} lessons during break`);
        lessonsDuringBreak.slice(0, 3).forEach(l => 
          console.log(`   - ${l.date.toDateString()}: ${l.titleFr || l.title}`)
        );
        if (lessonsDuringBreak.length > 3) {
          console.log(`   ... and ${lessonsDuringBreak.length - 3} more`);
        }
        breakIssues++;
      } else {
        console.log(`✅ ${breakPeriod.name}: No lessons during break`);
      }
    }

    // === CHECK PD DAYS ===
    console.log('\n👩‍🏫 PROFESSIONAL DEVELOPMENT DAYS CHECK:\n');
    
    let pdDayIssues = 0;
    for (const pdDay of schoolCalendar.pdDays) {
      const lessonsOnPD = allLessons.filter(l => 
        l.date.toDateString() === pdDay.date.toDateString()
      );
      
      if (lessonsOnPD.length > 0) {
        console.log(`❌ ${pdDay.name} (${pdDay.date.toDateString()}): ${lessonsOnPD.length} lessons`);
        lessonsOnPD.forEach(l => console.log(`   - ${l.titleFr || l.title}`));
        pdDayIssues++;
      } else {
        console.log(`✅ ${pdDay.name} (${pdDay.date.toDateString()}): Clear`);
      }
    }

    // === CHECK WEEKENDS ===
    console.log('\n🚫 WEEKEND CHECK:\n');
    
    const weekendLessons = allLessons.filter(l => {
      const day = l.date.getDay();
      return day === 0 || day === 6;
    });

    if (weekendLessons.length > 0) {
      console.log(`❌ Found ${weekendLessons.length} lessons on weekends:`);
      weekendLessons.slice(0, 5).forEach(l => 
        console.log(`   - ${l.date.toDateString()}: ${l.titleFr || l.title}`)
      );
      if (weekendLessons.length > 5) {
        console.log(`   ... and ${weekendLessons.length - 5} more`);
      }
    } else {
      console.log('✅ No weekend lessons found');
    }

    // === SEMESTER ANALYSIS ===
    console.log('\n📊 SEMESTER BREAKDOWN:\n');
    
    const firstSemesterLessons = allLessons.filter(l => 
      l.date >= new Date(2025, 8, 1) && l.date <= new Date(2025, 11, 31)
    );
    
    const secondSemesterLessons = allLessons.filter(l => 
      l.date >= new Date(2026, 0, 1) && l.date <= new Date(2026, 5, 30)
    );
    
    console.log(`First Semester (Sept-Dec 2025): ${firstSemesterLessons.length} lessons`);
    console.log(`Second Semester (Jan-June 2026): ${secondSemesterLessons.length} lessons`);
    
    if (secondSemesterLessons.length === 0) {
      console.log('\n⚠️ NOTE: Second semester has no lessons yet (unit plans only)');
    }

    // === SPECIAL DAYS AWARENESS ===
    console.log('\n🎉 SPECIAL DAYS AWARENESS:\n');
    
    for (const special of schoolCalendar.specialDays) {
      const lessonsOnSpecial = allLessons.filter(l => 
        l.date.toDateString() === special.date.toDateString()
      );
      
      if (lessonsOnSpecial.length > 0) {
        const themed = lessonsOnSpecial.filter(l => 
          l.title?.toLowerCase().includes(special.name.toLowerCase().split(' ')[0]) ||
          l.titleFr?.toLowerCase().includes(special.name.toLowerCase().split(' ')[0])
        );
        
        if (themed.length > 0) {
          console.log(`✨ ${special.name} (${special.date.toDateString()}): ${themed.length} themed lessons`);
        } else {
          console.log(`📅 ${special.name} (${special.date.toDateString()}): ${lessonsOnSpecial.length} regular lessons`);
        }
      } else {
        console.log(`📅 ${special.name} (${special.date.toDateString()}): No lessons scheduled`);
      }
    }

    // === TEACHING DAYS CALCULATION ===
    console.log('\n📈 TEACHING DAYS CALCULATION:\n');
    
    // Calculate actual teaching days for full year
    let totalTeachingDays = 0;
    const startDate = schoolCalendar.firstDay;
    const endDate = schoolCalendar.lastDay;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      
      // Skip weekends
      if (day === 0 || day === 6) continue;
      
      // Skip holidays
      const isHoliday = schoolCalendar.holidays.some(h => 
        h.date.toDateString() === d.toDateString()
      );
      if (isHoliday) continue;
      
      // Skip PD days
      const isPDDay = schoolCalendar.pdDays.some(pd => 
        pd.date.toDateString() === d.toDateString()
      );
      if (isPDDay) continue;
      
      // Skip breaks
      const isDuringBreak = schoolCalendar.breaks.some(b => 
        d >= b.start && d <= b.end
      );
      if (isDuringBreak) continue;
      
      totalTeachingDays++;
    }
    
    console.log(`Total teaching days in 2025-2026: ${totalTeachingDays}`);
    console.log(`Days with lessons scheduled: ${new Set(allLessons.map(l => l.date.toDateString())).size}`);
    
    // === FINAL SUMMARY ===
    console.log('\n' + '='.repeat(60));
    console.log('🏆 FULL YEAR CALENDAR COMPLIANCE SUMMARY');
    console.log('='.repeat(60) + '\n');

    const totalIssues = holidayIssues + breakIssues + pdDayIssues + (weekendLessons.length > 0 ? 1 : 0);
    
    if (totalIssues === 0) {
      console.log('✅ PERFECT CALENDAR COMPLIANCE FOR ENTIRE YEAR!');
      console.log('All holidays, breaks, PD days, and weekends are properly respected.');
    } else {
      console.log('❌ CALENDAR ISSUES FOUND:');
      if (holidayIssues > 0) console.log(`   • ${holidayIssues} holidays with lessons`);
      if (breakIssues > 0) console.log(`   • ${breakIssues} breaks with lessons`);
      if (pdDayIssues > 0) console.log(`   • ${pdDayIssues} PD days with lessons`);
      if (weekendLessons.length > 0) console.log(`   • ${weekendLessons.length} weekend lessons`);
    }

    console.log('\n📋 KEY DATES TO REMEMBER:');
    console.log(`   • School starts: ${schoolCalendar.firstDay.toDateString()}`);
    console.log(`   • Christmas break: ${schoolCalendar.breaks[0].start.toDateString()} - ${schoolCalendar.breaks[0].end.toDateString()}`);
    console.log(`   • March break: ${schoolCalendar.breaks[1].start.toDateString()} - ${schoolCalendar.breaks[1].end.toDateString()}`);
    console.log(`   • School ends: ${schoolCalendar.lastDay.toDateString()}`);

    return totalIssues === 0;

  } catch (error) {
    console.error('❌ Error checking calendar:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fullYearCalendarCheck()
  .then((isPerfect) => {
    if (isPerfect) {
      console.log('\n✅ Full year calendar check complete - PERFECT COMPLIANCE!');
    } else {
      console.log('\n⚠️ Full year calendar check complete - Review issues above');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Calendar check failed:', error);
    process.exit(1);
  });