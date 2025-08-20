import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewAnalysis() {
  console.log('🔍 CRITICAL REVIEW: DATE CONVERSION ANALYSIS\n');
  console.log('═'.repeat(80));
  console.log('📋 Analyzing implementation for perfection requirements\n');
  
  // 1. Analyze all Long Range Plans
  const allLRPs = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  console.log('📊 SYSTEM OVERVIEW:');
  console.log('─'.repeat(50));
  console.log(`Total LRPs: ${allLRPs.length}`);
  console.log(`Total Units: ${allLRPs.reduce((sum, lrp) => sum + lrp.unitPlans.length, 0)}\n`);
  
  // 2. Identify issues
  const issues: string[] = [];
  const analysis: any = {};
  
  for (const lrp of allLRPs) {
    const subject = lrp.subject;
    const unitCount = lrp.unitPlans.length;
    const totalHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    
    // Calculate total school days used
    let totalDays = 0;
    lrp.unitPlans.forEach(unit => {
      const days = Math.ceil((unit.estimatedHours || 0) / 0.75);
      totalDays += days;
    });
    
    analysis[subject] = {
      units: unitCount,
      hours: totalHours,
      days: totalDays,
      expectedUnits: 0,
      expectedHours: 0,
      expectedDays: 0,
      issues: []
    };
    
    // Set expectations based on subject
    if (subject.includes('Français')) {
      analysis[subject].expectedUnits = 10;
      analysis[subject].expectedHours = 146.25;
      analysis[subject].expectedDays = 195;
    } else if (subject.includes('Mathématiques')) {
      analysis[subject].expectedUnits = 10;
      analysis[subject].expectedHours = 146.25;
      analysis[subject].expectedDays = 195;
    } else if (subject.includes('Sciences de la nature')) {
      analysis[subject].expectedUnits = 10;
      analysis[subject].expectedHours = 146.25;
      analysis[subject].expectedDays = 195;
    } else if (subject.includes('Arts')) {
      analysis[subject].expectedUnits = 10;
      analysis[subject].expectedHours = 146.25;
      analysis[subject].expectedDays = 195;
    } else if (subject.includes('Sciences humaines')) {
      analysis[subject].expectedUnits = 5;
      analysis[subject].expectedHours = 72.75;
      analysis[subject].expectedDays = 97;
    } else if (subject.includes('Formation personnelle')) {
      analysis[subject].expectedUnits = 5; // Should be 6?
      analysis[subject].expectedHours = 73.5;
      analysis[subject].expectedDays = 98;
    }
    
    // Check for issues
    if (unitCount !== analysis[subject].expectedUnits) {
      const issue = `${subject}: Has ${unitCount} units, expected ${analysis[subject].expectedUnits}`;
      issues.push(issue);
      analysis[subject].issues.push(issue);
    }
    
    if (Math.abs(totalHours - analysis[subject].expectedHours) > 2) {
      const issue = `${subject}: Has ${totalHours} hours, expected ${analysis[subject].expectedHours}`;
      issues.push(issue);
      analysis[subject].issues.push(issue);
    }
    
    if (Math.abs(totalDays - analysis[subject].expectedDays) > 5) {
      const issue = `${subject}: Has ${totalDays} days allocated, expected ${analysis[subject].expectedDays}`;
      issues.push(issue);
      analysis[subject].issues.push(issue);
    }
    
    // Check for date overlaps within subject
    for (let i = 0; i < lrp.unitPlans.length - 1; i++) {
      const current = lrp.unitPlans[i];
      const next = lrp.unitPlans[i + 1];
      
      if (current.endDate >= next.startDate) {
        const issue = `${subject} Unit ${i+1} overlaps with Unit ${i+2}`;
        issues.push(issue);
        analysis[subject].issues.push(issue);
      }
      
      // Check for gaps (for daily subjects only)
      const isDaily = !subject.includes('Sciences humaines') && !subject.includes('Formation personnelle');
      if (isDaily) {
        const daysBetween = Math.floor((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysBetween > 4) { // Allow for weekend
          const issue = `${subject}: ${daysBetween}-day gap between Unit ${i+1} and Unit ${i+2}`;
          issues.push(issue);
          analysis[subject].issues.push(issue);
        }
      }
    }
    
    // Check if any unit extends past school year
    lrp.unitPlans.forEach((unit, i) => {
      if (unit.endDate > new Date('2026-06-20')) {
        const issue = `${subject} Unit ${i+1} extends past school year (ends ${unit.endDate.toISOString().split('T')[0]})`;
        issues.push(issue);
        analysis[subject].issues.push(issue);
      }
    });
  }
  
  // 3. Display detailed analysis
  console.log('📋 DETAILED SUBJECT ANALYSIS:\n');
  
  for (const [subject, data] of Object.entries(analysis)) {
    const status = data.issues.length === 0 ? '✅' : '❌';
    console.log(`${status} ${subject}`);
    console.log('─'.repeat(60));
    console.log(`   Current: ${data.units} units, ${data.hours} hours, ${data.days} days`);
    console.log(`   Expected: ${data.expectedUnits} units, ${data.expectedHours} hours, ${data.expectedDays} days`);
    
    if (data.issues.length > 0) {
      console.log('   Issues:');
      data.issues.forEach((issue: string) => {
        console.log(`   • ${issue}`);
      });
    }
    console.log('');
  }
  
  // 4. Critical issues summary
  console.log('🚨 CRITICAL ISSUES REQUIRING FIXES:\n');
  console.log('═'.repeat(60));
  
  if (issues.length === 0) {
    console.log('✅ No critical issues found - system is perfect!');
  } else {
    console.log(`Found ${issues.length} issues that need correction:\n`);
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
  }
  
  // 5. Mathematical verification
  console.log('\n📐 MATHEMATICAL VERIFICATION:\n');
  console.log('═'.repeat(60));
  
  const totalDailyLessons = ['Français', 'Mathématiques', 'Sciences', 'Arts']
    .map(s => {
      const lrp = allLRPs.find(l => l.subject.includes(s));
      return lrp ? lrp.unitPlans.reduce((sum, u) => sum + Math.ceil((u.estimatedHours || 0) / 0.75), 0) : 0;
    })
    .reduce((sum, days) => sum + days, 0);
  
  const totalAlternatingLessons = ['Sciences humaines', 'Formation personnelle']
    .map(s => {
      const lrp = allLRPs.find(l => l.subject.includes(s));
      return lrp ? lrp.unitPlans.reduce((sum, u) => sum + Math.ceil((u.estimatedHours || 0) / 0.75), 0) : 0;
    })
    .reduce((sum, days) => sum + days, 0);
  
  console.log('Daily Subjects (should be 4 × 195 = 780):');
  console.log(`   Actual: ${totalDailyLessons} lessons`);
  console.log(`   ${totalDailyLessons === 780 ? '✅' : '❌'} ${totalDailyLessons === 780 ? 'Perfect!' : `Off by ${Math.abs(780 - totalDailyLessons)} lessons`}`);
  
  console.log('\nAlternating Subjects (should be ~195 total):');
  console.log(`   Actual: ${totalAlternatingLessons} lessons`);
  console.log(`   ${Math.abs(totalAlternatingLessons - 195) <= 5 ? '✅' : '❌'} ${Math.abs(totalAlternatingLessons - 195) <= 5 ? 'Within tolerance!' : `Off by ${Math.abs(195 - totalAlternatingLessons)} lessons`}`);
  
  // 6. Check for Health/FPS Unit 6
  console.log('\n🔍 HEALTH/FPS UNIT 6 INVESTIGATION:\n');
  console.log('═'.repeat(60));
  
  const healthLRP = allLRPs.find(l => l.subject.includes('Formation personnelle'));
  if (healthLRP) {
    console.log(`Health/FPS has ${healthLRP.unitPlans.length} units`);
    
    if (healthLRP.unitPlans.length === 5) {
      console.log('❌ Missing 6th unit! Health/FPS should have 6 units for proper alternating schedule');
      console.log('   This explains why Health/FPS only has 87 days instead of ~98');
      console.log('   ACTION REQUIRED: Create or restore Unit 6');
    } else if (healthLRP.unitPlans.length === 6) {
      console.log('✅ All 6 units present');
    }
    
    // List all units
    console.log('\nCurrent Health/FPS units:');
    healthLRP.unitPlans.forEach((unit, i) => {
      console.log(`   ${i + 1}. ${unit.title} (${unit.estimatedHours}h)`);
    });
  }
  
  // 7. Recommendations
  console.log('\n💡 RECOMMENDATIONS FOR PERFECTION:\n');
  console.log('═'.repeat(60));
  
  const recommendations = [
    'Ensure Health/FPS has 6 units (currently has 5)',
    'Redistribute Health/FPS units to use ~98 days total',
    'Verify all daily subjects use exactly 195 consecutive days',
    'Ensure no gaps between sequential units in daily subjects',
    'Confirm all units end before June 20, 2026',
    'Balance hours more precisely (use 14-15h per unit for consistency)'
  ];
  
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
  
  await prisma.$disconnect();
}

criticalReviewAnalysis().catch(console.error);