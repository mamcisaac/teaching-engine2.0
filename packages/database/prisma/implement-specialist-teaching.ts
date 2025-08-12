#!/usr/bin/env tsx

/**
 * IMPLEMENT SPECIALIST TEACHING AND PLANNING TIME
 * Updates curriculum to reflect that Music and PE are taught by specialists
 * Emily gets planning time during these periods
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implementSpecialistTeaching() {
  console.log('🎯 IMPLEMENTING SPECIALIST TEACHING AND PLANNING TIME\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // PHASE 1: Update specialist-taught subjects
    console.log('👩‍🏫 PHASE 1: Marking specialist-taught subjects...\n');
    
    // Update PE long range plan
    const peLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Éducation physique'
      }
    });
    
    if (peLRP) {
      await prisma.longRangePlan.update({
        where: { id: peLRP.id },
        data: {
          description: 'Physical education program taught by PE specialist. Develops fundamental movement skills, promotes active living, and builds teamwork.',
          resourceNeeds: 'Gymnasium, outdoor spaces, sports equipment\n\nTAUGHT BY: PE Specialist\nSCHEDULE: 3 times per week (45 minutes)\nEMILY\'S ROLE: Coordination with specialist, reinforcement of concepts',
          professionalGoals: 'Coordinate with PE specialist to reinforce movement concepts and healthy living in classroom'
        }
      });
      console.log('  ✅ Updated Éducation physique as specialist-taught');
    }
    
    // Update Music long range plan
    const musicLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Music'
      }
    });
    
    if (musicLRP) {
      await prisma.longRangePlan.update({
        where: { id: musicLRP.id },
        data: {
          description: 'Music education program taught by Music specialist. Develops musical literacy, appreciation, and creative expression.',
          resourceNeeds: 'Music room, instruments, audio equipment\n\nTAUGHT BY: Music Specialist\nSCHEDULE: 1-2 times per week (45 minutes)\nEMILY\'S ROLE: Integration of music concepts in classroom activities',
          professionalGoals: 'Collaborate with Music specialist to integrate musical elements into literacy and cultural activities'
        }
      });
      console.log('  ✅ Updated Music as specialist-taught');
    }
    
    // PHASE 2: Calculate Emily's actual teaching load
    console.log('\n📊 PHASE 2: Calculating Emily\'s teaching load...\n');
    
    const emilyTeaches = {
      'Français langue première': 181,
      'Mathématiques': 181,
      'Arts visuels': 90,
      'Sciences humaines': 91,
      'Sciences de la nature': 108,
      'Formation personnelle et sociale': 36,
      'Flexible Learning': 56
    };
    
    const specialistTeaches = {
      'Éducation physique': 108,
      'Music': 54
    };
    
    let emilyTotal = 0;
    console.log('Emily teaches:');
    for (const [subject, lessons] of Object.entries(emilyTeaches)) {
      console.log(`  • ${subject}: ${lessons} lessons`);
      emilyTotal += lessons;
    }
    console.log(`  TOTAL: ${emilyTotal} lessons\n`);
    
    let specialistTotal = 0;
    console.log('Specialists teach:');
    for (const [subject, lessons] of Object.entries(specialistTeaches)) {
      console.log(`  • ${subject}: ${lessons} lessons`);
      specialistTotal += lessons;
    }
    console.log(`  TOTAL: ${specialistTotal} lessons\n`);
    
    console.log(`Grand Total: ${emilyTotal + specialistTotal} lessons for students`);
    
    // PHASE 3: Document planning time schedule
    console.log('\n⏰ PHASE 3: Documenting planning time...\n');
    
    const planningSchedule = `
# EMILY'S PLANNING TIME SCHEDULE

## Daily Planning Blocks

### Regular Planning Time (Daily - 30 minutes)
When students are at PE or Music with specialists, Emily has planning time:
- **Monday**: 12:30-1:00 (PE with specialist)
- **Tuesday**: 12:30-1:00 (Music with specialist)
- **Wednesday**: 12:30-1:00 (PE with specialist)
- **Thursday**: 12:30-1:00 (Music with specialist)
- **Friday**: 12:30-1:00 (PE with specialist)

### Additional Planning Time (Every Second Day - 30 minutes)
- **Day A** (Mon/Wed/Fri on odd weeks, Tue/Thu on even weeks): 1:00-1:30
- During this time, students may be in Library or with EA support

## Weekly Planning Time Total
- **Week A**: 5 × 30 min (daily) + 3 × 30 min (additional) = 240 minutes
- **Week B**: 5 × 30 min (daily) + 2 × 30 min (additional) = 210 minutes
- **Average**: 225 minutes per week (45 minutes per day)

## Planning Time Usage
- Lesson preparation
- Assessment and evaluation
- Parent communication
- Collaboration with specialists
- Professional development
- IEP/adaptations planning
`;
    
    console.log(planningSchedule);
    
    // PHASE 4: Update daily schedule documentation
    console.log('📅 PHASE 4: Creating realistic daily schedule...\n');
    
    const dailySchedule = `
# GRADE 1 FRENCH IMMERSION - DAILY SCHEDULE

## Schedule with Specialist Teaching & Planning Time

### MORNING
**8:30-9:30** - Français (60 min) - Emily teaches
- Daily literacy block
- Whole class instruction

**9:30-9:45** - Recess

**9:45-10:30** - Mathématiques (45 min) - Emily teaches
- Daily numeracy block
- Differentiated instruction

**10:30-10:45** - Recess

**10:45-11:30** - Alternating Block (45 min) - Emily teaches
- **Day A**: Arts visuels
- **Day B**: Sciences humaines

### AFTERNOON
**11:30-12:30** - Lunch

**12:30-1:15** - Specialist Block (45 min)
- **Mon/Wed/Fri**: Éducation physique (PE Specialist)
- **Tue/Thu**: Music (Music Specialist)
- **Emily**: Planning Time (30 min) + Prep (15 min)

**1:15-1:30** - Recess

**1:30-2:15** - Rotating Block (45 min)
- **3x/week**: Sciences de la nature (Emily)
- **1x/week**: Formation personnelle et sociale (Emily)
- **1x/week**: Flexible/Planning (Emily planning every 2nd day)

**2:15-3:00** - Flexible Learning (45 min)
- Library (with librarian 2x/week)
- Projects/Centers (Emily or EA supervised)
- Assemblies (as scheduled)
- Additional specialist programs

## Summary
- **Emily teaches**: 743 lessons
- **Specialists teach**: 162 lessons
- **Total student instruction**: 905 lessons
- **Emily's planning time**: 45 min/day average
`;
    
    console.log(dailySchedule);
    
    // PHASE 5: Update unit plans for specialist subjects
    console.log('📝 PHASE 5: Updating specialist-taught unit plans...\n');
    
    // Update PE units
    const peUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          userId: emily.id,
          subject: 'Éducation physique'
        }
      }
    });
    
    for (const unit of peUnits) {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          description: unit.description + '\n\n[Taught by PE Specialist - Emily has planning time during these periods]'
        }
      });
    }
    console.log(`  ✅ Updated ${peUnits.length} PE units`);
    
    // Update Music units
    const musicUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          userId: emily.id,
          subject: 'Music'
        }
      }
    });
    
    for (const unit of musicUnits) {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          description: unit.description + '\n\n[Taught by Music Specialist - Emily has planning time during these periods]'
        }
      });
    }
    console.log(`  ✅ Updated ${musicUnits.length} Music units`);
    
    // PHASE 6: Final validation
    console.log('\n✅ PHASE 6: Validation...\n');
    
    const allLRPs = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        _count: {
          select: { unitPlans: true }
        }
      }
    });
    
    console.log('Long Range Plans Summary:');
    allLRPs.forEach(lrp => {
      const isSpecialist = ['Éducation physique', 'Music'].includes(lrp.subject);
      console.log(`  • ${lrp.subject}: ${lrp._count.unitPlans} units ${isSpecialist ? '(SPECIALIST)' : '(EMILY)'}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SPECIALIST TEACHING IMPLEMENTATION COMPLETE!\n');
    console.log('Summary:');
    console.log('  • PE: Taught by specialist (108 lessons)');
    console.log('  • Music: Taught by specialist (54 lessons)');
    console.log('  • Emily teaches: 743 lessons');
    console.log('  • Emily planning time: 45 min/day average');
    console.log('  • Total student instruction: 905 lessons');
    console.log('\n✨ The curriculum now accurately reflects specialist teaching!');
    
  } catch (error) {
    console.error('❌ Implementation error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the implementation
implementSpecialistTeaching().catch(console.error);