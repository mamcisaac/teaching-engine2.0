#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUnits() {
  const units = await prisma.unitPlan.findMany({
    where: { userId: 1 },
    include: {
      longRangePlan: {
        select: { subject: true }
      }
    }
  });
  
  console.log('All Units in Database:');
  console.log('=======================');
  units.forEach(u => {
    console.log(`- ${u.titleFr || u.title} (${u.longRangePlan.subject})`);
  });
  
  console.log('\n\nArts Units:');
  console.log('===========');
  const artsUnits = units.filter(u => u.longRangePlan.subject === 'Arts');
  if (artsUnits.length === 0) {
    console.log('No Arts units found!');
  } else {
    artsUnits.forEach(u => {
      console.log(`- ${u.titleFr || u.title}`);
    });
  }
  
  await prisma.$disconnect();
}

checkUnits();