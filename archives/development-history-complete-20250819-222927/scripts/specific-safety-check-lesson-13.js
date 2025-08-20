const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function specificSafetyCheckLesson13() {
  try {
    console.log('🚨 CRITICAL SAFETY CHECK: Lesson 13 - Batteries and Power');
    console.log('⚠️  Verifying the most dangerous lesson has proper safety protocols');
    
    const lesson = await prisma.eTFOLessonPlan.findUnique({
      where: {
        id: 'cmec9wtxz00hpvjd4jb7zaf2o' // Lesson 13: Batteries and Power
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        learningGoals: true,
        learningGoalsFr: true,
        materials: true,
        action: true,
        actionFr: true,
        mindsOn: true,
        mindsOnFr: true,
        consolidation: true,
        consolidationFr: true,
        formativeCheckpoints: true,
        differentiationStrategies: true
      }
    });

    if (!lesson) {
      console.log('❌ CRITICAL ERROR: Lesson 13 not found!');
      return;
    }

    console.log('\n📋 LESSON 13 CONTENT VERIFICATION:');
    console.log('='.repeat(80));

    console.log('\n🔍 TITLE CHECK:');
    console.log(`English Title: ${lesson.title}`);
    console.log(`French Title: ${lesson.titleFr || 'MISSING'}`);

    console.log('\n🔍 LEARNING GOALS CHECK:');
    console.log(`English Goals: ${lesson.learningGoals?.substring(0, 200) || 'MISSING'}...`);
    console.log(`French Goals: ${lesson.learningGoalsFr?.substring(0, 200) || 'MISSING'}...`);

    console.log('\n🔍 MATERIALS SAFETY CHECK:');
    let materialsObj = {};
    try {
      materialsObj = typeof lesson.materials === 'string' ? 
                    JSON.parse(lesson.materials) : 
                    (lesson.materials || {});
    } catch (e) {
      materialsObj = { error: 'Failed to parse materials' };
    }
    
    console.log('Materials Content:');
    Object.entries(materialsObj).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
      
      // Check for safety indicators
      const keyLower = key.toLowerCase();
      const valueLower = value.toString().toLowerCase();
      
      if (keyLower.includes('no_student') || keyLower.includes('adult_only')) {
        console.log('    ✅ SAFETY INDICATOR FOUND IN KEY');
      }
      if (valueLower.includes('students never') || valueLower.includes('adult only') || valueLower.includes('teacher only')) {
        console.log('    ✅ SAFETY INDICATOR FOUND IN VALUE');
      }
      if (keyLower.includes('battery') && !keyLower.includes('no_student') && !valueLower.includes('adult only')) {
        console.log('    ⚠️  POTENTIAL BATTERY SAFETY CONCERN');
      }
    });

    console.log('\n🔍 ACTION CONTENT SAFETY CHECK:');
    const actionContent = lesson.action || '';
    console.log(`Action Length: ${actionContent.length} characters`);
    
    // Check for critical safety phrases
    const safetyIndicators = [
      'STUDENTS NEVER TOUCH BATTERIES',
      'students never touch batteries',
      'NEVER touch batteries',
      'adult only',
      'teacher only',
      'ZERO student contact',
      'zero student contact',
      'NO student',
      'electrical safety',
      'emergency procedures'
    ];

    console.log('\nSafety Indicators Found:');
    safetyIndicators.forEach(indicator => {
      if (actionContent.toLowerCase().includes(indicator.toLowerCase())) {
        console.log(`  ✅ Found: "${indicator}"`);
      }
    });

    // Check for dangerous content
    const dangerousIndicators = [
      'students handle batteries',
      'students touch batteries',
      'student battery access',
      'hands-on with batteries'
    ];

    console.log('\nDangerous Content Check:');
    let dangerFound = false;
    dangerousIndicators.forEach(danger => {
      if (actionContent.toLowerCase().includes(danger.toLowerCase())) {
        console.log(`  ❌ DANGER FOUND: "${danger}"`);
        dangerFound = true;
      }
    });

    if (!dangerFound) {
      console.log('  ✅ No dangerous battery handling instructions found');
    }

    console.log('\n🔍 FIRST 500 CHARACTERS OF ACTION:');
    console.log(actionContent.substring(0, 500));
    console.log('\n...');

    console.log('\n🔍 CONSOLIDATION SAFETY CHECK:');
    const consolidationContent = lesson.consolidation || '';
    console.log(`Consolidation Length: ${consolidationContent.length} characters`);
    console.log('First 200 characters:');
    console.log(consolidationContent.substring(0, 200));

    console.log('\n🔍 FORMATIVE CHECKPOINTS:');
    let checkpoints = [];
    try {
      checkpoints = typeof lesson.formativeCheckpoints === 'string' ? 
                   JSON.parse(lesson.formativeCheckpoints) : 
                   (lesson.formativeCheckpoints || []);
    } catch (e) {
      checkpoints = ['Failed to parse checkpoints'];
    }
    
    console.log('Assessment Checkpoints:');
    checkpoints.forEach((checkpoint, index) => {
      console.log(`  ${index + 1}. ${checkpoint}`);
    });

    console.log('\n📊 FINAL SAFETY ASSESSMENT FOR LESSON 13:');
    
    const hasProperTitle = lesson.titleFr && lesson.titleFr.length > 10;
    const hasProperGoals = lesson.learningGoals && lesson.learningGoals.includes('SAFE') && lesson.learningGoalsFr;
    const hasNoStudentBatteryAccess = actionContent.includes('STUDENTS NEVER TOUCH BATTERIES') || 
                                     actionContent.includes('NEVER touch batteries') ||
                                     JSON.stringify(materialsObj).includes('NO_STUDENT_BATTERY_ACCESS');
    const hasEmergencyProcedures = actionContent.includes('emergency') && actionContent.includes('procedure');
    const hasSafetyEducation = actionContent.includes('safety') && actionContent.length > 1000;

    console.log(`  French Integration: ${hasProperTitle && lesson.learningGoalsFr ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Learning Goals: ${hasProperGoals ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  No Student Battery Access: ${hasNoStudentBatteryAccess ? '✅ PASS' : '❌ CRITICAL FAIL'}`);
    console.log(`  Emergency Procedures: ${hasEmergencyProcedures ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Safety Education: ${hasSafetyEducation ? '✅ PASS' : '❌ FAIL'}`);

    const overallSafe = hasProperTitle && hasProperGoals && hasNoStudentBatteryAccess && hasEmergencyProcedures && hasSafetyEducation;
    
    console.log('\n🚨 LESSON 13 OVERALL SAFETY STATUS:');
    console.log(`  ${overallSafe ? '✅ SAFE FOR GRADE 1 STUDENTS' : '❌ REQUIRES IMMEDIATE SAFETY FIXES'}`);

    if (!overallSafe) {
      console.log('\n⚠️  REQUIRED IMMEDIATE ACTIONS:');
      if (!hasNoStudentBatteryAccess) {
        console.log('  - ADD clear "STUDENTS NEVER TOUCH BATTERIES" instructions');
      }
      if (!hasEmergencyProcedures) {
        console.log('  - ADD emergency procedures for battery incidents');
      }
      if (!hasSafetyEducation) {
        console.log('  - EXPAND safety education content');
      }
    }

    return lesson;

  } catch (error) {
    console.error('ERROR in specific safety check:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

specificSafetyCheckLesson13();