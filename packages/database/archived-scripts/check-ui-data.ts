#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUIData() {
  console.log('🔍 CHECKING WHY DATA ISN\'T SHOWING IN UI\n');

  try {
    // Get Emily's user
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' },
      include: {
        longRangePlans: true,
        unitPlans: {
          include: {
            _count: {
              select: { lessonPlans: true }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily user not found!');
      return;
    }

    console.log('✅ Emily user found');
    console.log(`   User ID: ${emily.id}`);
    console.log(`   Name: ${emily.name}`);
    console.log(`   Grade: ${emily.grade || 'Not set'}`);
    console.log(`   School Year: ${emily.schoolYear || 'Not set'}`);

    // Check Long Range Plans
    console.log('\n📋 LONG RANGE PLANS:');
    console.log(`   Total: ${emily.longRangePlans?.length || 0}`);
    
    if (emily.longRangePlans?.length > 0) {
      emily.longRangePlans.forEach(lrp => {
        console.log(`   - ${lrp.title} (${lrp.yearStart})`);
      });
    } else {
      console.log('   ⚠️ No long range plans associated with Emily');
      
      // Check if any exist at all
      const allLRPs = await prisma.longRangePlan.count();
      console.log(`   Total in database: ${allLRPs}`);
    }

    // Check Unit Plans
    console.log('\n📚 UNIT PLANS:');
    console.log(`   Total: ${emily.unitPlans?.length || 0}`);
    
    if (emily.unitPlans?.length > 0) {
      console.log('\n   First 10 unit plans:');
      emily.unitPlans.slice(0, 10).forEach(unit => {
        const dateStr = unit.startDate ? unit.startDate.toLocaleDateString() : 'No date';
        console.log(`   - ${unit.title} (${dateStr}, ${unit._count.lessonPlans} lessons)`);
      });
      
      if (emily.unitPlans.length > 10) {
        console.log(`   ... and ${emily.unitPlans.length - 10} more`);
      }
    } else {
      console.log('   ⚠️ No unit plans associated with Emily');
      
      // Check if any exist at all
      const allUnits = await prisma.unitPlan.count();
      console.log(`   Total in database: ${allUnits}`);
      
      // Check if they have wrong userId
      const unitsWithoutUser = await prisma.unitPlan.findMany({
        where: { userId: null },
        select: { id: true, title: true }
      });
      
      if (unitsWithoutUser.length > 0) {
        console.log(`   ❌ Found ${unitsWithoutUser.length} unit plans without a user!`);
      }
      
      // Check if they're associated with wrong user
      const unitsWithWrongUser = await prisma.unitPlan.findMany({
        where: { 
          userId: { 
            not: emily.id 
          } 
        },
        select: { id: true, title: true, userId: true }
      });
      
      if (unitsWithWrongUser.length > 0) {
        console.log(`   ❌ Found ${unitsWithWrongUser.length} unit plans with different user!`);
      }
    }

    // Check Lesson Plans
    console.log('\n📖 LESSON PLANS:');
    const lessonCount = await prisma.eTFOLessonPlan.count({
      where: { userId: emily.id }
    });
    console.log(`   Total: ${lessonCount}`);

    // Check curriculum expectations
    console.log('\n🎯 CURRICULUM EXPECTATIONS:');
    const expectationCount = await prisma.curriculumExpectation.count();
    console.log(`   Total: ${expectationCount}`);

    // Check if Emily needs grade/year set
    console.log('\n⚙️ USER SETTINGS:');
    if (!emily.grade) {
      console.log('   ⚠️ Grade not set - this might affect UI display');
    }
    if (!emily.schoolYear) {
      console.log('   ⚠️ School year not set - this might affect UI display');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    const issues = [];
    
    if (emily.longRangePlans?.length === 0) {
      issues.push('No long range plans associated with user');
    }
    if (emily.unitPlans?.length === 0) {
      issues.push('No unit plans associated with user');
    }
    if (!emily.grade) {
      issues.push('User grade not set');
    }
    if (!emily.schoolYear) {
      issues.push('User school year not set');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(issue => console.log(`   • ${issue}`));
      console.log('\n💡 SOLUTION: We need to associate the existing data with Emily\'s user account');
    } else {
      console.log('\n✅ All data properly associated with user');
      console.log('   The UI should be showing this data.');
      console.log('   Check browser console for frontend errors.');
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUIData()
  .then(() => {
    console.log('\n✅ Data check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });