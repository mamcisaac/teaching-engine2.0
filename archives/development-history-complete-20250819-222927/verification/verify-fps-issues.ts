import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFPSIssues() {
  console.log('🔍 HEALTH/FPS VERIFICATION - CHECKING IF ISSUES ARE REAL');
  console.log('===========================================================\n');

  // Get all Health/FPS units
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw' // Health/FPS LRP ID
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log(`📊 FOUND ${fpsUnits.length} Health/FPS units\n`);

  // Issue 1: Check Big Ideas format (narrative vs JSON)
  console.log('🔬 ISSUE 1: BIG IDEAS FORMAT CHECK');
  console.log('=' .repeat(50));
  
  fpsUnits.forEach((unit, i) => {
    console.log(`\nUnit ${i + 1}: "${unit.title}"`);
    
    if (!unit.bigIdeas) {
      console.log('❌ Big Ideas: MISSING');
      return;
    }

    console.log(`Big Ideas length: ${unit.bigIdeas.length} characters`);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(unit.bigIdeas);
      if (Array.isArray(parsed)) {
        console.log(`✅ Format: JSON Array with ${parsed.length} items`);
        parsed.forEach((idea, idx) => {
          console.log(`   ${idx + 1}. ${idea.substring(0, 80)}...`);
        });
      } else if (typeof parsed === 'object') {
        console.log('✅ Format: JSON Object');
        console.log(`   Content: ${JSON.stringify(parsed).substring(0, 100)}...`);
      } else {
        console.log('⚠️ Format: JSON but not array/object');
      }
    } catch {
      console.log('❌ Format: NARRATIVE TEXT (not JSON)');
      console.log(`   Content: "${unit.bigIdeas.substring(0, 100)}..."`);
    }
  });

  // Issue 2: Lesson count verification
  console.log('\n\n🔢 ISSUE 2: LESSON COUNT VERIFICATION');
  console.log('=' .repeat(50));
  
  const totalHours = fpsUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
  const totalLessons = totalHours * 1.33; // 45-min lessons (60/45 = 1.33)
  const requiredLessons = 97; // From rotation schedule
  
  console.log(`Total estimated hours: ${totalHours}`);
  console.log(`Calculated lessons (hours × 1.33): ${totalLessons.toFixed(2)}`);
  console.log(`Required lessons: ${requiredLessons}`);
  console.log(`Gap: ${(requiredLessons - totalLessons).toFixed(2)} lessons`);
  
  if (Math.abs(totalLessons - 93.33) < 1) {
    console.log('✅ ISSUE CONFIRMED: Matches reported 93.33 lessons');
  } else {
    console.log('❌ ISSUE NOT CONFIRMED: Does not match reported 93.33');
  }

  // Issue 3: Date range compression check
  console.log('\n\n📅 ISSUE 3: DATE RANGE COMPRESSION CHECK');
  console.log('=' .repeat(50));
  
  let totalSchoolDays = 0;
  const schoolYear = { start: new Date('2025-09-03'), end: new Date('2026-06-20') };
  
  fpsUnits.forEach((unit, i) => {
    if (!unit.startDate || !unit.endDate) {
      console.log(`Unit ${i + 1}: ❌ Missing dates`);
      return;
    }

    const startDate = unit.startDate.toISOString().split('T')[0];
    const endDate = unit.endDate.toISOString().split('T')[0];
    const calendarDays = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate school days (rough estimate - weekdays only)
    let schoolDays = 0;
    const current = new Date(unit.startDate);
    while (current <= unit.endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        schoolDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    totalSchoolDays += schoolDays;
    const expectedSchoolDays = Math.ceil((unit.estimatedHours || 0) / 0.75);
    
    console.log(`\nUnit ${i + 1}: "${unit.title}"`);
    console.log(`  Period: ${startDate} to ${endDate}`);
    console.log(`  Calendar days: ${calendarDays}`);
    console.log(`  School days: ${schoolDays}`);
    console.log(`  Expected: ${expectedSchoolDays} school days`);
    console.log(`  Hours: ${unit.estimatedHours}`);
    
    if (Math.abs(schoolDays - expectedSchoolDays) > 3) {
      console.log(`  ❌ MISMATCH: ${Math.abs(schoolDays - expectedSchoolDays)} day difference`);
    } else {
      console.log(`  ✅ OK: Within tolerance`);
    }
  });

  // Check for gaps between units
  console.log('\n📊 UNIT SCHEDULING ANALYSIS:');
  for (let i = 0; i < fpsUnits.length - 1; i++) {
    const currentEnd = fpsUnits[i].endDate;
    const nextStart = fpsUnits[i + 1].startDate;
    
    if (currentEnd && nextStart) {
      const gapDays = Math.ceil((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)) - 1;
      console.log(`Gap between Unit ${i + 1} and ${i + 2}: ${gapDays} days`);
      
      if (gapDays > 10) {
        console.log(`  ❌ LARGE GAP: ${gapDays} days without Health/FPS`);
      }
    }
  }

  // Issue 4: Essential Questions and Key Vocabulary structure
  console.log('\n\n🔍 ISSUE 4: DATA STRUCTURE CHECK');
  console.log('=' .repeat(50));
  
  fpsUnits.forEach((unit, i) => {
    console.log(`\nUnit ${i + 1}: "${unit.title}"`);
    
    // Essential Questions
    console.log('Essential Questions:');
    if (!unit.essentialQuestions) {
      console.log('  ❌ MISSING');
    } else {
      try {
        const questions = JSON.parse(unit.essentialQuestions);
        if (Array.isArray(questions)) {
          console.log(`  ✅ JSON Array with ${questions.length} questions`);
        } else {
          console.log('  ⚠️ JSON but not array format');
        }
      } catch {
        console.log('  ❌ INVALID JSON - Raw text format');
        const text = typeof unit.essentialQuestions === 'string' ? unit.essentialQuestions : JSON.stringify(unit.essentialQuestions);
        console.log(`     "${text.substring(0, 60)}..."`);
      }
    }
    
    // Key Vocabulary
    console.log('Key Vocabulary:');
    if (!unit.keyVocabulary) {
      console.log('  ❌ MISSING');
    } else {
      try {
        const vocab = JSON.parse(unit.keyVocabulary);
        if (Array.isArray(vocab)) {
          console.log(`  ✅ JSON Array with ${vocab.length} vocabulary items`);
          if (vocab.length > 0 && typeof vocab[0] === 'object') {
            console.log(`     Sample: "${vocab[0].word}" - ${vocab[0].definition?.substring(0, 40)}...`);
          }
        } else {
          console.log('  ⚠️ JSON but not array format');
        }
      } catch {
        console.log('  ❌ INVALID JSON - Raw text format');
        const text = typeof unit.keyVocabulary === 'string' ? unit.keyVocabulary : JSON.stringify(unit.keyVocabulary);
        console.log(`     "${text.substring(0, 60)}..."`);
      }
    }
  });

  // Issue 5: Compare with other subjects for consistency
  console.log('\n\n🔄 ISSUE 5: CROSS-SUBJECT COMPARISON');
  console.log('=' .repeat(50));
  
  // Get a sample unit from each subject for comparison
  const subjects = [
    { name: 'French', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Math', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' }
  ];

  for (const subject of subjects) {
    const sampleUnit = await prisma.unitPlan.findFirst({
      where: { longRangePlanId: subject.lrpId }
    });
    
    if (!sampleUnit) continue;
    
    console.log(`\n${subject.name} Sample Unit: "${sampleUnit.title}"`);
    
    // Check Big Ideas format
    if (sampleUnit.bigIdeas) {
      try {
        const parsed = JSON.parse(sampleUnit.bigIdeas);
        console.log(`  Big Ideas: ✅ JSON (${Array.isArray(parsed) ? 'array' : 'object'})`);
      } catch {
        console.log(`  Big Ideas: ❌ Raw text (${sampleUnit.bigIdeas.length} chars)`);
      }
    }
    
    // Check Essential Questions format
    if (sampleUnit.essentialQuestions) {
      try {
        const parsed = JSON.parse(sampleUnit.essentialQuestions);
        console.log(`  Essential Questions: ✅ JSON (${Array.isArray(parsed) ? 'array' : 'object'})`);
      } catch {
        console.log(`  Essential Questions: ❌ Raw text`);
      }
    }
  }

  // Final verification summary
  console.log('\n\n📋 VERIFICATION SUMMARY');
  console.log('=' .repeat(50));
  
  console.log('\n✅ CONFIRMED ISSUES:');
  console.log('❌ UNCONFIRMED ISSUES:');
  console.log('⚠️ PARTIALLY CONFIRMED:');

  await prisma.$disconnect();
}

verifyFPSIssues().catch(console.error);