import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveUnitPlanReview() {
  console.log('🔍 COMPREHENSIVE UNIT PLAN REVIEW FOR ALL SUBJECTS\n');
  console.log('=' .repeat(80));
  console.log('Checking all Long Range Plans and Unit Plans for Emily McIsaac');
  console.log('Grade 1 French Immersion - Daily Integration Model\n');
  
  const EMILY_USER_ID = 23;
  
  try {
    // Get all Long Range Plans for Emily
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: EMILY_USER_ID,
        academicYear: '2025-2026'
      },
      include: {
        unitPlans: {
          orderBy: {
            startDate: 'asc'
          }
        }
      },
      orderBy: {
        subject: 'asc'
      }
    });
    
    console.log(`Found ${longRangePlans.length} Long Range Plans:\n`);
    
    // Required subjects and lessons based on daily integration model
    const requiredSubjects = {
      'Français (Immersion)': { required: 195, hours: 146.25, type: 'daily' },
      'Mathématiques': { required: 195, hours: 146.25, type: 'daily' },
      'Sciences de la nature': { required: 195, hours: 146.25, type: 'daily' },
      'Arts visuels': { required: 195, hours: 146.25, type: 'daily' },
      'Sciences humaines': { required: 97, hours: 72.75, type: 'alternating' },
      'Formation personnelle et sociale': { required: 98, hours: 73.5, type: 'alternating' }
    };
    
    let totalSystemLessons = 0;
    let totalSystemHours = 0;
    let perfectSubjects = 0;
    
    for (const lrp of longRangePlans) {
      const required = requiredSubjects[lrp.subject as keyof typeof requiredSubjects];
      const unitCount = lrp.unitPlans.length;
      
      console.log(`📚 SUBJECT: ${lrp.subject}`);
      console.log(`   LRP ID: ${lrp.id}`);
      
      if (!required) {
        console.log(`   ⚠️  UNKNOWN SUBJECT - Not in daily integration model`);
        console.log('');
        continue;
      }
      
      console.log(`   Required: ${required.required} lessons (${required.hours} hours) - ${required.type}`);
      console.log(`   Units: ${unitCount}`);
      
      if (unitCount === 0) {
        console.log(`   ❌ NO UNIT PLANS FOUND`);
        console.log('');
        continue;
      }
      
      // Analyze unit plans
      let totalLessons = 0;
      let totalHours = 0;
      let etfoViolations = 0;
      let missingElements = 0;
      
      lrp.unitPlans.forEach((unit, index) => {
        const duration = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeks = duration / 7;
        const lessons = Math.round(unit.estimatedHours! / 0.75);
        
        totalLessons += lessons;
        totalHours += unit.estimatedHours!;
        
        console.log(`   Unit ${index + 1}: ${unit.title?.substring(0, 40)}...`);
        console.log(`     Lessons: ${lessons}, Hours: ${unit.estimatedHours}, Weeks: ${weeks.toFixed(1)}`);
        
        // Check for issues
        const issues = [];
        if (weeks > 4) {
          issues.push('ETFO violation (>4 weeks)');
          etfoViolations++;
        }
        if (weeks < 2) {
          issues.push('Too short (<2 weeks)');
        }
        if (!unit.bigIdeas) issues.push('Missing big ideas');
        if (!unit.essentialQuestions) issues.push('Missing essential questions');
        if (!unit.assessmentPlan) issues.push('Missing assessment plan');
        if (!unit.differentiationStrategies) issues.push('Missing differentiation');
        
        if (issues.length > 0) {
          console.log(`     ⚠️  Issues: ${issues.join(', ')}`);
          missingElements++;
        }
      });
      
      // Overall subject assessment
      const lessonGap = required.required - totalLessons;
      const isLessonCountPerfect = Math.abs(lessonGap) <= 2; // Allow 1-2 lesson variance
      const hasProperUnits = unitCount >= 6 && unitCount <= 12;
      const hasNoETFOViolations = etfoViolations === 0;
      const hasCompleteElements = missingElements === 0;
      
      console.log(`   TOTALS: ${totalLessons} lessons, ${totalHours.toFixed(1)} hours`);
      console.log(`   Gap: ${lessonGap > 0 ? '+' : ''}${lessonGap} lessons from required`);
      
      if (isLessonCountPerfect && hasProperUnits && hasNoETFOViolations && hasCompleteElements) {
        console.log(`   ✅ PERFECT SUBJECT`);
        perfectSubjects++;
      } else {
        console.log(`   ❌ NEEDS WORK:`);
        if (!isLessonCountPerfect) console.log(`      - Lesson count: ${totalLessons}/${required.required}`);
        if (!hasProperUnits) console.log(`      - Unit count: ${unitCount} (need 6-12)`);
        if (!hasNoETFOViolations) console.log(`      - ETFO violations: ${etfoViolations} units`);
        if (!hasCompleteElements) console.log(`      - Missing elements: ${missingElements} units`);
      }
      
      totalSystemLessons += totalLessons;
      totalSystemHours += totalHours;
      console.log('');
    }
    
    // System totals
    console.log('=' .repeat(80));
    console.log('📊 SYSTEM TOTALS:\n');
    console.log(`Perfect Subjects: ${perfectSubjects}/${Object.keys(requiredSubjects).length}`);
    console.log(`Current Total Lessons: ${totalSystemLessons}`);
    console.log(`Required Total Lessons: 975 (195+195+195+195+97+98)`);
    console.log(`Current Total Hours: ${totalSystemHours.toFixed(1)}`);
    console.log(`Required Total Hours: 731.25`);
    console.log(`System Gap: ${975 - totalSystemLessons} lessons`);
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 PERFECTION ANALYSIS:\n');
    
    if (perfectSubjects === Object.keys(requiredSubjects).length && totalSystemLessons === 975) {
      console.log('🎉 SYSTEM IS PERFECT!');
      console.log('All subjects have:');
      console.log('✅ Correct lesson counts');
      console.log('✅ Proper unit structures');
      console.log('✅ ETFO compliance');
      console.log('✅ Complete pedagogical elements');
    } else {
      console.log('🔧 SYSTEM NEEDS WORK:');
      
      for (const [subject, req] of Object.entries(requiredSubjects)) {
        const lrp = longRangePlans.find(l => l.subject === subject);
        if (!lrp) {
          console.log(`❌ ${subject}: MISSING LONG RANGE PLAN`);
        } else if (lrp.unitPlans.length === 0) {
          console.log(`❌ ${subject}: NO UNIT PLANS`);
        } else {
          const totalLessons = lrp.unitPlans.reduce((sum, u) => sum + Math.round(u.estimatedHours! / 0.75), 0);
          const gap = req.required - totalLessons;
          if (Math.abs(gap) > 2) {
            console.log(`⚠️  ${subject}: ${gap > 0 ? '+' : ''}${gap} lesson gap`);
          } else {
            console.log(`✅ ${subject}: Lesson count perfect`);
          }
        }
      }
      
      console.log('\n🛠️  RECOMMENDED ACTIONS:');
      console.log('1. Create missing Long Range Plans');
      console.log('2. Create missing Unit Plans using Core + Extension model');
      console.log('3. Fix lesson count gaps');
      console.log('4. Add missing pedagogical elements');
      console.log('5. Ensure all units are 2-4 weeks');
    }
    
  } catch (error) {
    console.error('Error during review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveUnitPlanReview();