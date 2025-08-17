#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function checkExistingUnits() {
  console.log('📋 Checking existing unit plans for Emily McIsaac (ID 23)...\n');

  // Find all units for Emily
  const units = await prisma.unitPlan.findMany({
    where: {
      userId: 23
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      longRangePlan: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  console.log(`Found ${units.length} unit plans\n`);
  
  units.forEach((unit, i) => {
    console.log(`${i+1}. ${unit.title}`);
    console.log(`   ID: ${unit.id}`);
    console.log(`   Long Range Plan: ${unit.longRangePlan?.title || 'None'} (ID: ${unit.longRangePlan?.id || 'None'})`);
    console.log(`   Dates: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}\n`);
  });

  // Check long range plans
  const longRangePlans = await prisma.longRangePlan.findMany({
    where: {
      userId: 23
    },
    select: {
      id: true,
      title: true,
      schoolYear: true
    }
  });

  console.log(`\n📅 Long Range Plans (${longRangePlans.length}):`);
  longRangePlans.forEach((plan, i) => {
    console.log(`${i+1}. ${plan.title} - ${plan.schoolYear}`);
    console.log(`   ID: ${plan.id}\n`);
  });

  await prisma.$disconnect();
}

checkExistingUnits().catch(console.error);