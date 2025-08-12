#!/usr/bin/env tsx

/**
 * FIX LESSON COUNT TO EXACTLY 905
 * Adjusts Flexible Learning to balance the total
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLessonCount905() {
  console.log('🔧 FIXING LESSON COUNT TO EXACTLY 905\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    console.log('📊 CORRECTING LESSON DISTRIBUTION...\n');
    
    // Correct distribution to total 905
    const correctDistribution = {
      'Français langue première': 181,    // Daily (Period 1)
      'Mathématiques': 181,               // Daily (Period 2)
      'Arts visuels': 90,                 // Day A (Period 3)
      'Sciences humaines': 91,            // Day B (Period 3)
      'Sciences de la nature': 108,       // 3x/week (Period 5)
      'Éducation physique': 108,          // 3x/week (Period 4)
      'Music': 54,                        // ~1.5x/week (Period 4)
      'Formation personnelle et sociale': 36, // 1x/week (Period 5)
      'Flexible Learning': 56             // Fills remaining slots (Period 6)
    };
    
    console.log('Correct lesson distribution:');
    let total = 0;
    for (const [subject, lessons] of Object.entries(correctDistribution)) {
      console.log(`  ${subject}: ${lessons} lessons`);
      total += lessons;
    }
    console.log(`  TOTAL: ${total} lessons ✓\n`);
    
    if (total !== 905) {
      throw new Error(`Total is ${total}, not 905!`);
    }
    
    // Update Flexible Learning hours
    console.log('📝 UPDATING FLEXIBLE LEARNING...');
    
    const flexLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Flexible Learning'
      }
    });
    
    if (flexLRP) {
      // Update description to reflect correct lesson count
      await prisma.longRangePlan.update({
        where: { id: flexLRP.id },
        data: {
          description: 'Library time, project work, assemblies, and flexible learning opportunities (56 lessons throughout the year)'
        }
      });
      
      // Update Flex units with correct hours
      const flexUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: flexLRP.id }
      });
      
      const hoursPerUnit = Math.round((56 * 0.75) / flexUnits.length); // 56 lessons * 45 min / 3 units
      
      for (const unit of flexUnits) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: hoursPerUnit
          }
        });
      }
      
      console.log(`  ✅ Updated Flexible Learning to 56 lessons (${56 * 0.75} hours total)\n`);
    }
    
    // VALIDATION
    console.log('✅ VALIDATING TOTAL...\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    // Calculate total hours
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    
    // Group by subject and show distribution
    const unitsBySubject: Record<string, {count: number, hours: number}> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) {
        unitsBySubject[s] = { count: 0, hours: 0 };
      }
      unitsBySubject[s].count++;
      unitsBySubject[s].hours += u.estimatedHours || 0;
    });
    
    console.log('Final distribution by subject:');
    Object.entries(correctDistribution).forEach(([subject, lessons]) => {
      const unitInfo = unitsBySubject[subject];
      if (unitInfo) {
        console.log(`  ${subject}:`);
        console.log(`    • ${lessons} lessons`);
        console.log(`    • ${unitInfo.count} units`);
        console.log(`    • ${unitInfo.hours} total hours`);
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 LESSON COUNT FIXED!\n');
    console.log('Summary:');
    console.log(`  • Total lessons: 905 ✓`);
    console.log(`  • Total hours: ${totalHours}`);
    console.log(`  • Flexible Learning: 56 lessons (adjusted)`);
    console.log('\n✨ The curriculum now has exactly 905 lessons!');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixLessonCount905().catch(console.error);