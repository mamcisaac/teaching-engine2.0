#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkComprehensiveData() {
  console.log('🔍 CHECKING COMPREHENSIVE DATABASE...\n');
  
  // Long Range Plans
  const longRangePlans = await prisma.longRangePlan.findMany({
    include: {
      _count: {
        select: {
          unitPlans: true,
          expectations: true
        }
      }
    }
  });
  
  console.log(`📚 LONG RANGE PLANS: ${longRangePlans.length}`);
  longRangePlans.forEach(plan => {
    console.log(`  - ${plan.subject}: ${plan._count.unitPlans} units, ${plan._count.expectations} expectations`);
  });
  
  // Unit Plans
  const unitPlans = await prisma.unitPlan.findMany({
    include: {
      longRangePlan: true,
      _count: {
        select: {
          lessonPlans: true
        }
      }
    }
  });
  
  console.log(`\n🎯 UNIT PLANS: ${unitPlans.length}`);
  const unitsBySubject: Record<string, number> = {};
  unitPlans.forEach(unit => {
    const subject = unit.longRangePlan.subject;
    unitsBySubject[subject] = (unitsBySubject[subject] || 0) + 1;
  });
  
  Object.entries(unitsBySubject).forEach(([subject, count]) => {
    console.log(`  - ${subject}: ${count} units`);
  });
  
  // Lesson Plans
  const lessonPlans = await prisma.eTFOLessonPlan.findMany({
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      }
    }
  });
  
  console.log(`\n📝 LESSON PLANS: ${lessonPlans.length}`);
  const lessonsBySubject: Record<string, number> = {};
  lessonPlans.forEach(lesson => {
    const subject = lesson.unitPlan.longRangePlan.subject;
    lessonsBySubject[subject] = (lessonsBySubject[subject] || 0) + 1;
  });
  
  Object.entries(lessonsBySubject).forEach(([subject, count]) => {
    console.log(`  - ${subject}: ${count} lessons`);
  });
  
  console.log(`\n🏆 TOTAL LESSONS: ${lessonPlans.length}`);
  
  await prisma.$disconnect();
}

checkComprehensiveData().catch(console.error);