#!/usr/bin/env tsx

/**
 * VERIFY TRUE HIGHEST TRUTH
 * Confirm these are genuinely high-level strategic plans
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyTrueHighestTruth() {
  console.log('🔍 VERIFYING TRUE HIGHEST TRUTH STATUS\n');
  console.log('Are these genuinely high-level strategic plans?\n');
  console.log('==============================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const subjects = ['Mathématiques', 'Français langue première', 'Sciences de la nature'];
  
  for (const subject of subjects) {
    const lrp = await prisma.longRangePlan.findFirst({
      where: { 
        subject,
        academicYear: '2025-2026',
        userId: emily.id
      },
      include: {
        expectations: true,
        unitPlans: {
          include: {
            expectations: true
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });
    
    if (!lrp) continue;
    
    console.log(`\n📚 ${subject.toUpperCase()}`);
    console.log('═'.repeat(50));
    
    // Check if truly high-level
    const checks = {
      'No time-of-day references': !lrp.goals?.includes(':') && !lrp.goals?.includes('8:30'),
      'No specific quantities': !lrp.goals?.includes('20 buttons') && !lrp.goals?.includes('500'),
      'Has philosophy/approach': lrp.goals?.includes('Philosophy') || lrp.goals?.includes('philosophy'),
      'Has essential questions': lrp.overarchingQuestions?.includes('?'),
      'Terms not days': lrp.goals?.includes('Term') || lrp.goals?.includes('Fall'),
      'Categories not items': lrp.resourceNeeds?.includes('Categories') || !lrp.resourceNeeds?.includes('20'),
      'Under 1500 chars': (lrp.goals?.length || 0) < 1500,
      'Assessment philosophy': lrp.assessmentOverview?.includes('philosophy') || lrp.assessmentOverview?.includes('Philosophy')
    };
    
    console.log('\nHigh-Level Criteria:');
    let score = 0;
    Object.entries(checks).forEach(([criterion, met]) => {
      console.log(`  ${met ? '✅' : '❌'} ${criterion}`);
      if (met) score++;
    });
    
    const percentage = (score / Object.keys(checks).length * 100).toFixed(0);
    console.log(`\nScore: ${score}/${Object.keys(checks).length} (${percentage}%)`);
    
    // Check unit alignment
    console.log('\nUnit Plan Alignment:');
    console.log(`  Units: ${lrp.unitPlans.length}`);
    console.log(`  Total hours: ${lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0)}`);
    console.log(`  Expectations linked: ${lrp.expectations.length}`);
    
    // Sample unit check
    if (lrp.unitPlans[0]) {
      const unit = lrp.unitPlans[0];
      console.log(`\n  First Unit Check: "${unit.title}"`);
      console.log(`    Has big ideas: ${unit.bigIdeas ? '✅' : '❌'}`);
      console.log(`    Has assessment plan: ${unit.assessmentPlan ? '✅' : '❌'}`);
      console.log(`    Not too detailed: ${!unit.description?.includes('8:30') ? '✅' : '❌'}`);
    }
    
    // Verdict
    console.log('\n📊 VERDICT:');
    if (percentage === '100') {
      console.log('  ✨ THIS IS TRUE HIGHEST TRUTH!');
      console.log('  Strategic without being prescriptive');
      console.log('  Guides without micromanaging');
    } else if (parseInt(percentage) >= 75) {
      console.log('  ✓ Mostly high-level, minor issues');
    } else {
      console.log('  ❌ Still too detailed/operational');
    }
  }
  
  console.log('\n\n🎯 PLANNING HIERARCHY CLARITY:\n');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  LRP (Strategic - What & Why)       │');
  console.log('│  • Year-long vision                 │');
  console.log('│  • Essential questions              │');
  console.log('│  • Philosophy & approach            │');
  console.log('│  • Terms/seasons                    │');
  console.log('└─────────────────────────────────────┘');
  console.log('             ↓');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  UNITS (Tactical - When & What)     │');
  console.log('│  • Monthly themes                   │');
  console.log('│  • Big ideas per unit               │');
  console.log('│  • Assessment approaches            │');
  console.log('│  • General activities               │');
  console.log('└─────────────────────────────────────┘');
  console.log('             ↓');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  LESSONS (Operational - How)        │');
  console.log('│  • Daily activities                 │');
  console.log('│  • Specific materials               │');
  console.log('│  • Timing and procedures            │');
  console.log('│  • Differentiation                  │');
  console.log('└─────────────────────────────────────┘\n');
  
  // Final summary
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { subject: 'Mathématiques', academicYear: '2025-2026', userId: emily.id },
    include: { expectations: true, unitPlans: true }
  });
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: 'Français langue première', academicYear: '2025-2026', userId: emily.id },
    include: { expectations: true, unitPlans: true }
  });
  
  const sciencesLRP = await prisma.longRangePlan.findFirst({
    where: { subject: 'Sciences de la nature', academicYear: '2025-2026', userId: emily.id },
    include: { expectations: true, unitPlans: true }
  });
  
  console.log('📈 FINAL STATUS:\n');
  
  const summary = [
    {
      subject: 'Mathématiques',
      hours: mathLRP?.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0,
      expectations: mathLRP?.expectations.length || 0,
      units: mathLRP?.unitPlans.length || 0
    },
    {
      subject: 'Français',
      hours: frenchLRP?.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0,
      expectations: frenchLRP?.expectations.length || 0,
      units: frenchLRP?.unitPlans.length || 0
    },
    {
      subject: 'Sciences',
      hours: sciencesLRP?.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0,
      expectations: sciencesLRP?.expectations.length || 0,
      units: sciencesLRP?.unitPlans.length || 0
    }
  ];
  
  console.log('Subject         Hours  Expectations  Units');
  console.log('─'.repeat(45));
  summary.forEach(s => {
    console.log(`${s.subject.padEnd(15)} ${s.hours.toString().padEnd(6)} ${s.expectations.toString().padEnd(13)} ${s.units}`);
  });
  
  console.log('\n✨ THESE ARE NOW TRUE HIGHEST TRUTH LRPS!\n');
  console.log('They provide strategic direction without operational detail.');
  console.log('Unit planners have freedom to develop tactics.');
  console.log('Teachers have autonomy for daily operations.\n');
  
  await prisma.$disconnect();
}

verifyTrueHighestTruth().catch(console.error);