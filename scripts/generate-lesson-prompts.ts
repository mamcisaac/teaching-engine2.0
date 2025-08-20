#!/usr/bin/env tsx
/**
 * PERFECT LESSON PROMPT GENERATOR
 * Creates 975 PERFECT prompts incorporating:
 * - Verified PEI Grade 1 curriculum expectations
 * - ETFO best practices and requirements
 * - Unit plans with strategic perfection
 * - Progressive language development
 * - Indigenous perspectives (Mi'kmaq for PEI)
 * - Safety protocols where needed
 */

import * as fs from 'fs';
import * as path from 'path';

// Load the perfect unit plans from backup
const BACKUP_PATH = path.join(__dirname, '../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z');
const OUTPUT_PATH = path.join(__dirname, '../lessons/prompts');
const CURRICULUM_PATH = path.join(__dirname, '../curriculum/PEI_GRADE1_FRENCH_IMMERSION_FINAL.json');

// Subject teaching structure
const SUBJECT_LESSONS = {
  'Français (Immersion)': 195,
  'Mathématiques': 195,
  'Sciences de la nature': 195,
  'Arts visuels': 195,
  'Sciences humaines': 97,
  'Formation personnelle et sociale': 98
};

// Monthly constraints from template
const MONTHLY_CONSTRAINTS = {
  vocabularyLimit: new Map([
    [9, 3],   // September
    [10, 3],  // October  
    [11, 4],  // November
    [12, 4],  // December
    [1, 4],   // January
    [2, 5],   // February
    [3, 5],   // March
    [4, 5],   // April
    [5, 5],   // May
    [6, 5]    // June
  ]),
  
  frenchPercentage: new Map([
    [9, 30],  // September
    [10, 40], // October
    [11, 50], // November
    [12, 60], // December
    [1, 65],  // January
    [2, 70],  // February
    [3, 75],  // March
    [4, 80],  // April
    [5, 85],  // May
    [6, 85]   // June
  ])
};

// Subject-specific focuses with enhanced requirements
const SUBJECT_FOCUSES: Record<string, string> = {
  'Français (Immersion)': 'Emphasize oral language, songs, and stories. Include phonological awareness activities.',
  'Mathématiques': 'Use manipulatives and counting objects. Include visual number representations.',
  'Sciences de la nature': 'Start with observation and hands-on exploration. Ensure safety protocols for materials.',
  'Arts visuels': 'Focus on process over product, exploration over technique. Include sensory experiences.',
  'Sciences humaines': 'Connect to students\' families and classroom community. Include local PEI content.',
  'Formation personnelle et sociale': 'Ensure emotional safety, provide opt-out options. Include self-regulation strategies.'
};

interface UnitPlan {
  id: string;
  title: string;
  titleFr?: string;
  description?: string;
  startDate: string;
  endDate: string;
  longRangePlan: {
    subject: string;
    title: string;
  };
}

interface CurriculumExpectation {
  code: string;
  description: string;
  source?: string;
}

interface CurriculumData {
  taught_in_french: Record<string, CurriculumExpectation[]>;
}

interface LessonPrompt {
  id: string;
  subject: string;
  unitPlanId: string;
  unitTitle: string;
  lessonNumber: number;
  totalLessonsInUnit: number;
  month: number;
  prompt: string;
  constraints: {
    vocabularyLimit: number;
    frenchPercentage: number;
  };
}

/**
 * Generate PERFECT prompts with all ETFO requirements and curriculum alignment
 */
function generatePerfectPrompt(
  subject: string,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number,
  unitDescription?: string,
  curriculumExpectations?: CurriculumExpectation[]
): string {
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  const frenchPercent = MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30;
  const focus = SUBJECT_FOCUSES[subject] || '';
  
  // Add curriculum expectations if available
  let curriculumContext = '';
  if (curriculumExpectations && curriculumExpectations.length > 0) {
    // Select relevant expectations for this lesson (rotate through them)
    const expectationIndex = (lessonNumber - 1) % curriculumExpectations.length;
    const expectation = curriculumExpectations[expectationIndex];
    curriculumContext = `\nCurriculum Focus (${expectation.code}): ${expectation.description}\n`;
  }
  
  // Build the perfect prompt with all requirements
  return `Grade 1 French Immersion ${subject} lesson for "${unitTitle}" (lesson ${lessonNumber}/${totalLessons}).
${curriculumContext}
ETFO Requirements:
- Duration: 45 minutes EXACTLY (Minds On: 8 min, Action: 27 min, Consolidation: 10 min)
- Language: ${frenchPercent}% French instruction, max ${vocabLimit} new vocabulary terms
- Each vocabulary term MUST have: French word, English translation, gesture, visual cue
- Include: movement activity, partner work, visual supports
- Materials: standard classroom supplies only (crayons, paper, manipulatives, etc.)

Assessment Requirements:
- Observable assessment with checkboxes (☐)
- Include formative assessment during activities
- Student self-assessment in consolidation

Differentiation Required:
- Support for struggling learners
- Modifications for IEP students
- ELL support strategies
- Extensions for advanced learners

Indigenous Perspectives:
- Include authentic Mi'kmaq connections relevant to PEI (minimum 100 characters)
- Connect to local Indigenous knowledge when possible

${focus}

Generate a complete lesson with:
1. Bilingual title (French/English)
2. Clear learning objective with 2-3 success criteria
3. Vocabulary (${vocabLimit} terms) with gestures and visual cues
4. Three-part lesson structure with detailed activities
5. Assessment checklist
6. Differentiation strategies
7. Indigenous connection

Focus on hands-on, developmentally appropriate learning for 6-year-olds.
Safety notes if using scissors, movement, or sensory materials.`;
}

/**
 * Calculate which month a date falls in for school year
 */
function getSchoolMonth(dateStr: string): number {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  // School year runs Sept-June
  if (month >= 9) return month; // Sept-Dec
  if (month <= 6) return month; // Jan-June
  return 9; // Default to September for any edge cases
}

/**
 * Distribute lessons across unit date range with curriculum alignment
 */
function distributeLessonsAcrossUnit(
  unit: UnitPlan, 
  totalLessons: number,
  curriculumExpectations?: CurriculumExpectation[]
): LessonPrompt[] {
  const prompts: LessonPrompt[] = [];
  const startDate = new Date(unit.startDate);
  const endDate = new Date(unit.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < totalLessons; i++) {
    // Distribute lessons evenly across the unit timeframe
    const lessonDayOffset = Math.floor((i / totalLessons) * totalDays);
    const lessonDate = new Date(startDate);
    lessonDate.setDate(lessonDate.getDate() + lessonDayOffset);
    const month = getSchoolMonth(lessonDate.toISOString());
    
    const prompt = generatePerfectPrompt(
      unit.longRangePlan.subject,
      unit.title,
      i + 1,
      totalLessons,
      month,
      unit.description,
      curriculumExpectations
    );
    
    prompts.push({
      id: `${unit.id}-lesson-${i + 1}`,
      subject: unit.longRangePlan.subject,
      unitPlanId: unit.id,
      unitTitle: unit.title,
      lessonNumber: i + 1,
      totalLessonsInUnit: totalLessons,
      month,
      prompt,
      constraints: {
        vocabularyLimit: MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3,
        frenchPercentage: MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30
      }
    });
  }
  
  return prompts;
}

/**
 * Main function to generate all prompts
 */
