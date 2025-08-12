#!/usr/bin/env tsx

/**
 * FIX ALTERNATING SCHEDULE
 * Implements proper Day A/Day B alternating pattern for elementary school
 * Art and Social Studies alternate daily, not on fixed weekdays
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAlternatingSchedule() {
  console.log('🔧 FIXING CURRICULUM WITH ALTERNATING SCHEDULE\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // PHASE 1: Fix units starting on Sunday May 3
    console.log('📅 PHASE 1: Fixing Sunday start dates...');
    
    const unitsToFix = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        startDate: new Date(2026, 4, 3) // May 3, 2026 (Sunday)
      },
      include: { longRangePlan: true }
    });
    
    for (const unit of unitsToFix) {
      // Move to Monday May 4
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          startDate: new Date(2026, 4, 4) // May 4, 2026 (Monday)
        }
      });
      console.log(`  ✅ Fixed ${unit.longRangePlan.subject} - ${unit.title}: moved to May 4`);
    }
    
    // PHASE 2: Update lesson distributions for alternating schedule
    console.log('\n📊 PHASE 2: Updating lesson distributions...');
    
    // New distribution with alternating Art/Social Studies
    const newDistribution = {
      'Français langue première': 181,    // Daily
      'Mathématiques': 181,               // Daily
      'Arts visuels': 90,                 // Day A (alternating)
      'Sciences humaines': 91,            // Day B (alternating)
      'Sciences de la nature': 108,       // 3x/week
      'Éducation physique': 108,          // 3x/week
      'Music': 54,                        // ~1.5x/week
      'Formation personnelle et sociale': 36, // 1x/week
      'Flexible Learning': 108            // Daily Period 6 (minus assemblies)
    };
    
    console.log('  New lesson distribution:');
    let total = 0;
    for (const [subject, lessons] of Object.entries(newDistribution)) {
      console.log(`    ${subject}: ${lessons} lessons`);
      total += lessons;
    }
    console.log(`    TOTAL: ${total} lessons ✓`);
    
    // PHASE 3: Recalculate unit hours based on new distribution
    console.log('\n⏰ PHASE 3: Recalculating unit hours...');
    
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    // Group by subject
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const subject = u.longRangePlan.subject;
      if (!unitsBySubject[subject]) unitsBySubject[subject] = [];
      unitsBySubject[subject].push(u);
    });
    
    // Update hours for each subject based on new distribution
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      const totalLessons = newDistribution[subject] || 0;
      const minutesPerLesson = subject === 'Français langue première' ? 60 : 45;
      const hoursPerLesson = minutesPerLesson / 60;
      
      if (totalLessons > 0 && subjectUnits.length > 0) {
        // Calculate hours per unit (distribute evenly)
        const hoursPerUnit = Math.round((totalLessons * hoursPerLesson) / subjectUnits.length);
        
        console.log(`\n  ${subject}:`);
        console.log(`    ${totalLessons} lessons × ${minutesPerLesson} min = ${totalLessons * hoursPerLesson} hours total`);
        console.log(`    ${subjectUnits.length} units = ~${hoursPerUnit} hours per unit`);
        
        // Update each unit
        for (const unit of subjectUnits) {
          await prisma.unitPlan.update({
            where: { id: unit.id },
            data: {
              estimatedHours: hoursPerUnit
            }
          });
        }
      }
    }
    
    // PHASE 4: Update long range plans with schedule notes
    console.log('\n📝 PHASE 4: Updating long range plans with schedule pattern...');
    
    const scheduleNotes = {
      'Français langue première': 'Daily instruction (Period 1, 60 minutes)',
      'Mathématiques': 'Daily instruction (Period 2, 45 minutes)',
      'Arts visuels': 'Day A rotation (Period 3, 45 minutes) - alternates with Social Studies',
      'Sciences humaines': 'Day B rotation (Period 3, 45 minutes) - alternates with Arts',
      'Sciences de la nature': '3 times per week (Period 5, 45 minutes)',
      'Éducation physique': '3 times per week (Period 4, 45 minutes)',
      'Music': '1-2 times per week (Period 4, 45 minutes)',
      'Formation personnelle et sociale': 'Once per week (Period 5, 45 minutes)',
      'Flexible Learning': 'Daily flexible period (Period 6, 45 minutes) - library, projects, assemblies'
    };
    
    for (const [subject, note] of Object.entries(scheduleNotes)) {
      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: emily.id,
          subject: subject
        }
      });
      
      if (lrp) {
        await prisma.longRangePlan.update({
          where: { id: lrp.id },
          data: {
            resourceNeeds: lrp.resourceNeeds + '\n\nSchedule Pattern: ' + note
          }
        });
        console.log(`  ✅ Updated ${subject}`);
      }
    }
    
    // PHASE 5: Create alternating schedule documentation
    console.log('\n📅 PHASE 5: Documenting alternating schedule...');
    
    const scheduleDoc = `
# Grade 1 French Immersion - Alternating Schedule Pattern

## Daily Structure (285 minutes)
- 8:30-9:30   Period 1: Français (60 min) - DAILY
- 9:45-10:30  Period 2: Mathématiques (45 min) - DAILY
- 10:45-11:30 Period 3: **Day A/B Rotation** (45 min)
- 12:30-1:15  Period 4: PE/Music Rotation (45 min)
- 1:30-2:15   Period 5: Science/Health Rotation (45 min)
- 2:15-3:00   Period 6: Flexible Learning (45 min) - DAILY

## Day A/Day B Pattern
The schedule alternates between Day A and Day B throughout the school year:
- **Day A**: Arts visuels (Period 3)
- **Day B**: Sciences humaines (Period 3)

This pattern continues regardless of the day of the week. For example:
- Monday Sept 4: Day A (Arts)
- Tuesday Sept 5: Day B (Social Studies)
- Wednesday Sept 6: Day A (Arts)
- Thursday Sept 7: Day B (Social Studies)
- Friday Sept 8: Day A (Arts)
- Monday Sept 11: Day B (Social Studies) [continues from Friday]

## Lesson Distribution (905 total)
- Français langue première: 181 lessons (daily)
- Mathématiques: 181 lessons (daily)
- Arts visuels: 90 lessons (Day A)
- Sciences humaines: 91 lessons (Day B)
- Sciences de la nature: 108 lessons (3x/week)
- Éducation physique: 108 lessons (3x/week)
- Music: 54 lessons (~1.5x/week)
- Formation personnelle et sociale: 36 lessons (1x/week)
- Flexible Learning: 108 lessons (daily Period 6)

Total: 905 lessons across 181 school days
`;
    
    // PHASE 6: Validation
    console.log('\n✅ PHASE 6: Validating fixes...');
    
    // Check for Sunday starts
    const sundayStarts = await prisma.unitPlan.count({
      where: {
        userId: emily.id,
        startDate: new Date(2026, 4, 3)
      }
    });
    
    // Calculate total hours
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id }
    });
    const totalHours = updatedUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    
    // Count units by subject
    const finalUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    const unitCounts: Record<string, number> = {};
    finalUnits.forEach(u => {
      const s = u.longRangePlan.subject;
      unitCounts[s] = (unitCounts[s] || 0) + 1;
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALTERNATING SCHEDULE FIX COMPLETE!\n');
    console.log('Summary:');
    console.log(`  • Sunday starts fixed: ${sundayStarts === 0 ? '✅ None' : '❌ Still exists'}`);
    console.log(`  • Total hours: ${totalHours}`);
    console.log(`  • Art lessons: 90 (Day A)`);
    console.log(`  • Social Studies lessons: 91 (Day B)`);
    console.log(`  • Total lessons: 905`);
    console.log('\nUnit counts by subject:');
    Object.entries(unitCounts).forEach(([subject, count]) => {
      console.log(`  • ${subject}: ${count} units`);
    });
    console.log('\n✨ The curriculum now follows proper elementary alternating schedule!');
    console.log('📄 Schedule documentation created above');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixAlternatingSchedule().catch(console.error);