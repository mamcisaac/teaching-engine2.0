#!/usr/bin/env node
/**
 * PERFECT HIERARCHY-BASED PROMPT GENERATOR
 * Uses the actual database unit plans with their expectations, big ideas, and context
 */

const { PrismaClient } = require('@teaching-engine/database');
const fs = require('fs');
const path = require('path');
const { getSpecificProgression, getPriorLearning, getNextSteps } = require('./lesson-progressions.cjs');
const { getDifferentiationStrategies, determineLessonType, formatDifferentiation } = require('./differentiation-strategies.cjs');

// Monthly constraints from language acquisition research
const MONTHLY_CONSTRAINTS = {
  vocabularyLimit: new Map([
    [9, 3], [10, 3], [11, 4], [12, 4], [1, 4], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5]
  ]),
  frenchPercentage: new Map([
    [9, 30], [10, 40], [11, 50], [12, 60], [1, 65], [2, 70], [3, 75], [4, 80], [5, 85], [6, 85]
  ])
};

// Subject lesson distribution (975 total)
const SUBJECT_LESSONS = {
  'Français (Immersion)': 195,
  'Mathématiques': 195,
  'Sciences de la nature': 195,
  'Arts visuels': 195,
  'Sciences humaines': 97,
  'Formation personnelle et sociale': 98
};

/**
 * Get month from lesson date within unit timeframe
 */
function getLessonMonth(unit, lessonNumber, totalLessons) {
  const startDate = new Date(unit.startDate);
  const endDate = new Date(unit.endDate);
  const unitDuration = endDate - startDate;
  const lessonProgress = (lessonNumber - 1) / (totalLessons - 1);
  const lessonDate = new Date(startDate.getTime() + unitDuration * lessonProgress);
  const month = lessonDate.getMonth() + 1;
  return month >= 9 ? month : month <= 6 ? month : 9;
}

/**
 * Get enhanced lesson progression with specific skills
 */
function getLessonProgression(lessonNumber, totalLessons, expectations, unit) {
  const progress = lessonNumber / totalLessons;
  const subject = unit.longRangePlan.subject;
  const unitTitle = unit.title;
  
  let primaryExpectation, secondaryExpectation, focus, currentSkill;
  
  if (progress <= 0.5 && expectations.length >= 1) {
    // First half - focus on first expectation
    primaryExpectation = expectations[0];
    focus = 'Building foundational understanding';
    currentSkill = getSpecificProgression(subject, unitTitle, primaryExpectation.expectation.code, lessonNumber);
  } else if (progress <= 0.8 && expectations.length >= 2) {
    // Second half - integrate both expectations
    primaryExpectation = expectations[1];
    secondaryExpectation = expectations[0];
    focus = 'Integrating and applying understanding';
    const adjustedLesson = lessonNumber - Math.floor(totalLessons * 0.5);
    currentSkill = getSpecificProgression(subject, unitTitle, primaryExpectation.expectation.code, adjustedLesson);
  } else {
    // Final lessons - synthesis and culminating task prep
    primaryExpectation = expectations[0];
    secondaryExpectation = expectations.length > 1 ? expectations[1] : null;
    focus = 'Synthesis and culminating task preparation';
    currentSkill = 'Integrate all unit learning for culminating demonstration';
  }
  
  // Get prior and next context
  const priorContext = getPriorLearning(subject, unitTitle, primaryExpectation.expectation.code, lessonNumber);
  const nextContext = getNextSteps(subject, unitTitle, primaryExpectation.expectation.code, lessonNumber, totalLessons);
  
  return {
    primaryExpectation,
    secondaryExpectation,
    focus,
    currentSkill,
    priorContext,
    nextContext
  };
}

/**
 * Generate PERFECT prompt using unit hierarchy
 */
