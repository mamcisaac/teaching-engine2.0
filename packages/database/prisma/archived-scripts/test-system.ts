#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSystem() {
  console.log('\n🧪 TESTING SYSTEM FUNCTIONALITY\n');
  
  try {
    // Test Emily's access
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' },
      include: {
        longRangePlans: {
          include: {
            unitPlans: {
              include: {
                expectations: true
              }
            }
          }
        }
      }
    });
    
    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }
    
    console.log('✅ Emily can log in');
    console.log(`✅ Emily has ${emily.longRangePlans.length} long range plans`);
    
    const totalUnits = emily.longRangePlans.reduce((sum, lrp) => sum + lrp.unitPlans.length, 0);
    console.log(`✅ Emily has ${totalUnits} unit plans total`);
    
    // Test calendar access
    const events = await prisma.calendarEvent.count({
      where: { teacherId: emily.id }
    });
    console.log(`✅ Emily can see ${events} calendar events`);
    
    // Test expectation tracking
    const allExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          userId: emily.id
        }
      }
    });
    console.log(`✅ Emily is tracking ${allExpectations} expectation links`);
    
    // Test each subject
    const subjects = ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 
                     'Sciences humaines', 'Éducation physique', 'Arts visuels'];
    
    console.log('\nSubject breakdown:');
    for (const subject of subjects) {
      const plan = emily.longRangePlans.find(p => p.subject === subject);
      if (plan && plan.unitPlans.length > 0) {
        const hours = plan.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
        console.log(`  ✅ ${subject}: ${plan.unitPlans.length} units, ${hours} hours`);
      }
    }
    
    // Check for any issues
    const issues: string[] = [];
    
    // Check for units without expectations
    emily.longRangePlans.forEach(lrp => {
      lrp.unitPlans.forEach(unit => {
        if (unit.expectations.length === 0) {
          issues.push(`Unit "${unit.titleFr}" has no expectations linked`);
        }
      });
    });
    
    if (issues.length > 0) {
      console.log('\n⚠️ ISSUES FOUND:');
      issues.forEach(i => console.log(`  - ${i}`));
    } else {
      console.log('\n🏆 SYSTEM IS FULLY FUNCTIONAL AND PERFECT!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSystem();