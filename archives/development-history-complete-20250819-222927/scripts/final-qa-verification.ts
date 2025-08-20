import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalQualityAssuranceVerification() {
  console.log('🔍 FINAL QUALITY ASSURANCE VERIFICATION - COMPREHENSIVE SYSTEM AUDIT\n');
  console.log('='.repeat(80));
  console.log('Verifying ALL 50 units for complete integrity and pedagogical perfection');
  console.log('Checking for corruption, missing content, and implementation compliance\n');
  
  const EMILY_USER_ID = 23;
  
  // Initialize verification results
  const verification = {
    languageIntegrity: { passed: 0, failed: 0, issues: [] as string[] },
    dateCompatibility: { passed: 0, failed: 0, issues: [] as string[] },
    unitCounts: { total: 0, bySubject: {} as Record<string, number>, issues: [] as string[] },
    pedagogicalCompleteness: { passed: 0, failed: 0, issues: [] as string[] },
    hourAlignment: { total: 0, bySubject: {} as Record<string, number>, issues: [] as string[] },
    coreExtensionModel: { passed: 0, failed: 0, issues: [] as string[] },
    etfoCompliance: { passed: 0, failed: 0, issues: [] as string[] },
    healthFPSSpecial: { count: 0, frenchTitles: 0, issues: [] as string[] }
  };
  
  try {
    // Get all Long Range Plans with complete unit data
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: EMILY_USER_ID,
        academicYear: '2025-2026'
      },
      include: {
        unitPlans: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            description: true,
            descriptionFr: true,
            bigIdeas: true,
            bigIdeasFr: true,
            essentialQuestions: true,
            keyVocabulary: true,
            startDate: true,
            endDate: true,
            estimatedHours: true,
            assessmentPlan: true,
            differentiationStrategies: true,
            successCriteria: true,
            indigenousPerspectives: true,
            crossCurricularConnections: true,
            culminatingTask: true
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });
    
    console.log(`Found ${longRangePlans.length} subjects to verify\n`);
    
    // Process each subject
    for (const lrp of longRangePlans) {
      console.log(`\n📚 AUDITING ${lrp.subject.toUpperCase()}`);
      console.log('-'.repeat(60));
      
      verification.unitCounts.bySubject[lrp.subject] = lrp.unitPlans.length;
      verification.unitCounts.total += lrp.unitPlans.length;
      
      let subjectHours = 0;
      const isHealthFPS = lrp.subject === 'Formation personnelle et sociale';
      const isAlternating = ['Sciences humaines', 'Formation personnelle et sociale'].includes(lrp.subject);
      
      // Check unit count expectations
      const expectedCounts = {
        'Français (Immersion)': 10,
        'Mathématiques': 10,
        'Sciences de la nature': 10,
        'Arts visuels': 10,
        'Sciences humaines': 5,
        'Formation personnelle et sociale': 5
      };
      
      if (lrp.unitPlans.length !== expectedCounts[lrp.subject]) {
        verification.unitCounts.issues.push(
          `${lrp.subject}: Found ${lrp.unitPlans.length} units, expected ${expectedCounts[lrp.subject]}`
        );
      }
      
      // Verify each unit
      for (let i = 0; i < lrp.unitPlans.length; i++) {
        const unit = lrp.unitPlans[i];
        console.log(`  Unit ${i + 1}: "${unit.title}" (${unit.estimatedHours}h)`);
        
        subjectHours += unit.estimatedHours;
        
        // 1. LANGUAGE INTEGRITY CHECK
        const hasEnglishTitle = /^[A-Z][a-z]+ /.test(unit.title) && !/[àâäéèêëïîôùûüÿç]/.test(unit.title);
        const titleInFrench = unit.title && /[àâäéèêëïîôùûüÿç]/.test(unit.title);
        
        if (isHealthFPS) {
          verification.healthFPSSpecial.count++;
          if (titleInFrench) verification.healthFPSSpecial.frenchTitles++;
        }
        
        if (hasEnglishTitle || !titleInFrench) {
          verification.languageIntegrity.failed++;
          verification.languageIntegrity.issues.push(
            `${lrp.subject} Unit ${i + 1}: Suspect English title "${unit.title}"`
          );
          if (isHealthFPS) {
            verification.healthFPSSpecial.issues.push(`Unit ${i + 1}: English title "${unit.title}"`);
          }
        } else {
          verification.languageIntegrity.passed++;
        }
        
        // Check for French content in descriptions and big ideas
        if (unit.bigIdeas && !/[àâäéèêëïîôùûüÿç]/.test(unit.bigIdeas)) {
          verification.languageIntegrity.issues.push(
            `${lrp.subject} Unit ${i + 1}: Big ideas may be in English`
          );
        }
        
        // 2. DATE RANGE COMPATIBILITY CHECK
        const startDate = new Date(unit.startDate);
        const endDate = new Date(unit.endDate);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const expectedDays = isAlternating ? 
          Math.ceil(unit.estimatedHours / 0.75) * 2 : 
          Math.ceil(unit.estimatedHours / 0.75);
        const weeks = duration / 7;
        
        if (Math.abs(duration - expectedDays) > 2) {
          verification.dateCompatibility.failed++;
          verification.dateCompatibility.issues.push(
            `${lrp.subject} Unit ${i + 1}: Duration ${duration} days, expected ~${expectedDays} days`
          );
        } else {
          verification.dateCompatibility.passed++;
        }
        
        // Check for weekend dates (should not happen in consecutive model)
        if (startDate.getDay() === 0 || startDate.getDay() === 6 || 
            endDate.getDay() === 0 || endDate.getDay() === 6) {
          verification.dateCompatibility.issues.push(
            `${lrp.subject} Unit ${i + 1}: Contains weekend dates`
          );
        }
        
        // ETFO compliance check (units should be 2-4 weeks)
        if (weeks > 4.2) {
          verification.etfoCompliance.failed++;
          verification.etfoCompliance.issues.push(
            `${lrp.subject} Unit ${i + 1}: ${weeks.toFixed(1)} weeks (exceeds 4-week ETFO guideline)`
          );
        } else {
          verification.etfoCompliance.passed++;
        }
        
        // 3. PEDAGOGICAL COMPLETENESS CHECK
        const requiredFields = [
          'bigIdeas', 'essentialQuestions', 'keyVocabulary',
          'assessmentPlan', 'differentiationStrategies', 'successCriteria',
          'indigenousPerspectives', 'crossCurricularConnections', 'culminatingTask'
        ];
        
        let missingFields = [];
        for (const field of requiredFields) {
          if (!unit[field] || unit[field].toString().trim().length < 10) {
            missingFields.push(field);
          }
        }
        
        if (missingFields.length > 0) {
          verification.pedagogicalCompleteness.failed++;
          verification.pedagogicalCompleteness.issues.push(
            `${lrp.subject} Unit ${i + 1}: Missing/incomplete fields: ${missingFields.join(', ')}`
          );
        } else {
          verification.pedagogicalCompleteness.passed++;
        }
        
        // 4. CORE + EXTENSION MODEL CHECK
        if (unit.description && unit.description.includes('Core + Extension')) {
          verification.coreExtensionModel.passed++;
        } else {
          verification.coreExtensionModel.failed++;
          verification.coreExtensionModel.issues.push(
            `${lrp.subject} Unit ${i + 1}: Missing Core + Extension model reference`
          );
        }
        
        // Check for template-like content (red flag)
        if (unit.description && unit.description.includes('[TEMPLATE]') || 
            unit.assessmentPlan && unit.assessmentPlan.includes('[TEMPLATE]')) {
          verification.pedagogicalCompleteness.issues.push(
            `${lrp.subject} Unit ${i + 1}: Contains template placeholder text`
          );
        }
      }
      
      verification.hourAlignment.bySubject[lrp.subject] = subjectHours;
      verification.hourAlignment.total += subjectHours;
      
      console.log(`  ✅ Subject total: ${subjectHours} hours across ${lrp.unitPlans.length} units`);
    }
    
    // FINAL VERIFICATION CALCULATIONS
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FINAL QUALITY ASSURANCE RESULTS');
    console.log('='.repeat(80));
    
    // Hour alignment verification
    const expectedHours = {
      'Français (Immersion)': 145,
      'Mathématiques': 145,
      'Sciences de la nature': 145,
      'Arts visuels': 145,
      'Sciences humaines': 72,
      'Formation personnelle et sociale': 73
    };
    
    for (const [subject, expected] of Object.entries(expectedHours)) {
      const actual = verification.hourAlignment.bySubject[subject] || 0;
      const variance = Math.abs(actual - expected);
      const percentVariance = (variance / expected) * 100;
      
      if (percentVariance > 5) {
        verification.hourAlignment.issues.push(
          `${subject}: ${actual}h vs ${expected}h expected (${percentVariance.toFixed(1)}% variance)`
        );
      }
    }
    
    // GENERATE QUALITY METRICS
    console.log('\n📊 QUALITY METRICS:');
    console.log(`1. Total Units: ${verification.unitCounts.total} (Target: 50) ${verification.unitCounts.total === 50 ? '✅' : '❌'}`);
    console.log(`2. French Integrity: ${verification.languageIntegrity.passed}/${verification.languageIntegrity.passed + verification.languageIntegrity.failed} (${((verification.languageIntegrity.passed / (verification.languageIntegrity.passed + verification.languageIntegrity.failed)) * 100).toFixed(1)}%) ${verification.languageIntegrity.failed === 0 ? '✅' : '❌'}`);
    console.log(`3. Date Compatibility: ${verification.dateCompatibility.passed}/${verification.dateCompatibility.passed + verification.dateCompatibility.failed} (${((verification.dateCompatibility.passed / (verification.dateCompatibility.passed + verification.dateCompatibility.failed)) * 100).toFixed(1)}%) ${verification.dateCompatibility.failed === 0 ? '✅' : '❌'}`);
    console.log(`4. Pedagogical Completeness: ${verification.pedagogicalCompleteness.passed}/${verification.pedagogicalCompleteness.passed + verification.pedagogicalCompleteness.failed} (${((verification.pedagogicalCompleteness.passed / (verification.pedagogicalCompleteness.passed + verification.pedagogicalCompleteness.failed)) * 100).toFixed(1)}%) ${verification.pedagogicalCompleteness.failed === 0 ? '✅' : '❌'}`);
    console.log(`5. Hour Alignment: ${verification.hourAlignment.total}h (Target: ~725h) ${verification.hourAlignment.issues.length === 0 ? '✅' : '❌'}`);
    console.log(`6. Core+Extension Model: ${verification.coreExtensionModel.passed}/${verification.coreExtensionModel.passed + verification.coreExtensionModel.failed} (${((verification.coreExtensionModel.passed / (verification.coreExtensionModel.passed + verification.coreExtensionModel.failed)) * 100).toFixed(1)}%) ${verification.coreExtensionModel.failed === 0 ? '✅' : '❌'}`);
    console.log(`7. ETFO Compliance: ${verification.etfoCompliance.passed}/${verification.etfoCompliance.passed + verification.etfoCompliance.failed} (${((verification.etfoCompliance.passed / (verification.etfoCompliance.passed + verification.etfoCompliance.failed)) * 100).toFixed(1)}%) ${verification.etfoCompliance.failed === 0 ? '✅' : '❌'}`);
    
    // SPECIAL HEALTH/FPS VERIFICATION
    console.log('\n🏥 HEALTH/FPS SPECIAL VERIFICATION:');
    console.log(`Units: ${verification.healthFPSSpecial.count} (Target: 5) ${verification.healthFPSSpecial.count === 5 ? '✅' : '❌'}`);
    console.log(`French Titles: ${verification.healthFPSSpecial.frenchTitles}/${verification.healthFPSSpecial.count} ${verification.healthFPSSpecial.frenchTitles === verification.healthFPSSpecial.count ? '✅' : '❌'}`);
    
    // CRITICAL ISSUES REPORT
    let criticalIssues = 0;
    console.log('\n🚨 CRITICAL ISSUES REPORT:');
    
    if (verification.languageIntegrity.issues.length > 0) {
      console.log('\n❌ LANGUAGE INTEGRITY ISSUES:');
      verification.languageIntegrity.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.languageIntegrity.issues.length;
    }
    
    if (verification.dateCompatibility.issues.length > 0) {
      console.log('\n❌ DATE COMPATIBILITY ISSUES:');
      verification.dateCompatibility.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.dateCompatibility.issues.length;
    }
    
    if (verification.unitCounts.issues.length > 0) {
      console.log('\n❌ UNIT COUNT ISSUES:');
      verification.unitCounts.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.unitCounts.issues.length;
    }
    
    if (verification.pedagogicalCompleteness.issues.length > 0) {
      console.log('\n❌ PEDAGOGICAL COMPLETENESS ISSUES:');
      verification.pedagogicalCompleteness.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.pedagogicalCompleteness.issues.length;
    }
    
    if (verification.hourAlignment.issues.length > 0) {
      console.log('\n❌ HOUR ALIGNMENT ISSUES:');
      verification.hourAlignment.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.hourAlignment.issues.length;
    }
    
    if (verification.healthFPSSpecial.issues.length > 0) {
      console.log('\n❌ HEALTH/FPS SPECIFIC ISSUES:');
      verification.healthFPSSpecial.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.healthFPSSpecial.issues.length;
    }
    
    if (verification.etfoCompliance.issues.length > 0) {
      console.log('\n❌ ETFO COMPLIANCE ISSUES:');
      verification.etfoCompliance.issues.forEach(issue => console.log(`   • ${issue}`));
      criticalIssues += verification.etfoCompliance.issues.length;
    }
    
    // FINAL SYSTEM STATUS
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FINAL SYSTEM STATUS');
    console.log('='.repeat(80));
    
    if (criticalIssues === 0) {
      console.log('🎉 SYSTEM IS PERFECT!');
      console.log('✅ All 50 units verified and confirmed pedagogically complete');
      console.log('✅ 100% French integrity maintained');
      console.log('✅ 100% daily integration model compatibility');
      console.log('✅ 100% pedagogical completeness');
      console.log('✅ Perfect hour alignment within targets');
      console.log('✅ Health/FPS corruption completely resolved');
      console.log('✅ ETFO compliance achieved across all units');
      console.log('\n🚀 READY FOR EMILY MCISAAC\'S GRADE 1 FRENCH IMMERSION CLASSROOM!');
    } else {
      console.log(`❌ SYSTEM HAS ${criticalIssues} CRITICAL ISSUES`);
      console.log('🔧 REQUIRES IMMEDIATE CORRECTION BEFORE IMPLEMENTATION');
    }
    
    // SUBJECT BREAKDOWN
    console.log('\n📚 DETAILED SUBJECT BREAKDOWN:');
    Object.entries(verification.unitCounts.bySubject).forEach(([subject, count]) => {
      const hours = verification.hourAlignment.bySubject[subject];
      console.log(`   ${subject}: ${count} units, ${hours} hours`);
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR during quality assurance verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalQualityAssuranceVerification();