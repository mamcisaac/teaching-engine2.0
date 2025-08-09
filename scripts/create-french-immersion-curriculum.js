#!/usr/bin/env node

/**
 * Create French Immersion-Specific Curriculum Database for PEI Grade 1
 * 
 * This script creates a proper French immersion curriculum database,
 * removing English stream content and organizing by language of instruction.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load current curriculum
const curriculumPath = path.join(__dirname, '..', 'curriculum', 'PEI_GRADE1_COMPLETE_CURRICULUM.json');
const currentData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

console.log('🔍 Analyzing French Immersion Curriculum...\n');

// Separate subjects by language of instruction
const frenchInstructionSubjects = [
  'Français langue première',
  'Mathématiques',
  'Sciences de la nature',
  'Sciences', // Will be standardized to Sciences de la nature
  'Sciences humaines',
  'Études sociales',
  'Arts visuels',
  'Formation personnelle et sociale' // This is health/wellness in French
];

const englishInstructionSubjects = [
  'Physical Education', // Often taught in English even in French immersion
  'English Language Arts' // Not typically in Grade 1 French immersion
];

const duplicateHealthSubjects = [
  'Health Education' // This is English stream - FPS is the French immersion equivalent
];

// Filter and categorize expectations
const frenchExpectations = [];
const englishExpectations = [];
const duplicates = [];

for (const exp of currentData.expectations) {
  // Standardize subject names
  if (exp.subject === 'Sciences') {
    exp.subject = 'Sciences de la nature';
  }
  if (exp.subject === 'Sciences humaines') {
    exp.subject = 'Études sociales';
  }
  
  if (duplicateHealthSubjects.includes(exp.subject)) {
    duplicates.push(exp);
  } else if (frenchInstructionSubjects.includes(exp.subject)) {
    frenchExpectations.push(exp);
  } else if (englishInstructionSubjects.includes(exp.subject)) {
    englishExpectations.push(exp);
  } else {
    console.log(`⚠️ Unknown subject classification: ${exp.subject}`);
    englishExpectations.push(exp);
  }
}

// Count by subject
const countBySubject = (expectations) => {
  const counts = {};
  for (const exp of expectations) {
    counts[exp.subject] = (counts[exp.subject] || 0) + 1;
  }
  return counts;
};

const frenchCounts = countBySubject(frenchExpectations);
const englishCounts = countBySubject(englishExpectations);
const duplicateCounts = countBySubject(duplicates);

// Identify gaps in French curriculum
const expectedCounts = {
  'Français langue première': { min: 15, max: 20, actual: frenchCounts['Français langue première'] || 0 },
  'Mathématiques': { min: 20, max: 30, actual: frenchCounts['Mathématiques'] || 0 },
  'Sciences de la nature': { min: 10, max: 15, actual: frenchCounts['Sciences de la nature'] || 0 },
  'Études sociales': { min: 10, max: 15, actual: frenchCounts['Études sociales'] || 0 },
  'Arts visuels': { min: 8, max: 12, actual: frenchCounts['Arts visuels'] || 0 },
  'Formation personnelle et sociale': { min: 8, max: 12, actual: frenchCounts['Formation personnelle et sociale'] || 0 }
};

// Create French Immersion specific database
const frenchImmersionCurriculum = {
  metadata: {
    title: "PEI Grade 1 French Immersion Curriculum",
    program: "French Immersion",
    grade: 1,
    province: "Prince Edward Island",
    extractionDate: new Date().toISOString(),
    version: "3.0.0",
    language_distribution: {
      instruction_in_french: Object.keys(frenchCounts),
      instruction_in_english: Object.keys(englishCounts),
      excluded_english_stream: Object.keys(duplicateCounts)
    }
  },
  statistics: {
    total_expectations: frenchExpectations.length + englishExpectations.length,
    french_instruction: frenchExpectations.length,
    english_instruction: englishExpectations.length,
    excluded_duplicates: duplicates.length,
    by_subject: {
      french_instruction: frenchCounts,
      english_instruction: englishCounts
    }
  },
  curriculum_gaps: {},
  french_instruction: {
    description: "Subjects taught in French for French Immersion students",
    expectations: frenchExpectations
  },
  english_instruction: {
    description: "Subjects taught in English for French Immersion students",
    note: "Physical Education is often taught in English even in French Immersion programs",
    expectations: englishExpectations
  },
  excluded_english_stream: {
    description: "English stream content not applicable to French Immersion",
    note: "Health Education (W-1.x) is replaced by Formation personnelle et sociale in French Immersion",
    count: duplicates.length,
    codes: duplicates.map(e => e.code)
  }
};

// Add gap analysis
for (const [subject, data] of Object.entries(expectedCounts)) {
  if (data.actual < data.min) {
    frenchImmersionCurriculum.curriculum_gaps[subject] = {
      expected_minimum: data.min,
      expected_maximum: data.max,
      actual: data.actual,
      missing: data.min - data.actual,
      status: "INCOMPLETE",
      recommendation: `Need to extract ${data.min - data.actual} to ${data.max - data.actual} more expectations`
    };
  }
}

// Save French Immersion curriculum
const outputPath = path.join(__dirname, '..', 'curriculum', 'FRENCH_IMMERSION_GRADE1_CURRICULUM.json');
fs.writeFileSync(outputPath, JSON.stringify(frenchImmersionCurriculum, null, 2));

// Print analysis
console.log('📊 French Immersion Curriculum Analysis\n');
console.log('='.repeat(60));
console.log('FRENCH INSTRUCTION SUBJECTS (Taught in French)');
console.log('='.repeat(60));
for (const [subject, count] of Object.entries(frenchCounts)) {
  const expected = expectedCounts[subject];
  const status = expected && expected.actual < expected.min ? '❌ INCOMPLETE' : '✅';
  console.log(`${status} ${subject}: ${count} expectations`);
  if (expected && expected.actual < expected.min) {
    console.log(`   ⚠️ Missing: ${expected.min - expected.actual} to ${expected.max - expected.actual} expectations`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('ENGLISH INSTRUCTION SUBJECTS (Taught in English)');
console.log('='.repeat(60));
for (const [subject, count] of Object.entries(englishCounts)) {
  console.log(`✅ ${subject}: ${count} expectations`);
}

console.log('\n' + '='.repeat(60));
console.log('EXCLUDED ENGLISH STREAM CONTENT');
console.log('='.repeat(60));
console.log(`❌ Health Education: ${duplicateCounts['Health Education'] || 0} expectations (REMOVED)`);
console.log('   Note: French Immersion uses "Formation personnelle et sociale" instead');

console.log('\n' + '='.repeat(60));
console.log('CRITICAL GAPS IN FRENCH IMMERSION CURRICULUM');
console.log('='.repeat(60));
const gaps = Object.entries(frenchImmersionCurriculum.curriculum_gaps);
if (gaps.length > 0) {
  for (const [subject, gap] of gaps) {
    console.log(`\n❌ ${subject}:`);
    console.log(`   Current: ${gap.actual} expectations`);
    console.log(`   Expected: ${gap.expected_minimum}-${gap.expected_maximum} expectations`);
    console.log(`   Missing: ${gap.missing} expectations minimum`);
  }
} else {
  console.log('✅ No gaps identified');
}

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Total French Immersion Expectations: ${frenchExpectations.length + englishExpectations.length}`);
console.log(`  - Taught in French: ${frenchExpectations.length}`);
console.log(`  - Taught in English: ${englishExpectations.length}`);
console.log(`  - Excluded (English stream): ${duplicates.length}`);

console.log('\n✅ French Immersion curriculum saved to:');
console.log(`   curriculum/FRENCH_IMMERSION_GRADE1_CURRICULUM.json`);

console.log('\n⚠️ IMPORTANT NOTES FOR EMILY:');
console.log('1. Mathematics curriculum is INCOMPLETE (only 3/20+ expectations)');
console.log('2. Sciences curriculum is INCOMPLETE (only 5/10+ expectations)');
console.log('3. Health Education has been REMOVED (use Formation personnelle et sociale)');
console.log('4. Physical Education may be taught in English (verify with school)');
console.log('5. English Language Arts not typically started in Grade 1 French Immersion');

// Create Emily-specific file
const emilysCurriculum = {
  metadata: {
    teacher: "Emily",
    grade: 1,
    program: "French Immersion",
    school_year: "2024-2025",
    note: "This curriculum is specifically for French Immersion Grade 1, not English stream"
  },
  subjects_you_teach_in_french: frenchCounts,
  subjects_possibly_in_english: englishCounts,
  your_curriculum: frenchExpectations.concat(englishExpectations),
  total_expectations: frenchExpectations.length + englishExpectations.length,
  important_notes: [
    "Mathematics needs more expectations (only 3 found, expecting 20-30)",
    "Sciences needs more expectations (only 5 found, expecting 10-15)",
    "Health Education (W-1.x) has been excluded - use Formation personnelle et sociale instead",
    "Verify if Physical Education is taught in English at your school"
  ]
};

const emilyPath = path.join(__dirname, '..', 'curriculum', 'EMILY_GRADE1_FRENCH_IMMERSION.json');
fs.writeFileSync(emilyPath, JSON.stringify(emilysCurriculum, null, 2));

console.log('\n✅ Emily-specific curriculum saved to:');
console.log('   curriculum/EMILY_GRADE1_FRENCH_IMMERSION.json');