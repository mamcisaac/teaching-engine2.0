import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditAgainstNewModel() {
  console.log('🔍 AUDITING UNIT PLANS AGAINST NEW DAILY INTEGRATION MODEL');
  console.log('================================================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh', required: 195 },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in', required: 195 },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh', required: 195 },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5', required: 97 },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo', required: 195 },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw', required: 98 }
  ];

  let totalGaps = 0;
  let subjectsNeedingWork = 0;

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()}`);
    console.log(`Required lessons: ${subject.required} (daily integration model)`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      select: {
        id: true,
        title: true,
        estimatedHours: true,
        startDate: true,
        endDate: true,
        description: true,
        bigIdeas: true,
        essentialQuestions: true,
        successCriteria: true,
        assessmentPlan: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        _count: {
          select: {
            lessonPlans: true,
            expectations: true
          }
        }
      }
    });

    console.log(`Current units: ${units.length}`);
    
    // Calculate current provision
    const totalCurrentHours = units.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const requiredHours = subject.required * 0.75; // 45 min lessons
    const totalCurrentLessons = Math.round(totalCurrentHours / 0.75);
    const lessonGap = subject.required - totalCurrentLessons;

    console.log(`Current hours: ${totalCurrentHours}`);
    console.log(`Required hours: ${requiredHours}`);
    console.log(`Current lessons (calculated): ${totalCurrentLessons}`);
    console.log(`Lesson gap: ${lessonGap}`);

    if (Math.abs(lessonGap) > 5) {
      console.log(`❌ MAJOR GAP: ${lessonGap > 0 ? 'UNDER' : 'OVER'} by ${Math.abs(lessonGap)} lessons`);
      subjectsNeedingWork++;
      totalGaps += Math.abs(lessonGap);
    } else {
      console.log(`✅ ACCEPTABLE: Within 5 lessons of target`);
    }

    // Check unit structure issues
    let structuralIssues = 0;
    
    for (const [index, unit] of units.entries()) {
      const issues = [];
      
      // Check for rotation-style dating (should be daily now)
      if (unit.startDate && unit.endDate) {
        const daysBetween = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const unitHours = unit.estimatedHours || 0;
        const expectedDays = Math.ceil(unitHours / 0.75); // 1 lesson per day = 0.75 hours
        
        if (Math.abs(daysBetween - expectedDays) > 3) {
          issues.push('Date range doesn\'t match daily lesson model');
        }
      }
      
      // Check completeness
      if (!unit.description) issues.push('Missing description');
      if (!unit.bigIdeas) issues.push('Missing big ideas');
      if (!unit.essentialQuestions) issues.push('Missing essential questions');
      if (!unit.successCriteria) issues.push('Missing success criteria');
      if (!unit.assessmentPlan) issues.push('Missing assessment plan');
      if (!unit.differentiationStrategies) issues.push('Missing differentiation strategies');
      if (!unit.indigenousPerspectives) issues.push('Missing Indigenous perspectives');
      
      if (issues.length > 0) {
        console.log(`  ⚠️  Unit ${index + 1} "${unit.title}": ${issues.join(', ')}`);
        structuralIssues++;
      }
    }

    if (structuralIssues > 0) {
      console.log(`⚠️ STRUCTURAL ISSUES: ${structuralIssues} units need fixes`);
    }

    // Check lesson plans created
    const totalLessonPlans = units.reduce((sum, unit) => sum + unit._count.lessonPlans, 0);
    console.log(`Lesson plans created: ${totalLessonPlans}`);
    
    if (totalLessonPlans === 0) {
      console.log(`❌ CRITICAL: No lesson plans exist!`);
    }

    console.log('---\n');
  }

  // Summary
  console.log('📊 AUDIT SUMMARY');
  console.log('================');
  console.log(`Subjects needing major work: ${subjectsNeedingWork}/6`);
  console.log(`Total lesson gap across all subjects: ${totalGaps}`);
  
  if (subjectsNeedingWork === 0 && totalGaps === 0) {
    console.log('🎉 ALL SUBJECTS ALIGNED WITH NEW MODEL!');
  } else {
    console.log(`🚨 WORK NEEDED: ${subjectsNeedingWork} subjects need unit plan updates`);
  }

  await prisma.$disconnect();
}

auditAgainstNewModel().catch(console.error);