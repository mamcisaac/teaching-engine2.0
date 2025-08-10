#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOctoberUnits() {
  const units = await prisma.unitPlan.findMany({
    where: { 
      userId: 1,
      startDate: {
        gte: new Date('2025-10-01'),
        lte: new Date('2025-10-31')
      }
    },
    include: {
      longRangePlan: {
        select: { subject: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });
  
  console.log('October 2025 Units:');
  console.log('===================');
  
  if (units.length === 0) {
    console.log('No October units found - checking units that span October...\n');
    
    // Check for units that span October
    const spanningUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 1,
        startDate: { lte: new Date('2025-10-31') },
        endDate: { gte: new Date('2025-10-01') }
      },
      include: {
        longRangePlan: {
          select: { subject: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('Units spanning October:');
    console.log('=======================');
    spanningUnits.forEach(u => {
      const start = u.startDate.toISOString().split('T')[0];
      const end = u.endDate.toISOString().split('T')[0];
      console.log(`- ${u.titleFr || u.title} (${u.longRangePlan.subject})`);
      console.log(`  Duration: ${start} to ${end}`);
      console.log(`  Hours: ${u.estimatedHours || 'Unknown'}`);
    });
    
    return spanningUnits;
  } else {
    units.forEach(u => {
      const start = u.startDate.toISOString().split('T')[0];
      const end = u.endDate.toISOString().split('T')[0];
      console.log(`- ${u.titleFr || u.title} (${u.longRangePlan.subject})`);
      console.log(`  Duration: ${start} to ${end}`);
    });
    
    return units;
  }
}

checkOctoberUnits()
  .then(units => {
    console.log(`\nTotal units for October: ${units.length}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });