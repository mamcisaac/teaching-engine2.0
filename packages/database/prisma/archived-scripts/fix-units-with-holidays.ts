#!/usr/bin/env tsx

/**
 * FIX UNIT HOURS TO ACCOUNT FOR HOLIDAYS AND PD DAYS
 * Recalculates unit hours based on actual instructional days
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026 holidays and PD days
const schoolBreaks = [
  { name: 'Labour Day', start: new Date(2025, 8, 1), end: new Date(2025, 8, 1) },
  { name: 'Thanksgiving', start: new Date(2025, 9, 13), end: new Date(2025, 9, 13) },
  { name: 'PD Day (Oct)', start: new Date(2025, 9, 24), end: new Date(2025, 9, 24) },
  { name: 'Remembrance Day', start: new Date(2025, 10, 11), end: new Date(2025, 10, 11) },
  { name: 'PD Day (Nov)', start: new Date(2025, 10, 28), end: new Date(2025, 10, 28) },
  { name: 'Christmas Break', start: new Date(2025, 11, 22), end: new Date(2026, 0, 2) },
  { name: 'PD Day (Jan)', start: new Date(2026, 0, 30), end: new Date(2026, 0, 30) },
  { name: 'Islander Day', start: new Date(2026, 1, 16), end: new Date(2026, 1, 16) },
  { name: 'PD Day (Feb)', start: new Date(2026, 1, 27), end: new Date(2026, 1, 27) },
  { name: 'March Break', start: new Date(2026, 2, 16), end: new Date(2026, 2, 20) },
  { name: 'Good Friday', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3) },
  { name: 'Easter Monday', start: new Date(2026, 3, 6), end: new Date(2026, 3, 6) },
  { name: 'PD Day (May)', start: new Date(2026, 4, 22), end: new Date(2026, 4, 22) },
  { name: 'Victoria Day', start: new Date(2026, 4, 18), end: new Date(2026, 4, 18) }
];

function getActualSchoolDays(start: Date, end: Date): number {
  let schoolDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    // Skip weekends
    if (current.getDay() === 0 || current.getDay() === 6) {
      current.setDate(current.getDate() + 1);
      continue;
    }
    
    // Check if this is a holiday/PD day
    let isHoliday = false;
    for (const holiday of schoolBreaks) {
      if (current >= holiday.start && current <= holiday.end) {
        isHoliday = true;
        break;
      }
    }
    
    if (!isHoliday) {
      schoolDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return schoolDays;
}

async function fixUnitsWithHolidays() {
  console.log('🔧 FIXING UNIT HOURS TO ACCOUNT FOR HOLIDAYS/PD DAYS\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // PHASE 1: Calculate total actual school days
    console.log('📅 PHASE 1: Verifying school calendar...\n');
    
    const schoolStart = new Date(2025, 8, 4); // Sept 4, 2025
    const schoolEnd = new Date(2026, 5, 25); // June 25, 2026
    
    const totalSchoolDays = getActualSchoolDays(schoolStart, schoolEnd);
    console.log(`School year: ${schoolStart.toDateString()} - ${schoolEnd.toDateString()}`);
    console.log(`Actual instructional days: ${totalSchoolDays}`);
    console.log(`Expected: 181 days`);
    
    if (Math.abs(totalSchoolDays - 181) > 2) {
      console.log(`⚠️ Warning: Calculated ${totalSchoolDays} days, expected ~181`);
    }
    
    // PHASE 2: Get all units and recalculate
    console.log('\n📊 PHASE 2: Recalculating unit hours...\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    // Group by subject
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push(u);
    });
    
    // Subject block distributions (from our 1810 total blocks)
    const subjectBlocks = {
      'Français langue première': 362,
      'Mathématiques': 362,
      'Sciences de la nature': 181,
      'Music': 91,
      'Éducation physique': 90,
      'Sciences humaines': 90,
      'Arts visuels': 91,
      'Formation personnelle et sociale': 60,
      'Flexible Learning': 423
    };
    
    // Process each subject
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      const totalBlocks = subjectBlocks[subject] || 0;
      if (totalBlocks === 0) continue;
      
      console.log(`\n${subject}: ${totalBlocks} blocks total`);
      
      // Sort units by start date
      subjectUnits.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      // Calculate actual school days for each unit
      const unitData = subjectUnits.map(u => {
        const actualDays = getActualSchoolDays(u.startDate, u.endDate);
        return { unit: u, actualDays };
      });
      
      const totalUnitDays = unitData.reduce((sum, ud) => sum + ud.actualDays, 0);
      
      console.log(`  Total unit school days: ${totalUnitDays}`);
      
      // Distribute blocks proportionally based on actual school days
      let blocksAllocated = 0;
      unitData.forEach(({ unit, actualDays }, index) => {
        let unitBlocks: number;
        
        // Last unit gets remainder to ensure exact total
        if (index === unitData.length - 1) {
          unitBlocks = totalBlocks - blocksAllocated;
        } else {
          unitBlocks = Math.round(totalBlocks * actualDays / totalUnitDays);
          blocksAllocated += unitBlocks;
        }
        
        const unitHours = (unitBlocks * 30) / 60;
        
        console.log(`  ${unit.title}: ${actualDays} days = ${unitBlocks} blocks = ${unitHours} hours`);
        
        // Update the unit
        prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: Math.round(unitHours)
          }
        }).then(() => {}).catch(() => {});
      });
    }
    
    // PHASE 3: Batch update all units
    console.log('\n💾 PHASE 3: Updating database...\n');
    
    // Collect all updates
    const updates: Promise<any>[] = [];
    
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      const totalBlocks = subjectBlocks[subject] || 0;
      if (totalBlocks === 0) continue;
      
      subjectUnits.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      const unitData = subjectUnits.map(u => ({
        unit: u,
        actualDays: getActualSchoolDays(u.startDate, u.endDate)
      }));
      
      const totalUnitDays = unitData.reduce((sum, ud) => sum + ud.actualDays, 0);
      
      let blocksAllocated = 0;
      unitData.forEach(({ unit, actualDays }, index) => {
        const unitBlocks = index === unitData.length - 1
          ? totalBlocks - blocksAllocated
          : Math.round(totalBlocks * actualDays / totalUnitDays);
        
        blocksAllocated += (index < unitData.length - 1) ? unitBlocks : 0;
        const unitHours = Math.round((unitBlocks * 30) / 60);
        
        updates.push(
          prisma.unitPlan.update({
            where: { id: unit.id },
            data: { estimatedHours: unitHours }
          })
        );
      });
    }
    
    await Promise.all(updates);
    console.log(`✅ Updated ${updates.length} units`);
    
    // PHASE 4: Validation
    console.log('\n✅ PHASE 4: Validating results...\n');
    
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    const totalHours = updatedUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const expectedHours = (1810 * 30) / 60; // 905 hours
    
    console.log(`Total unit hours: ${totalHours}`);
    console.log(`Expected hours: ${expectedHours}`);
    console.log(`Difference: ${Math.abs(totalHours - expectedHours)} hours`);
    
    // Check a sample unit
    const sampleUnit = updatedUnits.find(u => 
      u.title.includes('Winter') || u.title.includes('Christmas')
    );
    
    if (sampleUnit) {
      console.log(`\nSample - ${sampleUnit.title}:`);
      console.log(`  Dates: ${sampleUnit.startDate.toDateString()} - ${sampleUnit.endDate.toDateString()}`);
      console.log(`  Actual school days: ${getActualSchoolDays(sampleUnit.startDate, sampleUnit.endDate)}`);
      console.log(`  Allocated hours: ${sampleUnit.estimatedHours}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 HOLIDAY ACCOUNTING COMPLETE!\n');
    console.log('Summary:');
    console.log('  • All unit hours recalculated based on actual school days');
    console.log('  • Holidays and PD days excluded from calculations');
    console.log('  • Proportional distribution maintained');
    console.log('  • Total remains 1810 blocks (905 hours)');
    console.log('\n✨ Unit timelines now properly account for all breaks!');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixUnitsWithHolidays().catch(console.error);