function generatePerfectPrompt(unit, lessonNumber, totalLessons) {
  const month = getLessonMonth(unit, lessonNumber, totalLessons);
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  const frenchPercent = MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30;
  const progression = getLessonProgression(lessonNumber, totalLessons, unit.expectations, unit);
  
  // Build vocabulary selection from unit's key vocabulary
  const vocabularyContext = unit.keyVocabulary && unit.keyVocabulary.length > 0 ? 
    `UNIT VOCABULARY BANK: ${unit.keyVocabulary.slice(0, 10).join(', ')}...
Select exactly ${vocabLimit} terms for this lesson with French word, English translation, gesture, and visual cue.` :
    `Create exactly ${vocabLimit} vocabulary terms with French word, English translation, gesture, and visual cue.`;

  // Format expectations with clear focus
  const expectationsText = unit.expectations.map(exp => 
    `${exp.expectation.code}: ${exp.expectation.description}`
  ).join('\n');

  const primaryFocus = progression.primaryExpectation ? 
    `PRIMARY FOCUS: ${progression.primaryExpectation.expectation.code} - ${progression.primaryExpectation.expectation.description}` :
    'FOCUS: Integrated understanding of all unit expectations';

  // Get dynamic differentiation based on lesson type
  const lessonType = determineLessonType(
    progression.primaryExpectation?.expectation.code || '', 
    progression.currentSkill || ''
  );
  const differentiationStrategies = getDifferentiationStrategies(lessonType);
  const differentiationText = formatDifferentiation(differentiationStrategies);

  return `Grade 1 French Immersion ${unit.longRangePlan.subject}
Unit: "${unit.title}" (Lesson ${lessonNumber}/${totalLessons})
Dates: ${unit.startDate?.toISOString().split('T')[0]} to ${unit.endDate?.toISOString().split('T')[0]}

UNIT CONTEXT (from database):
Big Ideas: ${unit.bigIdeas || 'Develop foundational understanding and skills'}

Essential Questions: ${Array.isArray(unit.essentialQuestions) ? 
  unit.essentialQuestions.join('; ') : 
  unit.essentialQuestions || 'How do we apply our learning?'}

CURRICULUM EXPECTATIONS (from unit plan):
${expectationsText}

${primaryFocus}

TODAY'S SPECIFIC FOCUS:
${progression.currentSkill}

LESSON PROGRESSION:
Phase: ${progression.focus}
Prior Learning: ${progression.priorContext}
Next Steps: ${progression.nextContext}

ETFO REQUIREMENTS:
- Duration: 45 minutes EXACTLY (Minds On: 8 min, Action: 27 min, Consolidation: 10 min)
- Language: ${frenchPercent}% French instruction (${month === 9 ? 'heavy visual support needed' : month >= 4 ? 'students comfortable with French' : 'building French confidence'})
- Assessment: Observable with checkboxes, formative during activities
- Movement: Required (age-appropriate for Grade 1)
- Partner Work: Essential for language development
- Safety: Grade 1 classroom protocols

VOCABULARY REQUIREMENTS:
${vocabularyContext}

${differentiationText}

BUILDING TO CULMINATING TASK:
${unit.culminatingTask || 'Students will demonstrate understanding through a performance task showing mastery of unit expectations'}

INDIGENOUS PERSPECTIVES (Mi'kmaq - PEI):
Include authentic connection to Mi'kmaq culture relevant to ${unit.title} and today's skill focus

GENERATE COMPLETE ETFO LESSON:
1. Bilingual title (French/English) reflecting lesson focus
2. Learning goals aligned to ${progression.primaryExpectation?.expectation.code || 'unit expectations'}
3. Success criteria (2-3 observable behaviors)
4. Vocabulary with full requirements
5. Three-part lesson structure with specific activities
6. Assessment checklist with observable behaviors
7. Differentiation strategies for all learner types
8. Materials list (standard Grade 1 supplies)
9. Safety considerations if needed
10. Mi'kmaq cultural connection

Focus on hands-on, developmentally appropriate learning for 6-year-olds in ${['September','October','November','December','January','February','March','April','May','June'][month-9] || 'September'}.`;
}

/**
 * Query database for complete unit context
 */
async function getUnitWithContext(unitId) {
  const prisma = new PrismaClient();
  
  try {
    const unit = await prisma.unitPlan.findUnique({
      where: { id: unitId },
      include: {
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                title: true,
                description: true,
                subject: true
              }
            }
          }
        }
      }
    });
    
    return unit;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate prompts for all units
 */
