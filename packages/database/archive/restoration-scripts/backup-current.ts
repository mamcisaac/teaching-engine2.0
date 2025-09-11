import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function backupCurrentState() {
  console.log('📦 Creating backup before restoration...');
  
  const units = await prisma.unitPlan.findMany({
    where: { userId: 23 },
    include: { 
      longRangePlan: true,
      expectations: true 
    }
  });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-before-restore-${timestamp}.json`;
  
  fs.writeFileSync(backupFile, JSON.stringify(units, null, 2));
  
  console.log(`✅ Backed up ${units.length} units to ${backupFile}`);
  console.log('');
  console.log('Current state of units:');
  
  const summary = await prisma.unitPlan.groupBy({
    by: ['longRangePlanId'],
    where: { userId: 23 },
    _count: true
  });
  
  for (const s of summary) {
    const lrp = await prisma.longRangePlan.findUnique({ 
      where: { id: s.longRangePlanId } 
    });
    console.log(`  ${lrp?.subject}: ${s._count} units`);
  }
  
  await prisma.$disconnect();
}

backupCurrentState();