async function generateAllPrompts() {
  console.log('🚀 Starting PERFECT prompt generation for 975 lessons...\n');
  
  // Load unit plans
  const unitPlansPath = path.join(BACKUP_PATH, 'strategically-perfect-unit-plans.json');
  if (!fs.existsSync(unitPlansPath)) {
    console.error('❌ Unit plans file not found:', unitPlansPath);
    process.exit(1);
  }
  
  const unitPlans: UnitPlan[] = JSON.parse(fs.readFileSync(unitPlansPath, 'utf-8'));
  console.log(`📚 Loaded ${unitPlans.length} unit plans\n`);
  
  // Load curriculum expectations
  let curriculumData: CurriculumData | null = null;
  if (fs.existsSync(CURRICULUM_PATH)) {
    curriculumData = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
    console.log(`📖 Loaded PEI Grade 1 curriculum expectations\n`);
  } else {
    console.warn(`⚠️  Curriculum file not found, continuing without expectations\n`);
  }
  
  // Group units by subject
  const unitsBySubject: Record<string, UnitPlan[]> = {};
  for (const unit of unitPlans) {
    const subject = unit.longRangePlan.subject;
    if (!unitsBySubject[subject]) {
      unitsBySubject[subject] = [];
    }
    unitsBySubject[subject].push(unit);
  }
  
  // Track totals
  let totalPromptsGenerated = 0;
  const allPrompts: Record<string, LessonPrompt[]> = {};
  
  // Generate prompts for each subject
  for (const [subject, expectedLessons] of Object.entries(SUBJECT_LESSONS)) {
    console.log(`\n📖 Processing ${subject}...`);
    const units = unitsBySubject[subject] || [];
    
    if (units.length === 0) {
      console.warn(`⚠️  No units found for ${subject}`);
      continue;
    }
    
    // Sort units by start date
    units.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // Calculate lessons per unit
    const lessonsPerUnit = Math.floor(expectedLessons / units.length);
    const remainder = expectedLessons % units.length;
    
    const subjectPrompts: LessonPrompt[] = [];
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      // Distribute remainder lessons across first units
      const unitLessons = lessonsPerUnit + (i < remainder ? 1 : 0);
      
      console.log(`  📝 Unit "${unit.title}": ${unitLessons} lessons`);
      
      // Get curriculum expectations for this subject
      const subjectExpectations = curriculumData?.taught_in_french?.[subject] || [];
      
      const unitPrompts = distributeLessonsAcrossUnit(unit, unitLessons, subjectExpectations);
      subjectPrompts.push(...unitPrompts);
    }
    
    allPrompts[subject] = subjectPrompts;
    totalPromptsGenerated += subjectPrompts.length;
    
    // Save subject prompts
    const subjectDir = subject.toLowerCase()
      .replace('é', 'e')
      .replace('è', 'e')
      .replace('ç', 'c')
      .replace(/ /g, '-')
      .replace(/[()]/g, '');
    
    const outputDir = path.join(OUTPUT_PATH, subjectDir);
    fs.mkdirSync(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, 'prompts.json');
    fs.writeFileSync(outputFile, JSON.stringify(subjectPrompts, null, 2));
    
    console.log(`  ✅ Saved ${subjectPrompts.length} prompts to ${outputFile}`);
  }
  
  // Generate summary report
  const summary = {
    totalPrompts: totalPromptsGenerated,
    generatedAt: new Date().toISOString(),
    bySubject: Object.entries(allPrompts).map(([subject, prompts]) => ({
      subject,
      count: prompts.length,
      expected: SUBJECT_LESSONS[subject],
      match: prompts.length === SUBJECT_LESSONS[subject] ? '✅' : '⚠️'
    })),
    monthlyDistribution: calculateMonthlyDistribution(allPrompts)
  };
  
  // Save summary
  const summaryPath = path.join(OUTPUT_PATH, 'generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  // Save master file with all prompts
  const masterPath = path.join(OUTPUT_PATH, 'all-prompts.json');
  fs.writeFileSync(masterPath, JSON.stringify(allPrompts, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ PROMPT GENERATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Total prompts generated: ${totalPromptsGenerated}`);
  console.log(`📁 Output directory: ${OUTPUT_PATH}`);
  console.log(`📄 Summary report: ${summaryPath}`);
  console.log(`📚 Master file: ${masterPath}`);
  
  // Verify we hit our target
  if (totalPromptsGenerated === 975) {
    console.log('\n🎯 SUCCESS: Generated exactly 975 lesson prompts!');
  } else {
    console.warn(`\n⚠️  WARNING: Generated ${totalPromptsGenerated} prompts (expected 975)`);
  }
}

/**
 * Calculate how many lessons fall in each month
 */
function calculateMonthlyDistribution(allPrompts: Record<string, LessonPrompt[]>): Record<string, number> {
  const distribution: Record<string, number> = {};
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', '', '', 'September', 'October', 'November', 'December'];
  
  for (const prompts of Object.values(allPrompts)) {
    for (const prompt of prompts) {
      const monthName = monthNames[prompt.month];
      if (monthName) {
        distribution[monthName] = (distribution[monthName] || 0) + 1;
      }
    }
  }
  
  return distribution;
}

// Run the generator
generateAllPrompts().catch(console.error);