async function generateAllPerfectPrompts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Generating PERFECT hierarchy-based prompts for 975 lessons...\n');
    
    // Get all units with their context
    const units = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                title: true,
                description: true,
                subject: true
              }
            }
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    console.log(`📚 Found ${units.length} units in database\n`);
    
    // Group by subject and calculate lessons per unit
    const unitsBySubject = {};
    for (const unit of units) {
      const subject = unit.longRangePlan.subject;
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    }
    
    const allPrompts = {};
    let totalGenerated = 0;
    
    // Generate prompts for each subject
    for (const [subject, expectedLessons] of Object.entries(SUBJECT_LESSONS)) {
      console.log(`📖 Processing ${subject}...`);
      const subjectUnits = unitsBySubject[subject] || [];
      
      if (subjectUnits.length === 0) {
        console.warn(`⚠️  No units found for ${subject}`);
        continue;
      }
      
      // Calculate lessons per unit
      const lessonsPerUnit = Math.floor(expectedLessons / subjectUnits.length);
      const remainder = expectedLessons % subjectUnits.length;
      
      const subjectPrompts = [];
      
      for (let i = 0; i < subjectUnits.length; i++) {
        const unit = subjectUnits[i];
        const unitLessons = lessonsPerUnit + (i < remainder ? 1 : 0);
        
        console.log(`  📝 Unit "${unit.title}": ${unitLessons} lessons`);
        console.log(`      Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
        
        // Generate prompts for each lesson in this unit
        for (let j = 1; j <= unitLessons; j++) {
          const prompt = generatePerfectPrompt(unit, j, unitLessons);
          
          subjectPrompts.push({
            id: `${unit.id}-lesson-${j}`,
            unitId: unit.id,
            unitTitle: unit.title,
            subject: subject,
            lessonNumber: j,
            totalLessonsInUnit: unitLessons,
            expectations: unit.expectations.map(e => e.expectation.code),
            month: getLessonMonth(unit, j, unitLessons),
            prompt: prompt
          });
        }
        
        console.log('');
      }
      
      allPrompts[subject] = subjectPrompts;
      totalGenerated += subjectPrompts.length;
      
      // Save subject prompts
      const subjectDir = subject.toLowerCase()
        .replace(/[éèç]/g, 'e')
        .replace(/[() ]/g, '-')
        .replace(/--+/g, '-');
      
      const outputDir = path.join(__dirname, '../lessons/prompts-perfect', subjectDir);
      fs.mkdirSync(outputDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(outputDir, 'prompts.json'),
        JSON.stringify(subjectPrompts, null, 2)
      );
      
      console.log(`  ✅ Saved ${subjectPrompts.length} prompts\n`);
    }
    
    // Save master file
    const masterDir = path.join(__dirname, '../lessons/prompts-perfect');
    fs.mkdirSync(masterDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(masterDir, 'all-prompts-perfect.json'),
      JSON.stringify(allPrompts, null, 2)
    );
    
    // Generate summary
    const summary = {
      totalPrompts: totalGenerated,
      generatedAt: new Date().toISOString(),
      bySubject: Object.entries(allPrompts).map(([subject, prompts]) => ({
        subject,
        count: prompts.length,
        expected: SUBJECT_LESSONS[subject],
        match: prompts.length === SUBJECT_LESSONS[subject] ? '✅' : '⚠️'
      }))
    };
    
    fs.writeFileSync(
      path.join(masterDir, 'generation-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('='.repeat(60));
    console.log('✨ PERFECT HIERARCHY-BASED PROMPTS COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total prompts: ${totalGenerated}`);
    console.log(`📁 Output: lessons/prompts-perfect/`);
    console.log(`📄 Summary: generation-summary.json`);
    
    if (totalGenerated === 975) {
      console.log('\n🎯 SUCCESS: Generated exactly 975 perfect prompts!');
    } else {
      console.log(`\n⚠️  Generated ${totalGenerated} prompts (expected 975)`);
    }
    
  } catch (error) {
    console.error('❌ Error generating prompts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  generateAllPerfectPrompts();
}

module.exports = { generatePerfectPrompt, getUnitWithContext };