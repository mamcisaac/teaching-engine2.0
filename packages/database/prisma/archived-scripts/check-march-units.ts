#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarchUnits() {
  console.log('\n🔍 CHECKING MARCH 2026 UNITS');
  console.log('='.repeat(60));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily not found!');
      return;
    }
    
    // Get all unit plans
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\nUnits overlapping with March 2026:');
    console.log('-'.repeat(60));
    
    const marchStart = new Date('2026-03-01');
    const marchEnd = new Date('2026-03-31');
    
    allUnits.forEach(unit => {
      // Check if unit overlaps with March
      if (unit.startDate <= marchEnd && unit.endDate >= marchStart) {
        const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const weeklyHours = (unit.estimatedHours || 0) / weeks;
        
        console.log(`\n${unit.longRangePlan.subject}: ${unit.titleFr}`);
        console.log(`  Start: ${unit.startDate.toISOString().split('T')[0]}`);
        console.log(`  End: ${unit.endDate.toISOString().split('T')[0]}`);
        console.log(`  Total hours: ${unit.estimatedHours}`);
        console.log(`  Duration: ${weeks} weeks`);
        console.log(`  Weekly hours: ${weeklyHours.toFixed(1)}`);
        
        // Check if this unit starts in March
        if (unit.startDate >= marchStart && unit.startDate <= marchEnd) {
          console.log(`  ⚠️ STARTS in March`);
        }
      }
    });
    
    console.log('\n\nDetailed March 2026 Schedule:');
    console.log('-'.repeat(60));
    
    // Group by subject for March
    const marchHoursBySubject: { [key: string]: number } = {};
    
    allUnits.forEach(unit => {
      // For units that start in March
      const unitStartMonth = unit.startDate.toISOString().substring(0, 7);
      if (unitStartMonth === '2026-03') {
        const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const weeklyHours = (unit.estimatedHours || 0) / weeks;
        
        const subject = unit.longRangePlan.subject;
        marchHoursBySubject[subject] = (marchHoursBySubject[subject] || 0) + weeklyHours;
      }
    });
    
    let totalMarchHours = 0;
    Object.entries(marchHoursBySubject).forEach(([subject, hours]) => {
      console.log(`${subject}: ${hours.toFixed(1)} hrs/week`);
      totalMarchHours += hours;
    });
    
    console.log(`\nTOTAL: ${totalMarchHours.toFixed(1)} hours/week`);
    
    if (totalMarchHours > 25) {
      console.log('\n❌ ERROR: The calculation is showing too many hours!');
      console.log('This appears to be caused by units starting in March');
      console.log('with their full hours counted in weekly calculation.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarchUnits();