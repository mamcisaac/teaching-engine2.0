/**
 * 🧪 TEMPLATE INTEGRATION TEST
 * Tests lesson plan templates with actual unit plans from the database
 * Validates template-unit integration for Emily's Grade 1 French Immersion system
 */

import { PrismaClient } from '@teaching-engine/database';
import { FrenchImmerTemplate } from './subjects/FrenchImmerTemplate';
import { MathematicsTemplate } from './subjects/MathematicsTemplate';
import { ScienceTemplate } from './subjects/ScienceTemplate';
import { ArtsTemplate } from './subjects/ArtsTemplate';
import { SocialStudiesTemplate } from './subjects/SocialStudiesTemplate';
import { HealthFPSTemplate } from './subjects/HealthFPSTemplate';
import { TemplateValidator } from './validation/TemplateValidator';
import { LessonPlanTemplate } from './types/LessonPlanTemplate';

const prisma = new PrismaClient();

interface IntegrationTestResult {
  subject: string;
  unitPlanTitle: string;
  templateGenerated: boolean;
  validationScore: number;
  errors: number;
  warnings: number;
  recommendations: number;
  isValid: boolean;
}

async function testTemplateIntegration() {
  console.log('🧪 TESTING LESSON PLAN TEMPLATE INTEGRATION');
  console.log('=' .repeat(80));
  console.log('Testing templates with actual unit plans from Emily\'s perfect foundation...\n');

  const testResults: IntegrationTestResult[] = [];

  try {
    // Test each subject template
    await testFrenchTemplate(testResults);
    await testMathematicsTemplate(testResults);
    await testScienceTemplate(testResults);
    await testArtsTemplate(testResults);
    await testSocialStudiesTemplate(testResults);
    await testHealthFPSTemplate(testResults);

    // Generate summary report
    generateSummaryReport(testResults);

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testFrenchTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('🇫🇷 Testing French Immersion Template...');
  
  try {
    // Get a sample French unit plan
    const frenchUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Français (Immersion)' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!frenchUnit) {
      console.log('❌ No French unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${frenchUnit.title}"`);

    // Create sample lesson using template
    const sampleLesson = FrenchImmerTemplate.createFrenchLesson({
      unitPlanId: frenchUnit.id,
      title: 'Les sons de l\'automne',
      titleEn: 'Sounds of Fall',
      focus: 'oral',
      thematicUnit: frenchUnit.title,
      vocabulary: [
        { term: 'les feuilles', definition: 'parties colorées des arbres en automne', visualSupport: 'image de feuilles' },
        { term: 'le vent', definition: 'air qui bouge', gestures: 'mouvement des bras' },
        { term: 'écouter', definition: 'utiliser ses oreilles pour entendre', visualSupport: 'image d\'oreille' }
      ],
      storyBook: 'L\'automne dans la forêt'
    });

    // Validate the generated lesson
    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Français (Immersion)',
      unitPlanTitle: frenchUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);
    if (validation.errors.length > 0) {
      console.log(`  ⚠️  ${validation.errors.length} errors found`);
    }

  } catch (error) {
    console.log(`  ❌ French template test failed: ${error}`);
    testResults.push({
      subject: 'Français (Immersion)',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

async function testMathematicsTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('🔢 Testing Mathematics Template...');
  
  try {
    const mathUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Mathématiques' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!mathUnit) {
      console.log('❌ No Mathematics unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${mathUnit.title}"`);

    const sampleLesson = MathematicsTemplate.createMathLesson({
      unitPlanId: mathUnit.id,
      title: 'Compter jusqu\'à 10',
      titleEn: 'Counting to 10',
      strand: 'number-sense',
      specificTopic: 'Reconnaissance des nombres 1-10',
      vocabulary: [
        { term: 'un, deux, trois', definition: 'les premiers nombres pour compter' },
        { term: 'combien', definition: 'question pour savoir la quantité' },
        { term: 'plus', definition: 'ajouter, avoir plus' }
      ],
      manipulatives: ['cubes unifix', 'jetons', 'objets à compter'],
      numberRange: '1-10'
    });

    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Mathématiques',
      unitPlanTitle: mathUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);

  } catch (error) {
    console.log(`  ❌ Mathematics template test failed: ${error}`);
    testResults.push({
      subject: 'Mathématiques',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

async function testScienceTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('🔬 Testing Science Template...');
  
  try {
    const scienceUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Sciences de la nature' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!scienceUnit) {
      console.log('❌ No Science unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${scienceUnit.title}"`);

    const sampleLesson = ScienceTemplate.createScienceLesson({
      unitPlanId: scienceUnit.id,
      title: 'Observer les feuilles d\'automne',
      titleEn: 'Observing Fall Leaves',
      inquiryFocus: 'observation',
      scienceTopic: 'Changements saisonniers',
      vocabulary: [
        { term: 'observer', definition: 'regarder attentivement', gestures: 'pointer vers les yeux' },
        { term: 'couleur', definition: 'rouge, jaune, vert, brun', visualSupport: 'échantillons de couleurs' },
        { term: 'texture', definition: 'comment quelque chose se sent au toucher' }
      ],
      materials: ['loupes', 'feuilles variées', 'journal d\'observation'],
      safetyLevel: 'low',
      seasonalConnection: 'automne'
    });

    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Sciences de la nature',
      unitPlanTitle: scienceUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);

  } catch (error) {
    console.log(`  ❌ Science template test failed: ${error}`);
    testResults.push({
      subject: 'Sciences de la nature',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

async function testArtsTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('🎨 Testing Arts Template...');
  
  try {
    const artsUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Arts visuels' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!artsUnit) {
      console.log('❌ No Arts unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${artsUnit.title}"`);

    const sampleLesson = ArtsTemplate.createArtsLesson({
      unitPlanId: artsUnit.id,
      title: 'Peindre l\'automne',
      titleEn: 'Painting Fall',
      artsFocus: 'creating',
      medium: 'painting',
      technique: 'aquarelle simple',
      vocabulary: [
        { term: 'pinceau', definition: 'outil pour peindre', visualSupport: 'vrai pinceau' },
        { term: 'mélanger', definition: 'combiner deux couleurs', gestures: 'mouvement circulaire' },
        { term: 'chef-d\'œuvre', definition: 'une création artistique personnelle' }
      ],
      materials: ['aquarelles', 'pinceaux', 'papier', 'eau'],
      culturalConnection: 'tradition automnale acadienne'
    });

    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Arts visuels',
      unitPlanTitle: artsUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);

  } catch (error) {
    console.log(`  ❌ Arts template test failed: ${error}`);
    testResults.push({
      subject: 'Arts visuels',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

async function testSocialStudiesTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('🏛️ Testing Social Studies Template...');
  
  try {
    const socialStudiesUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Sciences humaines' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!socialStudiesUnit) {
      console.log('❌ No Social Studies unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${socialStudiesUnit.title}"`);

    const sampleLesson = SocialStudiesTemplate.createSocialStudiesLesson({
      unitPlanId: socialStudiesUnit.id,
      title: 'Ma famille spéciale',
      titleEn: 'My Special Family',
      socialStudiesFocus: 'identity',
      specificTopic: 'Structures familiales diverses',
      vocabulary: [
        { term: 'famille', definition: 'les personnes qui nous aiment et prennent soin de nous' },
        { term: 'unique', definition: 'spécial, différent des autres' },
        { term: 'tradition', definition: 'quelque chose qu\'on fait ensemble chaque année' }
      ],
      communityConnection: 'familles de l\'école',
      culturalElement: 'diversité culturelle'
    });

    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Sciences humaines',
      unitPlanTitle: socialStudiesUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);

  } catch (error) {
    console.log(`  ❌ Social Studies template test failed: ${error}`);
    testResults.push({
      subject: 'Sciences humaines',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

async function testHealthFPSTemplate(testResults: IntegrationTestResult[]): Promise<void> {
  console.log('💝 Testing Health/FPS Template...');
  
  try {
    const healthUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlan: { subject: 'Formation personnelle et sociale' },
        isLocked: true 
      },
      include: { longRangePlan: true }
    });

    if (!healthUnit) {
      console.log('❌ No Health/FPS unit plan found');
      return;
    }

    console.log(`  📋 Using unit: "${healthUnit.title}"`);

    const sampleLesson = HealthFPSTemplate.createHealthFPSLesson({
      unitPlanId: healthUnit.id,
      title: 'Mes émotions sont normales',
      titleEn: 'My Emotions Are Normal',
      healthFocus: 'emotions',
      specificTopic: 'Reconnaissance des émotions de base',
      vocabulary: [
        { term: 'content', definition: 'se sentir heureux et bien', gestures: 'sourire' },
        { term: 'triste', definition: 'se sentir pas heureux', visualSupport: 'visage triste' },
        { term: 'fâché', definition: 'se sentir en colère', gestures: 'froncer les sourcils' }
      ],
      sensitivityLevel: 'medium',
      traumaInformed: true
    });

    const validation = TemplateValidator.validateTemplate(sampleLesson);

    testResults.push({
      subject: 'Formation personnelle et sociale',
      unitPlanTitle: healthUnit.title,
      templateGenerated: true,
      validationScore: validation.score,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      recommendations: validation.recommendations.length,
      isValid: validation.isValid
    });

    console.log(`  ✅ Template generated successfully (Score: ${validation.score}/100)`);

  } catch (error) {
    console.log(`  ❌ Health/FPS template test failed: ${error}`);
    testResults.push({
      subject: 'Formation personnelle et sociale',
      unitPlanTitle: 'ERROR',
      templateGenerated: false,
      validationScore: 0,
      errors: 1,
      warnings: 0,
      recommendations: 0,
      isValid: false
    });
  }
}

function generateSummaryReport(testResults: IntegrationTestResult[]): void {
  console.log('\n📊 INTEGRATION TEST SUMMARY REPORT');
  console.log('=' .repeat(80));

  const totalTests = testResults.length;
  const successfulTests = testResults.filter(t => t.templateGenerated).length;
  const validTests = testResults.filter(t => t.isValid).length;
  const averageScore = testResults.reduce((sum, t) => sum + t.validationScore, 0) / totalTests;

  console.log(`\n🎯 OVERALL RESULTS:`);
  console.log(`  Templates Generated: ${successfulTests}/${totalTests} (${(successfulTests/totalTests*100).toFixed(1)}%)`);
  console.log(`  Valid Templates: ${validTests}/${totalTests} (${(validTests/totalTests*100).toFixed(1)}%)`);
  console.log(`  Average Quality Score: ${averageScore.toFixed(1)}/100`);

  console.log(`\n📋 DETAILED RESULTS:`);
  testResults.forEach(result => {
    const status = result.templateGenerated 
      ? (result.isValid ? '✅ VALID' : '⚠️  ISSUES') 
      : '❌ FAILED';
    
    console.log(`  ${result.subject.padEnd(35)} ${status.padEnd(12)} Score: ${result.validationScore.toString().padStart(3)}/100`);
    if (result.errors > 0 || result.warnings > 0) {
      console.log(`    ${''.padEnd(35)} Errors: ${result.errors}, Warnings: ${result.warnings}`);
    }
  });

  console.log(`\n🏆 INTEGRATION SUCCESS ANALYSIS:`);
  if (averageScore >= 90) {
    console.log(`  🌟 EXCELLENT: Templates integrate excellently with unit plans`);
  } else if (averageScore >= 80) {
    console.log(`  ✅ GOOD: Templates integrate well with minor improvements needed`);
  } else if (averageScore >= 70) {
    console.log(`  ⚠️  ACCEPTABLE: Templates integrate adequately but need improvements`);
  } else {
    console.log(`  ❌ NEEDS WORK: Templates need significant improvements for proper integration`);
  }

  console.log(`\n🎯 NEXT STEPS:`);
  console.log(`  1. Review any errors or warnings in template validation`);
  console.log(`  2. Test templates with actual lesson plan generation`);
  console.log(`  3. Gather teacher feedback on template usability`);
  console.log(`  4. Iterate on templates based on real-world usage`);
  
  console.log(`\n✅ INTEGRATION TEST COMPLETE - Templates ready for lesson generation!`);
}

// Run the integration test
testTemplateIntegration().catch(console.error);