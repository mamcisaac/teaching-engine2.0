import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultraCompactPeriods() {
  console.log('🎯 CREATING ULTRA-COMPACT PERIODS - ZERO OVERLAPS\\n');
  
  try {
    // STRATEGY: Make alternating units truly sequential with NO overlaps
    // SS units will be: Sep, Nov, Jan, Mar, May
    // Health units will be: Oct, Dec, Feb, Apr, Jun
    
    console.log('📚 STEP 1: SEQUENTIAL SOCIAL STUDIES PERIODS\\n');
    
    const ssUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Ultra-compact SS periods - each roughly 1 month, no overlap with Health
    const ssPeriods = [
      { start: new Date('2025-09-03'), end: new Date('2025-10-10') },
      { start: new Date('2025-11-12'), end: new Date('2025-12-05') },
      { start: new Date('2026-01-06'), end: new Date('2026-02-06') },
      { start: new Date('2026-03-16'), end: new Date('2026-04-11') },
      { start: new Date('2026-05-12'), end: new Date('2026-06-18') }
    ];
    
    for (let i = 0; i < ssUnits.length && i < ssPeriods.length; i++) {
      await prisma.unitPlan.update({
        where: { id: ssUnits[i].id },
        data: {
          startDate: ssPeriods[i].start,
          endDate: ssPeriods[i].end
        }
      });
      
      console.log(`✅ SS Unit ${i+1}: ${ssPeriods[i].start.toISOString().split('T')[0]} to ${ssPeriods[i].end.toISOString().split('T')[0]}`);
    }
    
    console.log('\\n🏥 STEP 2: SEQUENTIAL HEALTH/FPS PERIODS\\n');
    
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Ultra-compact Health periods - fit between SS periods
    const healthPeriods = [
      { start: new Date('2025-10-14'), end: new Date('2025-11-08') },
      { start: new Date('2025-12-09'), end: new Date('2026-01-03') },
      { start: new Date('2026-02-10'), end: new Date('2026-03-13') },
      { start: new Date('2026-04-14'), end: new Date('2026-05-09') },
      { start: new Date('2026-06-19'), end: new Date('2026-06-20') }
    ];
    
    for (let i = 0; i < healthUnits.length && i < healthPeriods.length; i++) {
      await prisma.unitPlan.update({
        where: { id: healthUnits[i].id },
        data: {
          startDate: healthPeriods[i].start,
          endDate: healthPeriods[i].end
        }
      });
      
      console.log(`✅ Health Unit ${i+1}: ${healthPeriods[i].start.toISOString().split('T')[0]} to ${healthPeriods[i].end.toISOString().split('T')[0]}`);
    }
    
    // STEP 3: Final overlap verification
    console.log('\\n🔍 STEP 3: FINAL OVERLAP VERIFICATION\\n');
    
    const allSSUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    const allHealthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let totalOverlaps = 0;
    
    // Check SS internal overlaps
    for (let i = 0; i < allSSUnits.length - 1; i++) {
      const current = allSSUnits[i];
      const next = allSSUnits[i + 1];
      
      if (current.endDate >= next.startDate) {
        totalOverlaps++;
        console.log(`❌ SS Internal Overlap: Unit ${i+1} ↔ Unit ${i+2}`);
      }
    }
    
    // Check Health internal overlaps
    for (let i = 0; i < allHealthUnits.length - 1; i++) {
      const current = allHealthUnits[i];
      const next = allHealthUnits[i + 1];
      
      if (current.endDate >= next.startDate) {
        totalOverlaps++;
        console.log(`❌ Health Internal Overlap: Unit ${i+1} ↔ Unit ${i+2}`);
      }
    }
    
    // Check cross-subject overlaps
    for (const ssUnit of allSSUnits) {
      for (const healthUnit of allHealthUnits) {
        if (ssUnit.startDate <= healthUnit.endDate && ssUnit.endDate >= healthUnit.startDate) {
          totalOverlaps++;
          console.log(`❌ Cross Overlap: SS "${ssUnit.title}" ↔ Health "${healthUnit.title}"`);
        }
      }
    }
    
    if (totalOverlaps === 0) {
      console.log('🎉 ZERO OVERLAPS ACHIEVED!');
      console.log('✅ Ultra-compact periods perfected');
      console.log('✅ True alternating schedule implemented');
    } else {
      console.log(`❌ ${totalOverlaps} overlaps still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ultraCompactPeriods().catch(console.error);