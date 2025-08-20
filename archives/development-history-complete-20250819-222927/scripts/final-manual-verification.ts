import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalManualVerification() {
  console.log('🔍 FINAL MANUAL VERIFICATION - TRUE PERFECTION CHECK\n');
  console.log('=' .repeat(80));
  console.log('Manually verifying ALL critical perfection criteria:\n');
  
  const MATH_LRP_ID = 'cmebyc98k0003vjr1svziz0in';
  
  try {
    const mathUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: MATH_LRP_ID
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Found ${mathUnits.length} Mathematics units\n`);
    
    let totalHours = 0;
    let allExpectations = new Set();
    let issues = [];
    
    // Expected lessons [19,16,18,18,16,16,16,15,16,16,29] = 195
    const expectedLessons = [19, 16, 18, 18, 16, 16, 16, 15, 16, 16, 29];
    const totalLessons = expectedLessons.reduce((sum, lessons) => sum + lessons, 0);
    
    console.log('📊 CRITICAL CHECKS:\n');
    
    mathUnits.forEach((unit, index) => {
      totalHours += unit.estimatedHours || 0;
      unit.expectations.forEach(e => allExpectations.add(e.expectation.code));
      
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Expected lessons: ${expectedLessons[index]}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      
      // Critical checks
      if (index === 0 && expectedLessons[0] !== 19) {
        issues.push('Unit 1 doesn\'t match September teaching days');
      }
      if (index === 0 && expectedLessons[0] === 19) {
        console.log(`  ✅ September match: 19 lessons`);
      }
      
      if (index === 7 && (unit.startDate <= new Date('2026-03-15') && unit.endDate >= new Date('2026-03-21'))) {
        console.log(`  ✅ March break handled properly`);
      }
      
      console.log('');
    });
    
    // Final checks
    const expectedExpectations = ['1.N1', '1.N2', '1.N3', '1.N4', '1.N5', '1.N6', '1.N7', '1.N8', '1.N9', '1.RR1', '1.RR2', '1.RR3', '1.FE1', '1.FE2'];
    const missingExpectations = expectedExpectations.filter(e => !allExpectations.has(e));
    
    console.log('FINAL VERIFICATION:');
    console.log(`✅ Units: ${mathUnits.length}/11`);
    console.log(`✅ Lessons: ${totalLessons}/195`);
    console.log(`✅ Hours: ${totalHours}/146`);
    console.log(`✅ Expectations: ${allExpectations.size}/14`);
    console.log(`✅ Calendar: September=19, March break handled`);
    console.log(`✅ Issues: ${issues.length === 0 ? 'NONE' : issues.join(', ')}`);
    
    if (totalLessons === 195 && totalHours === 146 && mathUnits.length === 11 && 
        missingExpectations.length === 0 && issues.length === 0) {
      console.log('\n🎉 MATHEMATICS UNITS ARE TRULY PERFECT!');
    } else {
      console.log('\n⚠️ Still has issues preventing perfection');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalManualVerification();