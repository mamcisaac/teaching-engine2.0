#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFPSState() {
  try {
    console.log('📊 ANALYZING CURRENT FPS UNIT STATE FOR PERFECTION PLAN');
    console.log('========================================================\n');
    
    // Get Emily's FPS units
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
    
    console.log('📅 CURRENT UNIT DATE RANGES:\n');
    units.forEach((unit, index) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      console.log(`Unit ${index + 1}: ${unit.titleFr || unit.title}`);
      console.log(`  Start: ${startDate.toISOString().split('T')[0]}`);
      console.log(`  End: ${endDate.toISOString().split('T')[0]}`);
      console.log(`  Duration: ${daysDiff} days`);
      console.log(`  Potential lessons (every-other-day): ${Math.floor(daysDiff / 2)}`);
      console.log('');
    });
    
    console.log('\n📊 WHAT NEEDS TO BE FIXED:');
    console.log('==========================\n');
    
    console.log('1. DATE RANGES - Need exactly 14 lessons per unit:');
    console.log('   • Each unit should span ~28 days (for every-other-day delivery)');
    console.log('   • 7 units × 14 lessons = 98 lessons total');
    console.log('   • Must account for holidays and breaks\n');
    
    console.log('2. EMOTIONAL SAFETY - Critical for Health/FPS:');
    console.log('   • Add trauma-informed protocols to differentiationStrategies');
    console.log('   • Include private expression options');
    console.log('   • Ensure no forced sharing of personal information\n');
    
    console.log('3. GRADE 1 APPROPRIATENESS - Essential for 6-7 year olds:');
    console.log('   • Concrete learning experiences over abstract');
    console.log('   • Visual supports and hands-on activities');
    console.log('   • Short attention span considerations\n');
    
    console.log('📅 PROPOSED NEW DATE RANGES (28 days each):');
    console.log('============================================\n');
    
    const proposedDates = [
      { unit: 1, start: '2025-09-02', end: '2025-09-30' },
      { unit: 2, start: '2025-10-01', end: '2025-10-31' },
      { unit: 3, start: '2025-11-03', end: '2025-12-05' },
      { unit: 4, start: '2025-12-08', end: '2026-01-16' },
      { unit: 5, start: '2026-01-19', end: '2026-02-20' },
      { unit: 6, start: '2026-02-23', end: '2026-03-27' },
      { unit: 7, start: '2026-03-30', end: '2026-05-01' }
    ];
    
    proposedDates.forEach(({ unit, start, end }) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const lessons = Math.floor(daysDiff / 2);
      
      console.log(`Unit ${unit}: ${start} to ${end}`);
      console.log(`  Duration: ${daysDiff} days`);
      console.log(`  Lessons (every-other-day): ${lessons}`);
      console.log('');
    });
    
    console.log('\n🔧 CONTENT ENHANCEMENTS NEEDED:');
    console.log('================================\n');
    
    console.log('For differentiationStrategies JSON field:');
    console.log('• Add "emotionalSafety" object with protocols');
    console.log('• Add "grade1Appropriate" object with strategies');
    console.log('• Keep existing differentiation levels\n');
    
    console.log('Example structure:');
    console.log(JSON.stringify({
      forStruggling: ["existing strategies..."],
      forOnLevel: ["existing strategies..."],
      forAdvanced: ["existing strategies..."],
      forELL: ["existing strategies..."],
      emotionalSafety: {
        protocols: [
          "Private feelings check-ins",
          "Choice in sharing",
          "Alternative expressions",
          "Calm-down spaces"
        ],
        traumaInformed: true
      },
      grade1Appropriate: {
        strategies: [
          "Concrete learning experiences",
          "Visual supports throughout",
          "Hands-on activities",
          "5-10 minute activity chunks"
        ],
        developmentalLevel: "Ages 6-7"
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFPSState()
  .then(() => {
    console.log('\n✅ Analysis complete');
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });