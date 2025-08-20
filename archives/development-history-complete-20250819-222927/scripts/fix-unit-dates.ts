import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnitDates() {
  console.log('🔧 FIXING UNIT DATES FOR PERFECT ETFO COMPLIANCE\n');
  
  try {
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log('Current date issues:');
    units.forEach((unit, index) => {
      const weeks = Math.round((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      console.log(`Unit ${index + 1}: ${weeks} weeks - ${unit.title}`);
    });
    
    console.log('\n🔧 Adjusting problematic units...\n');
    
    // Fix Unit 4: Patterns and Shapes (currently 5 weeks, needs to be 4 weeks)
    const unit4Id = units[3].id;
    await prisma.unitPlan.update({
      where: { id: unit4Id },
      data: {
        startDate: new Date('2025-11-17'),
        endDate: new Date('2025-12-12')  // Shortened from Dec 19 to Dec 12
      }
    });
    console.log('✅ Fixed Unit 4: Now Nov 17 - Dec 12 (4 weeks)');
    
    // Fix Unit 10: Equality and Data (currently 1 week, needs to be 2 weeks minimum)
    const unit10Id = units[9].id;
    await prisma.unitPlan.update({
      where: { id: unit10Id },
      data: {
        startDate: new Date('2026-05-26'),  // Started earlier
        endDate: new Date('2026-06-10')     // Keep same end date
      }
    });
    console.log('✅ Fixed Unit 10: Now May 26 - June 10 (2+ weeks)');
    
    // Also need to adjust Unit 5 start date to account for Unit 4 change
    const unit5Id = units[4].id;
    await prisma.unitPlan.update({
      where: { id: unit5Id },
      data: {
        startDate: new Date('2026-01-05'),  // Start after winter break
        endDate: new Date('2026-02-02')     // Adjusted accordingly
      }
    });
    console.log('✅ Adjusted Unit 5: Jan 5 - Feb 2 (4 weeks)');
    
    // Adjust subsequent units
    const unit6Id = units[5].id;
    await prisma.unitPlan.update({
      where: { id: unit6Id },
      data: {
        startDate: new Date('2026-02-03'),
        endDate: new Date('2026-02-27')
      }
    });
    console.log('✅ Adjusted Unit 6: Feb 3 - Feb 27 (3.5 weeks)');
    
    const unit7Id = units[6].id;
    await prisma.unitPlan.update({
      where: { id: unit7Id },
      data: {
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-03-27')
      }
    });
    console.log('✅ Adjusted Unit 7: Mar 2 - Mar 27 (3.5 weeks)');
    
    const unit8Id = units[7].id;
    await prisma.unitPlan.update({
      where: { id: unit8Id },
      data: {
        startDate: new Date('2026-03-30'),
        endDate: new Date('2026-04-25')
      }
    });
    console.log('✅ Adjusted Unit 8: Mar 30 - Apr 25 (4 weeks)');
    
    const unit9Id = units[8].id;
    await prisma.unitPlan.update({
      where: { id: unit9Id },
      data: {
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-05-23')
      }
    });
    console.log('✅ Adjusted Unit 9: Apr 28 - May 23 (3.5 weeks)');
    
    console.log('\n📊 VERIFICATION: Checking all units...\n');
    
    // Verify all units
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    let allCompliant = true;
    updatedUnits.forEach((unit, index) => {
      const weeks = Math.round((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const compliant = weeks >= 2 && weeks <= 4;
      if (!compliant) allCompliant = false;
      
      console.log(`Unit ${index + 1}: ${weeks} weeks ${compliant ? '✅' : '❌'} - ${unit.title}`);
      console.log(`   ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 ETFO COMPLIANCE: ${allCompliant ? '✅ PERFECT' : '❌ ISSUES REMAIN'}`);
    
    if (allCompliant) {
      console.log('🏆 ALL 10 UNITS ARE NOW 2-4 WEEKS!');
      console.log('✨ TRUE PERFECTION ACHIEVED!');
    }
    
  } catch (error) {
    console.error('Error fixing dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnitDates();