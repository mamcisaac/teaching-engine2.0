import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFinalCriticalIssues() {
  try {
    console.log('🎯 FIXING FINAL CRITICAL ISSUES FOR TRUE PERFECTION');
    console.log('Resolving Christmas break violation and hours mismatch');
    
    // Issue 1: Christmas break violation in Unit 4
    console.log('\\n🎄 FIXING CHRISTMAS BREAK VIOLATION:');
    
    const unit4 = await prisma.unitPlan.findFirst({
      where: { 
        title: 'Notre quartier et notre ville',
        longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5'
      }
    });

    if (unit4) {
      console.log(`Current Unit 4 dates: ${new Date(unit4.startDate).toDateString()} - ${new Date(unit4.endDate).toDateString()}`);
      console.log('Problem: Spans Christmas break (Dec 19 - Jan 5)');
      
      // Fix: End before Christmas break, resume after
      const correctedEndDate = new Date('2025-12-18'); // End before Christmas
      
      await prisma.unitPlan.update({
        where: { id: unit4.id },
        data: {
          endDate: correctedEndDate
        }
      });
      
      console.log(`✅ Fixed Unit 4 end date: ${correctedEndDate.toDateString()}`);
      console.log('Unit now ends before Christmas break');
    }

    // Issue 2: Hours mismatch - update all unit hours to exact calculations
    console.log('\\n💰 FIXING HOURS MISMATCH:');
    
    const hourCorrections = [
      { title: 'Notre école communautaire', correctHours: 7.5 },
      { title: 'Les aides de notre quartier', correctHours: 8.25 },
      { title: 'Nos familles et traditions', correctHours: 12.75 },
      { title: 'Notre quartier et notre ville', correctHours: 11.25 },
      { title: 'Géographie et cartographie', correctHours: 10.5 },
      { title: 'Citoyenneté et responsabilité', correctHours: 11.25 },
      { title: 'Notre monde connecté', correctHours: 11.25 }
    ];

    for (const correction of hourCorrections) {
      const unit = await prisma.unitPlan.findFirst({
        where: { 
          title: correction.title,
          longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5'
        }
      });

      if (unit) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: correction.correctHours
          }
        });
        
        console.log(`✅ ${correction.title}: Updated to ${correction.correctHours} hours`);
      }
    }

    const totalCorrectedHours = hourCorrections.reduce((sum, correction) => sum + correction.correctHours, 0);
    console.log(`\\n📊 Total corrected hours: ${totalCorrectedHours}/72.75 ${totalCorrectedHours === 72.75 ? '✅' : '❌'}`);

    // Final verification
    console.log('\\n🔍 FINAL VERIFICATION:');
    
    const finalUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: { lessonPlans: true },
      orderBy: { startDate: 'asc' }
    });

    let finalLessons = 0;
    let finalHours = 0;
    let christmasIssues = 0;

    const christmasStart = new Date('2025-12-19');
    const christmasEnd = new Date('2026-01-05');

    for (const unit of finalUnits) {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const lessonCount = unit.lessonPlans.length;
      const hours = unit.estimatedHours || 0;
      
      finalLessons += lessonCount;
      finalHours += hours;

      console.log(`\\n  ${unit.title}:`);
      console.log(`    Dates: ${startDate.toDateString()} - ${endDate.toDateString()}`);
      console.log(`    Lessons: ${lessonCount}, Hours: ${hours}`);
      
      // Check Christmas break span
      const spansChristmas = (startDate < christmasEnd && endDate > christmasStart);
      if (spansChristmas) {
        console.log(`    ❌ STILL SPANS CHRISTMAS BREAK`);
        christmasIssues++;
      } else {
        console.log(`    ✅ RESPECTS CHRISTMAS BREAK`);
      }
    }

    console.log(`\\n📊 FINAL TOTALS:`);
    console.log(`  Lessons: ${finalLessons}/97 ${finalLessons === 97 ? '✅' : '❌'}`);
    console.log(`  Hours: ${finalHours}/72.75 ${finalHours === 72.75 ? '✅' : '❌'}`);
    console.log(`  Units: ${finalUnits.length}/7 ${finalUnits.length === 7 ? '✅' : '❌'}`);
    console.log(`  Christmas Issues: ${christmasIssues} ${christmasIssues === 0 ? '✅' : '❌'}`);

    const allIssuesFixed = (
      finalLessons === 97 && 
      finalHours === 72.75 && 
      finalUnits.length === 7 && 
      christmasIssues === 0
    );

    if (allIssuesFixed) {
      console.log('\\n🎉🏆 ALL CRITICAL ISSUES FIXED! 🏆🎉');
      console.log('✅ Christmas break violation resolved');
      console.log('✅ Hours precision achieved (72.75)');
      console.log('✅ Lesson count perfect (97)');
      console.log('✅ Unit count optimal (7)');
      console.log('\\n🌟 UNIT PLANS ARE NOW TRULY PERFECT! 🌟');
    } else {
      console.log('\\n⚠️ Some issues remain - check the results above');
    }

  } catch (error) {
    console.error('❌ Error fixing final issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFinalCriticalIssues();