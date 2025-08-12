#!/usr/bin/env tsx

/**
 * IMPLEMENT 6-DAY CYCLE WITH 30-MINUTE BLOCKS
 * Complete restructure to match actual school schedule
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implement6DayCycle() {
  console.log('🔄 IMPLEMENTING 6-DAY CYCLE WITH 30-MINUTE BLOCKS\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // PHASE 1: Define the new structure
    console.log('📊 PHASE 1: Setting up 6-day cycle structure...\n');
    
    // Lesson distribution over full year (30 cycles × blocks per cycle)
    const lessonDistribution = {
      'Français langue première': { 
        blocksPerCycle: 12, 
        totalBlocks: 360, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Mathématiques': { 
        blocksPerCycle: 12, 
        totalBlocks: 360, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Sciences de la nature': { 
        blocksPerCycle: 6, 
        totalBlocks: 180, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Sciences humaines': { 
        blocksPerCycle: 3, 
        totalBlocks: 90, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Arts visuels': { 
        blocksPerCycle: 3, 
        totalBlocks: 90, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Formation personnelle et sociale': { 
        blocksPerCycle: 2, 
        totalBlocks: 60, 
        minutesPerBlock: 30,
        teacher: 'Emily'
      },
      'Music': { 
        blocksPerCycle: 3, 
        totalBlocks: 90, 
        minutesPerBlock: 30,
        teacher: 'Specialist'
      },
      'Éducation physique': { 
        blocksPerCycle: 3, 
        totalBlocks: 90, 
        minutesPerBlock: 30,
        teacher: 'Specialist'
      },
      'Flexible Learning': { 
        blocksPerCycle: 16, // Includes library/book buddies/flex time
        totalBlocks: 480, 
        minutesPerBlock: 30,
        teacher: 'Emily/Various'
      }
    };
    
    console.log('New 6-Day Cycle Distribution:');
    console.log('Subject | Blocks/Cycle | Total Blocks | Hours | Teacher');
    console.log('-'.repeat(60));
    
    let totalEmily = 0;
    let totalSpecialist = 0;
    
    Object.entries(lessonDistribution).forEach(([subject, data]) => {
      const hours = (data.totalBlocks * data.minutesPerBlock) / 60;
      console.log(`${subject.padEnd(35)} | ${String(data.blocksPerCycle).padEnd(12)} | ${String(data.totalBlocks).padEnd(12)} | ${String(hours).padEnd(5)} | ${data.teacher}`);
      
      if (data.teacher === 'Emily' || data.teacher === 'Emily/Various') {
        totalEmily += data.totalBlocks;
      } else {
        totalSpecialist += data.totalBlocks;
      }
    });
    
    console.log('-'.repeat(60));
    console.log(`TOTAL Emily blocks: ${totalEmily} (${totalEmily * 30 / 60} hours)`);
    console.log(`TOTAL Specialist blocks: ${totalSpecialist} (${totalSpecialist * 30 / 60} hours)`);
    console.log(`GRAND TOTAL: ${totalEmily + totalSpecialist} blocks\n`);
    
    // PHASE 2: Update Long Range Plans
    console.log('📚 PHASE 2: Updating long range plans...\n');
    
    for (const [subject, data] of Object.entries(lessonDistribution)) {
      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: emily.id,
          subject: subject
        }
      });
      
      if (lrp) {
        const isSpecialist = data.teacher === 'Specialist';
        const cycleInfo = `6-day cycle: ${data.blocksPerCycle} blocks per cycle, ${data.totalBlocks} total blocks (30 min each)`;
        
        await prisma.longRangePlan.update({
          where: { id: lrp.id },
          data: {
            description: lrp.description + `\n\n[${cycleInfo}]`,
            professionalGoals: isSpecialist 
              ? `Coordinate with ${subject} specialist. Emily has planning time during these blocks.`
              : lrp.professionalGoals,
            resourceNeeds: (lrp.resourceNeeds || '') + `\n\nSchedule: ${data.blocksPerCycle} × 30-min blocks per 6-day cycle${isSpecialist ? ' (SPECIALIST)' : ' (EMILY)'}`
          }
        });
        
        console.log(`  ✅ Updated ${subject}: ${data.totalBlocks} blocks${isSpecialist ? ' (Specialist)' : ''}`);
      }
    }
    
    // PHASE 3: Recalculate unit hours for 30-minute blocks
    console.log('\n⏱️ PHASE 3: Recalculating unit hours...\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    // Group units by subject
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push(u);
    });
    
    // Update hours for each subject
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      const data = lessonDistribution[subject];
      if (!data) continue;
      
      const totalBlocks = data.totalBlocks;
      const totalHours = (totalBlocks * 30) / 60;
      
      // Calculate proportional distribution based on unit duration
      const unitDurations = subjectUnits.map(u => {
        const days = Math.floor((u.endDate.getTime() - u.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return { unit: u, days };
      });
      
      const totalDays = unitDurations.reduce((sum, ud) => sum + ud.days, 0);
      
      console.log(`${subject}: ${totalBlocks} blocks (${totalHours} hours) across ${subjectUnits.length} units`);
      
      for (const { unit, days } of unitDurations) {
        const unitBlocks = Math.round(totalBlocks * days / totalDays);
        const unitHours = (unitBlocks * 30) / 60;
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: Math.round(unitHours),
            description: unit.description + `\n[${unitBlocks} × 30-min blocks]`
          }
        });
      }
    }
    
    // PHASE 4: Create 6-day cycle documentation
    console.log('\n📅 PHASE 4: Documenting 6-day cycle...\n');
    
    const cycleDoc = `
# GRADE 1 FRENCH IMMERSION - 6-DAY CYCLE STRUCTURE

## Daily Schedule Template (10 × 30-minute blocks)

8:25-8:30   Morning Announcements
8:30-9:00   Block 1
9:00-9:30   Block 2
9:30-10:00  Block 3
10:00-10:15 First Recess (15 min)
10:15-10:45 Block 4
10:45-11:15 Block 5
11:15-11:35 Second Recess (20 min)
11:35-12:00 Lunch (25 min)
12:00-12:30 Block 6
12:30-1:00  Block 7
1:00-1:30   Block 8
1:30-2:00   Block 9
2:00-2:30   Block 10
2:30        Dismissal

## 6-Day Cycle Pattern

**Day 1:**
- Music (1 block) - Specialist
- French (2 blocks)
- Math (2 blocks)
- Science (1 block)
- Other subjects (4 blocks)

**Day 2:**
- PE (1 block) - Specialist
- Book Buddies (1 block)
- French (2 blocks)
- Math (2 blocks)
- Other subjects (4 blocks)

**Day 3:**
- Music (1 block) - Specialist
- Library (1 block)
- French (2 blocks)
- Math (2 blocks)
- Other subjects (4 blocks)

**Day 4:**
- PE (1 block) - Specialist
- French (2 blocks)
- Math (2 blocks)
- Science (1 block)
- Other subjects (4 blocks)

**Day 5:**
- Music (1 block) - Specialist
- French (2 blocks)
- Math (2 blocks)
- Science (1 block)
- Other subjects (4 blocks)

**Day 6:**
- PE (1 block) - Specialist
- French (2 blocks)
- Math (2 blocks)
- Science (1 block)
- Other subjects (4 blocks)

## Annual Totals (30 cycles)

| Subject | Blocks | Hours | Teacher |
|---------|--------|-------|---------|
| Français | 360 | 180 | Emily |
| Mathématiques | 360 | 180 | Emily |
| Sciences | 180 | 90 | Emily |
| Sciences humaines | 90 | 45 | Emily |
| Arts visuels | 90 | 45 | Emily |
| Santé/FPS | 60 | 30 | Emily |
| Music | 90 | 45 | Specialist |
| PE | 90 | 45 | Specialist |
| Flexible Learning | 480 | 240 | Emily/Various |
| **TOTAL** | **1,800** | **900** | - |

## Planning Time

Emily receives planning time during:
- Music blocks (3 per cycle)
- PE blocks (3 per cycle)
- Library/Book Buddies (2 per cycle)

**Total: 240 minutes per 6-day cycle (40 min/day average)**
`;
    
    console.log(cycleDoc);
    
    // PHASE 5: Final validation
    console.log('✅ PHASE 5: Validating implementation...\n');
    
    // Count total units
    const totalUnits = await prisma.unitPlan.count({
      where: { userId: emily.id }
    });
    
    // Calculate total hours
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    const hoursBySubject: Record<string, number> = {};
    updatedUnits.forEach(u => {
      const s = u.longRangePlan.subject;
      hoursBySubject[s] = (hoursBySubject[s] || 0) + (u.estimatedHours || 0);
    });
    
    console.log('Final hours by subject:');
    Object.entries(hoursBySubject).forEach(([subject, hours]) => {
      const expected = lessonDistribution[subject]?.totalBlocks * 30 / 60;
      console.log(`  ${subject}: ${hours} hours (expected: ${expected || 'N/A'})`);
    });
    
    const totalHours = Object.values(hoursBySubject).reduce((sum, h) => sum + h, 0);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 6-DAY CYCLE IMPLEMENTATION COMPLETE!\n');
    console.log('Summary:');
    console.log(`  • Cycle type: 6-day rotation`);
    console.log(`  • Block duration: 30 minutes`);
    console.log(`  • Total blocks: 1,800 (60 per day × 30 cycles)`);
    console.log(`  • Total units: ${totalUnits}`);
    console.log(`  • Total hours: ${totalHours}`);
    console.log(`  • Emily teaches: 1,620 blocks`);
    console.log(`  • Specialists teach: 180 blocks`);
    console.log(`  • Planning time: 240 min per cycle`);
    console.log('\n✨ The curriculum now reflects the actual 6-day cycle structure!');
    
  } catch (error) {
    console.error('❌ Implementation error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run implementation
implement6DayCycle().catch(console.error);