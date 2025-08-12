#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUnits() {
  // First get Emily's ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    throw new Error('Emily not found');
  }
  
  const units = await prisma.unitPlan.findMany({
    where: { userId: emily.id },
    include: {
      longRangePlan: {
        select: { subject: true }
      }
    },
    orderBy: [
      { longRangePlan: { subject: 'asc' } },
      { startDate: 'asc' }
    ]
  });
  
  console.log('All Unit Plans by Subject:');
  console.log('==========================\n');
  
  const bySubject = new Map();
  
  units.forEach(u => {
    const subject = u.longRangePlan.subject;
    if (!bySubject.has(subject)) {
      bySubject.set(subject, []);
    }
    bySubject.get(subject).push(u);
  });
  
  bySubject.forEach((units, subject) => {
    console.log(`${subject}:`);
    console.log('-'.repeat(50));
    units.forEach((u, index) => {
      const start = u.startDate.toISOString().split('T')[0];
      const end = u.endDate.toISOString().split('T')[0];
      console.log(`  ${index + 1}. ${u.titleFr || u.title}`);
      console.log(`     ${start} to ${end} (${u.estimatedHours || '?'} hours)`);
    });
    console.log('');
  });
  
  // Identify what should be October units (unit #2 for each subject)
  console.log('OCTOBER UNITS NEEDED (Unit #2 for each subject):');
  console.log('================================================');
  
  const octoberNeeded = [];
  bySubject.forEach((units, subject) => {
    if (units.length >= 2) {
      const unit2 = units[1];
      console.log(`✅ ${subject}: "${unit2.titleFr || unit2.title}"`);
      octoberNeeded.push(unit2);
    } else {
      console.log(`❌ ${subject}: No second unit found`);
    }
  });
  
  return octoberNeeded;
}

listAllUnits()
  .then(october => {
    console.log(`\nOctober units to create lessons for: ${october.length}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });