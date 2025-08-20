import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fpsHourRedistributionAnalysis() {
  console.log('🔍 HEALTH/FPS HOUR REDISTRIBUTION ANALYSIS');
  console.log('===========================================\n');

  // Get current Health/FPS units
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log('📊 CURRENT DISTRIBUTION ANALYSIS');
  console.log('==================================');
  
  let totalCurrentHours = 0;
  
  fpsUnits.forEach((unit, i) => {
    const hours = unit.estimatedHours || 0;
    totalCurrentHours += hours;
    console.log(`Unit ${i + 1}: "${unit.title}" - ${hours} hours`);
  });
  
  console.log(`\nCurrent total: ${totalCurrentHours} hours`);
  console.log(`Required total: ~73 hours (for 97 lessons)`);
  console.log(`Gap: ${73 - totalCurrentHours} hours needed\n`);

  console.log('🎯 CONTENT COMPLEXITY ANALYSIS');
  console.log('===============================');
  
  // Analyze each unit's content complexity and learning needs
  const complexityAnalysis = [
    {
      unit: 1,
      title: "Mon corps et ma sécurité",
      currentHours: 14,
      complexity: "HIGH",
      rationale: [
        "• Body safety protocols require extensive practice",
        "• Multiple safety scenarios to cover", 
        "• Requires careful, repeated instruction",
        "• Foundation for all other health learning"
      ],
      recommendedHours: 16,
      priority: "CRITICAL"
    },
    {
      unit: 2,
      title: "Mes émotions et sentiments", 
      currentHours: 14,
      complexity: "HIGH",
      rationale: [
        "• Emotional literacy takes time to develop",
        "• Grade 1 students need lots of practice",
        "• Multiple emotion recognition activities needed",
        "• Coping strategies require reinforcement"
      ],
      recommendedHours: 15,
      priority: "HIGH"
    },
    {
      unit: 3,
      title: "Amitiés et relations positives",
      currentHours: 14, 
      complexity: "MEDIUM",
      rationale: [
        "• Social skills build on emotional foundation",
        "• Role-playing activities take time",
        "• Conflict resolution practice needed",
        "• Friendship skills are complex for Grade 1"
      ],
      recommendedHours: 15,
      priority: "HIGH"
    },
    {
      unit: 4,
      title: "Nutrition et mode de vie sain",
      currentHours: 14,
      complexity: "MEDIUM",
      rationale: [
        "• Hands-on food activities time-intensive", 
        "• Multiple food groups to explore",
        "• Physical activity demonstrations needed",
        "• Habit formation takes repetition"
      ],
      recommendedHours: 14,
      priority: "MEDIUM"
    },
    {
      unit: 5,
      title: "Grandir, changer et célébrer ensemble",
      currentHours: 14,
      complexity: "MEDIUM", 
      rationale: [
        "• Growth concepts are abstract for Grade 1",
        "• Community connections take time to build",
        "• Celebration planning activities",
        "• End-of-year reflection important"
      ],
      recommendedHours: 13,
      priority: "MEDIUM"
    }
  ];

  complexityAnalysis.forEach(analysis => {
    console.log(`\n📋 UNIT ${analysis.unit}: ${analysis.title}`);
    console.log(`Current: ${analysis.currentHours} hours | Recommended: ${analysis.recommendedHours} hours`);
    console.log(`Complexity: ${analysis.complexity} | Priority: ${analysis.priority}`);
    console.log('Rationale:');
    analysis.rationale.forEach(reason => console.log(`  ${reason}`));
    
    const change = analysis.recommendedHours - analysis.currentHours;
    if (change > 0) {
      console.log(`  ✅ ADD ${change} hours`);
    } else if (change < 0) {
      console.log(`  ➖ REDUCE ${Math.abs(change)} hours`);
    } else {
      console.log(`  ✅ KEEP current hours`);
    }
  });

  console.log('\n📊 REDISTRIBUTION SUMMARY');
  console.log('==========================');
  
  const totalRecommended = complexityAnalysis.reduce((sum, unit) => sum + unit.recommendedHours, 0);
  const totalChange = totalRecommended - totalCurrentHours;
  
  console.log(`Current distribution: ${fpsUnits.map(u => u.estimatedHours).join(', ')} hours`);
  console.log(`Recommended distribution: ${complexityAnalysis.map(a => a.recommendedHours).join(', ')} hours`);
  console.log(`Total hours: ${totalCurrentHours} → ${totalRecommended} (+${totalChange} hours)`);
  console.log(`Total lessons: ${Math.round(totalCurrentHours * 1.33)} → ${Math.round(totalRecommended * 1.33)} lessons`);

  console.log('\n🎯 STRATEGIC RATIONALE FOR REDISTRIBUTION');
  console.log('==========================================');
  
  console.log('\n🔺 UNITS GETTING MORE TIME:');
  complexityAnalysis
    .filter(unit => unit.recommendedHours > unit.currentHours)
    .forEach(unit => {
      const increase = unit.recommendedHours - unit.currentHours;
      console.log(`• Unit ${unit.unit}: +${increase} hours - ${unit.title}`);
      console.log(`  Reason: ${unit.rationale[0]}`);
    });

  console.log('\n🔻 UNITS GETTING LESS TIME:');
  complexityAnalysis
    .filter(unit => unit.recommendedHours < unit.currentHours)
    .forEach(unit => {
      const decrease = unit.currentHours - unit.recommendedHours;
      console.log(`• Unit ${unit.unit}: -${decrease} hours - ${unit.title}`);
      console.log(`  Reason: More straightforward content, can be streamlined`);
    });

  console.log('\n⚖️ PEDAGOGICAL BALANCE CHECK');
  console.log('=============================');
  
  const safetyHours = complexityAnalysis[0].recommendedHours; // Body safety
  const emotionalHours = complexityAnalysis[1].recommendedHours; // Emotions
  const socialHours = complexityAnalysis[2].recommendedHours; // Friendships
  const physicalHours = complexityAnalysis[3].recommendedHours; // Nutrition
  const developmentalHours = complexityAnalysis[4].recommendedHours; // Growth
  
  console.log(`Safety Foundation: ${safetyHours} hours (${((safetyHours/totalRecommended)*100).toFixed(1)}%)`);
  console.log(`Emotional Literacy: ${emotionalHours} hours (${((emotionalHours/totalRecommended)*100).toFixed(1)}%)`);
  console.log(`Social Skills: ${socialHours} hours (${((socialHours/totalRecommended)*100).toFixed(1)}%)`);
  console.log(`Physical Health: ${physicalHours} hours (${((physicalHours/totalRecommended)*100).toFixed(1)}%)`);
  console.log(`Growth & Community: ${developmentalHours} hours (${((developmentalHours/totalRecommended)*100).toFixed(1)}%)`);

  console.log('\n✅ IMPLEMENTATION RECOMMENDATION');
  console.log('=================================');
  
  if (totalRecommended === 73) {
    console.log('🎯 PERFECT: Redistribution achieves exact 97-lesson target');
  } else {
    console.log(`⚠️ ADJUSTMENT NEEDED: Total is ${totalRecommended}, target is 73 hours`);
  }
  
  console.log('\nRedistribution Benefits:');
  console.log('• More time for foundational safety concepts');
  console.log('• Adequate emotional literacy development');
  console.log('• Balanced attention across all health domains');
  console.log('• Better alignment with Grade 1 learning needs');
  console.log('• Maintains total lesson count requirement');

  console.log('\n📋 FINAL RECOMMENDATION');
  console.log('========================');
  
  console.log('\n🔄 REDISTRIBUTE HOURS AS FOLLOWS:');
  complexityAnalysis.forEach(unit => {
    const change = unit.recommendedHours - unit.currentHours;
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    console.log(`Unit ${unit.unit}: ${unit.currentHours} ${arrow} ${unit.recommendedHours} hours`);
  });
  
  console.log(`\nResult: ${totalCurrentHours} → ${totalRecommended} hours (${Math.round(totalRecommended * 1.33)} lessons)`);
  console.log('This achieves both optimal pedagogical distribution AND lesson count target.');

  await prisma.$disconnect();
}

fpsHourRedistributionAnalysis().catch(console.error);