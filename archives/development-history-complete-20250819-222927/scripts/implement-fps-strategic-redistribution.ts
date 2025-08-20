import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function implementFPSStrategicRedistribution() {
  console.log('🎯 IMPLEMENTING STRATEGIC HEALTH/FPS HOUR REDISTRIBUTION');
  console.log('=========================================================\n');

  // Get current Health/FPS units
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log(`📊 Found ${fpsUnits.length} Health/FPS units\n`);

  // Strategic redistribution plan
  const redistributionPlan = [
    {
      title: "Mon corps et ma sécurité",
      currentHours: 14,
      newHours: 16,
      rationale: "Foundation unit - safety protocols need extensive practice"
    },
    {
      title: "Mes émotions et sentiments", 
      currentHours: 14,
      newHours: 15,
      rationale: "Emotional literacy is complex for Grade 1, needs adequate time"
    },
    {
      title: "Amitiés et relations positives",
      currentHours: 14,
      newHours: 15, 
      rationale: "Social skills building requires practice and role-play"
    },
    {
      title: "Nutrition et mode de vie sain",
      currentHours: 14,
      newHours: 14,
      rationale: "Concrete content - current time allocation is appropriate"
    },
    {
      title: "Grandir, changer et célébrer ensemble",
      currentHours: 14,
      newHours: 13,
      rationale: "End-of-year wrap-up can be streamlined efficiently"
    }
  ];

  console.log('📋 STRATEGIC REDISTRIBUTION PLAN');
  console.log('=================================');
  
  let totalBefore = 0;
  let totalAfter = 0;
  
  redistributionPlan.forEach((plan, i) => {
    totalBefore += plan.currentHours;
    totalAfter += plan.newHours;
    const change = plan.newHours - plan.currentHours;
    const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '→';
    
    console.log(`\nUnit ${i + 1}: "${plan.title}"`);
    console.log(`  Hours: ${plan.currentHours} → ${plan.newHours} (${changeStr})`);
    console.log(`  Rationale: ${plan.rationale}`);
  });

  console.log(`\nTotal Hours: ${totalBefore} → ${totalAfter} (+${totalAfter - totalBefore})`);
  console.log(`Total Lessons: ${Math.round(totalBefore * 1.33)} → ${Math.round(totalAfter * 1.33)}`);
  console.log(`Target: 97 lessons ✅\n`);

  // Apply the redistribution
  console.log('🔄 APPLYING REDISTRIBUTION');
  console.log('===========================\n');

  for (let i = 0; i < fpsUnits.length; i++) {
    const unit = fpsUnits[i];
    const plan = redistributionPlan[i];

    if (!plan) {
      console.log(`⚠️ No redistribution plan for unit: ${unit.title}`);
      continue;
    }

    if (unit.title !== plan.title) {
      console.log(`⚠️ Unit title mismatch: "${unit.title}" vs "${plan.title}"`);
      continue;
    }

    const currentHours = unit.estimatedHours || 0;
    const newHours = plan.newHours;

    if (currentHours === newHours) {
      console.log(`✅ Unit ${i + 1}: "${unit.title}" - No change needed (${newHours} hours)`);
      continue;
    }

    try {
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { estimatedHours: newHours }
      });

      const change = newHours - currentHours;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      console.log(`✅ Unit ${i + 1}: "${unit.title}" - Updated ${currentHours} → ${newHours} hours (${changeStr})`);
    } catch (error) {
      console.error(`❌ Failed to update Unit ${i + 1}: ${error.message}`);
    }
  }

  // Verify the changes
  console.log('\n📊 VERIFICATION OF CHANGES');
  console.log('===========================\n');

  const updatedUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  let verifiedTotal = 0;
  updatedUnits.forEach((unit, i) => {
    const hours = unit.estimatedHours || 0;
    verifiedTotal += hours;
    const expectedHours = redistributionPlan[i]?.newHours || 0;
    const status = hours === expectedHours ? '✅' : '❌';
    
    console.log(`${status} Unit ${i + 1}: "${unit.title}" - ${hours} hours (expected: ${expectedHours})`);
  });

  const verifiedLessons = Math.round(verifiedTotal * 1.33);
  console.log(`\nTotal verified: ${verifiedTotal} hours = ${verifiedLessons} lessons`);
  
  if (verifiedLessons === 97) {
    console.log('🎉 SUCCESS: Perfect lesson count achieved!');
  } else {
    console.log(`⚠️ Lesson count: ${verifiedLessons} (target: 97)`);
  }

  console.log('\n🎯 STRATEGIC REDISTRIBUTION BENEFITS');
  console.log('====================================');
  console.log('✅ Body safety gets foundational emphasis (16 hours)');
  console.log('✅ Emotional literacy receives adequate time (15 hours)');
  console.log('✅ Social skills building properly supported (15 hours)');
  console.log('✅ Nutrition maintains appropriate focus (14 hours)');
  console.log('✅ Growth/community streamlined for efficiency (13 hours)');
  console.log('✅ Total lesson count matches rotation requirements (97 lessons)');
  console.log('✅ Pedagogically balanced distribution across health domains');

  await prisma.$disconnect();
}

implementFPSStrategicRedistribution().catch(console.error);