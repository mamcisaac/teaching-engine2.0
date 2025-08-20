import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createImplementableSchedule() {
  console.log('🔧 CREATING TRULY IMPLEMENTABLE ALTERNATING SCHEDULE\\n');
  console.log('═'.repeat(80));
  console.log('Fixing the pedagogically broken schedule I created\\n');
  
  try {
    // STRATEGY: True monthly alternation throughout the year
    // Month 1 (Sep): Social Studies
    // Month 2 (Oct): Health/FPS  
    // Month 3 (Nov): Social Studies
    // Month 4 (Dec): Health/FPS
    // Month 5 (Jan): Social Studies
    // Month 6 (Feb): Health/FPS
    // Month 7 (Mar): Social Studies
    // Month 8 (Apr): Health/FPS
    // Month 9 (May): Social Studies
    // Month 10 (Jun): Health/FPS
    
    console.log('📚 FIXING SOCIAL STUDIES - MONTHLY PERIODS\\n');
    
    const ssUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // 5 SS units across alternating months: Sep, Nov, Jan, Mar, May
    const ssPeriods = [
      { start: new Date('2025-09-03'), end: new Date('2025-09-30'), month: 'September' },
      { start: new Date('2025-11-03'), end: new Date('2025-11-28'), month: 'November' },
      { start: new Date('2026-01-06'), end: new Date('2026-01-31'), month: 'January' },
      { start: new Date('2026-03-16'), end: new Date('2026-04-11'), month: 'March' },
      { start: new Date('2026-05-05'), end: new Date('2026-05-30'), month: 'May' }
    ];
    
    for (let i = 0; i < ssUnits.length && i < ssPeriods.length; i++) {
      await prisma.unitPlan.update({
        where: { id: ssUnits[i].id },
        data: {
          startDate: ssPeriods[i].start,
          endDate: ssPeriods[i].end
        }
      });
      
      console.log(`✅ SS Unit ${i+1}: ${ssPeriods[i].month} (${ssPeriods[i].start.toISOString().split('T')[0]} to ${ssPeriods[i].end.toISOString().split('T')[0]})`);
    }
    
    console.log('\\n🏥 FIXING HEALTH/FPS - MONTHLY PERIODS\\n');
    
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // 5 Health units across alternating months: Oct, Dec, Feb, Apr, Jun
    const healthPeriods = [
      { start: new Date('2025-10-01'), end: new Date('2025-10-31'), month: 'October' },
      { start: new Date('2025-12-01'), end: new Date('2025-12-19'), month: 'December' },
      { start: new Date('2026-02-02'), end: new Date('2026-02-27'), month: 'February' },
      { start: new Date('2026-04-14'), end: new Date('2026-04-30'), month: 'April' },
      { start: new Date('2026-06-02'), end: new Date('2026-06-20'), month: 'June' }
    ];
    
    for (let i = 0; i < healthUnits.length && i < healthPeriods.length; i++) {
      await prisma.unitPlan.update({
        where: { id: healthUnits[i].id },
        data: {
          startDate: healthPeriods[i].start,
          endDate: healthPeriods[i].end
        }
      });
      
      console.log(`✅ Health Unit ${i+1}: ${healthPeriods[i].month} (${healthPeriods[i].start.toISOString().split('T')[0]} to ${healthPeriods[i].end.toISOString().split('T')[0]})`);
    }
    
    // VERIFICATION: Check implementation feasibility
    console.log('\\n🔍 VERIFICATION: IMPLEMENTATION FEASIBILITY\\n');
    
    const updatedSSUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    const updatedHealthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Check alternation pattern
    const allAlternatingUnits = [...updatedSSUnits.map(u => ({...u, type: 'SS'})), ...updatedHealthUnits.map(u => ({...u, type: 'Health'}))];
    allAlternatingUnits.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    console.log('📅 ALTERNATION PATTERN:');
    let properAlternation = true;
    let lastType = '';
    
    for (const unit of allAlternatingUnits) {
      const month = unit.startDate.toLocaleDateString('en-US', { month: 'long' });
      console.log(`  ${month}: ${unit.type} - ${unit.title}`);
      
      if (lastType === unit.type) {
        properAlternation = false;
      }
      lastType = unit.type;
    }
    
    // Check gaps
    let maxGap = 0;
    for (let i = 0; i < updatedSSUnits.length - 1; i++) {
      const current = updatedSSUnits[i];
      const next = updatedSSUnits[i + 1];
      const gapDays = Math.floor((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
      maxGap = Math.max(maxGap, gapDays);
    }
    
    console.log(`\\n📊 FEASIBILITY METRICS:`);
    console.log(`  ✅ Proper alternation: ${properAlternation ? 'YES' : 'NO'}`);
    console.log(`  📅 Maximum gap between SS units: ${maxGap} days`);
    console.log(`  🎯 Start gap: ${Math.floor((updatedHealthUnits[0].startDate.getTime() - updatedSSUnits[0].startDate.getTime()) / (1000 * 60 * 60 * 24))} days`);
    
    if (properAlternation && maxGap <= 60) {
      console.log('\\n🎉 IMPLEMENTABLE SCHEDULE ACHIEVED!');
      console.log('✅ Monthly alternation pattern');
      console.log('✅ Reasonable gaps for continuity');
      console.log('✅ Pedagogically sound structure');
    } else {
      console.log('\\n⚠️ Schedule still needs refinement');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createImplementableSchedule().catch(console.error);