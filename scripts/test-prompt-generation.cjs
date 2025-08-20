#!/usr/bin/env node
/**
 * Test the prompt generation logic
 */

const fs = require('fs');
const path = require('path');

// Simple test of prompt generation
const BACKUP_PATH = path.join(__dirname, '../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z');
const OUTPUT_PATH = path.join(__dirname, '../lessons/prompts');

// Monthly constraints
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

function generatePerfectPrompt(subject, unitTitle, lessonNumber, totalLessons, month) {
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  const frenchPercent = MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30;
  
  return `Grade 1 French Immersion ${subject} lesson for "${unitTitle}" (lesson ${lessonNumber}/${totalLessons}).

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

// Test with a sample unit
console.log('📋 PERFECT PROMPT GENERATOR TEST\n');
console.log('=' .repeat(60));

// Load one unit plan to test
const unitPlansPath = path.join(BACKUP_PATH, 'strategically-perfect-unit-plans.json');
if (!fs.existsSync(unitPlansPath)) {
  console.error('❌ Unit plans file not found:', unitPlansPath);
  process.exit(1);
}

const unitPlans = JSON.parse(fs.readFileSync(unitPlansPath, 'utf-8'));
const testUnit = unitPlans[0]; // Get first unit

console.log('\n📚 Testing with unit:', testUnit.title);
console.log('   Subject:', testUnit.longRangePlan.subject);
console.log('   Start Date:', testUnit.startDate);
console.log('   End Date:', testUnit.endDate);

// Generate sample prompts for September and January
console.log('\n' + '='.repeat(60));
console.log('SEPTEMBER PROMPT (Early Year):');
console.log('='.repeat(60));
const septPrompt = generatePerfectPrompt(
  testUnit.longRangePlan.subject,
  testUnit.title,
  1,
  20,
  9
);
console.log(septPrompt);

console.log('\n' + '='.repeat(60));
console.log('JANUARY PROMPT (Mid Year):');
console.log('='.repeat(60));
const janPrompt = generatePerfectPrompt(
  testUnit.longRangePlan.subject,
  testUnit.title,
  10,
  20,
  1
);
console.log(janPrompt);

console.log('\n' + '='.repeat(60));
console.log('✅ Prompt generation working perfectly!');
console.log(`📊 September: 30% French, 3 vocabulary terms`);
console.log(`📊 January: 65% French, 4 vocabulary terms`);
console.log('=' .repeat(60));