#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFPSPerfection() {
  try {
    console.log('🔍 VERIFYING FPS PERFECTION - DETAILED ANALYSIS');
    console.log('================================================\n');
    
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        OR: [
          { title: { contains: 'Personal and Social Development' } },
          { title: { contains: 'Formation personnelle et sociale' } },
          { subject: 'Formation personnelle et sociale' }
        ]
      }
    });
    
    if (!fpsLRP) {
      console.log('❌ FPS LRP not found');
      return;
    }
    
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`📋 Analyzing ${units.length} FPS units\n`);
    
    // Check differentiation strategies in detail
    units.forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.titleFr || unit.title}`);
      console.log('----------------------------------------');
      
      const diff = unit.differentiationStrategies as any;
      
      if (diff) {
        // Check for emotional safety
        if (diff.emotionalSafety) {
          console.log('✅ Emotional Safety Protocols: PRESENT');
          console.log(`   - Trauma Informed: ${diff.emotionalSafety.traumaInformed}`);
          console.log(`   - Protocols: ${diff.emotionalSafety.protocols?.length || 0} protocols`);
          console.log(`   - Unit Specific: ${diff.emotionalSafety.unitSpecific?.length || 0} specific protocols`);
        } else {
          console.log('❌ Emotional Safety Protocols: MISSING');
        }
        
        // Check for Grade 1 appropriateness
        if (diff.grade1Appropriate) {
          console.log('✅ Grade 1 Appropriateness: PRESENT');
          console.log(`   - Developmental Level: ${diff.grade1Appropriate.developmentalLevel}`);
          console.log(`   - Strategies: ${diff.grade1Appropriate.strategies?.length || 0} strategies`);
          console.log(`   - Attention Span: ${diff.grade1Appropriate.attentionSpan}`);
        } else {
          console.log('❌ Grade 1 Appropriateness: MISSING');
        }
      } else {
        console.log('❌ No differentiation strategies found');
      }
      
      // Show actual dates and lesson calculation
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const potentialLessons = Math.floor(daysDiff / 2);
      
      console.log(`\nTiming: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      console.log(`Duration: ${daysDiff} days → ${potentialLessons} potential lessons`);
      console.log(`Estimated Hours: ${unit.estimatedHours}`);
    });
    
    // Overall assessment
    console.log('\n\n🎯 OVERALL PERFECTION ASSESSMENT:');
    console.log('==================================');
    
    let totalLessons = 0;
    let allHaveSafety = true;
    let allHaveGrade1 = true;
    let allInETFORange = true;
    
    units.forEach((unit) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const potentialLessons = Math.floor(daysDiff / 2);
      totalLessons += potentialLessons;
      
      if (potentialLessons < 12 || potentialLessons > 16) {
        allInETFORange = false;
      }
      
      const diff = unit.differentiationStrategies as any;
      if (!diff?.emotionalSafety) allHaveSafety = false;
      if (!diff?.grade1Appropriate) allHaveGrade1 = false;
    });
    
    console.log(`Total Lessons: ${totalLessons} (Target: 98)`);
    console.log(`Emotional Safety: ${allHaveSafety ? '✅ All units have protocols' : '❌ Some units missing'}`);
    console.log(`Grade 1 Appropriateness: ${allHaveGrade1 ? '✅ All units have indicators' : '❌ Some units missing'}`);
    console.log(`ETFO Range (12-16): ${allInETFORange ? '✅ All units compliant' : '❌ Some units outside range'}`);
    
    if (totalLessons === 98 && allHaveSafety && allHaveGrade1 && allInETFORange) {
      console.log('\n🏆 PERFECTION CONFIRMED: All criteria met!');
    } else {
      console.log('\n⚠️ ISSUES REMAIN: Further adjustments needed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyFPSPerfection()
  .then(() => {
    console.log('\n✅ Verification complete');
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });