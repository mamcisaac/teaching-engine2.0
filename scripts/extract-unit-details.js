#!/usr/bin/env node

/**
 * EXTRACT UNIT DETAILS FROM UNIT PLANS
 * Parses unit plans to extract actual lesson counts and curriculum expectations
 * Handles the varying lesson counts across different subjects
 */

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load data
const unitPlans = require('../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json');
const lrps = require('../backups/perfect-lrps-20250818/perfect-lrps.json');
const curriculumExpectations = require('../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/curriculum-expectations.json');

/**
 * Extract lesson count from unit description
 */
function extractLessonCount(description) {
  if (!description) return null;
  
  // Look for patterns like "20 leçons totales" or "19 leçons totales"
  const match = description.match(/(\d+)\s+leçons?\s+totales?/i);
  if (match) {
    return parseInt(match[1]);
  }
  
  return null;
}

/**
 * Extract core/extension split from description
 */
function extractCoreExtension(description) {
  if (!description) return { core: null, extension: null };
  
  // Look for "Leçons essentielles: 14" and "Leçons d'extension: 6"
  const coreMatch = description.match(/Leçons\s+essentielles:\s*(\d+)/i);
  const extMatch = description.match(/Leçons\s+d'extension:\s*(\d+)/i);
  
  return {
    core: coreMatch ? parseInt(coreMatch[1]) : null,
    extension: extMatch ? parseInt(extMatch[1]) : null
  };
}

/**
 * Calculate lessons from hours if not explicitly stated
 */
function calculateLessonsFromHours(hours) {
  if (!hours) return 20; // Default
  // 45-minute lessons
  return Math.round(hours / 0.75);
}

/**
 * Get subject-specific defaults based on daily schedule
 */
function getSubjectDefaults(subject) {
  const dailySubjects = ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Arts visuels'];
  const alternatingSubjects = ['Sciences humaines', 'Formation personnelle et sociale'];
  
  if (dailySubjects.includes(subject)) {
    // 195 lessons / 10 units = ~19-20 per unit
    return { 
      defaultLessons: 20,
      defaultCore: 14,
      defaultExtension: 6
    };
  } else if (alternatingSubjects.includes(subject)) {
    // 97-98 lessons / 5 units = ~19-20 per unit
    return {
      defaultLessons: 20,
      defaultCore: 14,
      defaultExtension: 6
    };
  }
  
  return {
    defaultLessons: 20,
    defaultCore: 14,
    defaultExtension: 6
  };
}

/**
 * Get curriculum expectations for a unit
 */
function getUnitExpectations(unit, lrp, allExpectations) {
  // Get the LRP's linked expectations
  const lrpExpectations = lrp.expectations || [];
  
  // For now, return a subset relevant to the unit
  // In production, this would be more sophisticated
  const relevantCodes = lrpExpectations.slice(0, 2).map(e => e.expectation.code);
  
  return allExpectations
    .filter(exp => exp.subject === lrp.subject && relevantCodes.includes(exp.code))
    .map(exp => ({
      code: exp.code,
      description: exp.description
    }));
}

async function extractAllUnitDetails() {
  console.log('📊 EXTRACTING UNIT DETAILS FROM PLANS');
  console.log('=' + '='.repeat(50));
  
  const unitDetails = [];
  const subjectTotals = {};
  
  for (const unit of unitPlans) {
    // Find the matching LRP
    const lrp = lrps.lrps.find(l => l.id === unit.longRangePlanId);
    if (!lrp) {
      console.warn(`⚠️ No LRP found for unit: ${unit.title}`);
      continue;
    }
    
    const subject = lrp.subject;
    const defaults = getSubjectDefaults(subject);
    
    // Extract lesson count
    let lessonCount = extractLessonCount(unit.description);
    if (!lessonCount && unit.estimatedHours) {
      lessonCount = calculateLessonsFromHours(unit.estimatedHours);
    }
    if (!lessonCount) {
      lessonCount = defaults.defaultLessons;
    }
    
    // Extract core/extension split
    const { core, extension } = extractCoreExtension(unit.description);
    const coreCount = core || defaults.defaultCore;
    const extensionCount = extension || defaults.defaultExtension;
    
    // Get expectations
    const expectations = getUnitExpectations(unit, lrp, curriculumExpectations);
    
    const unitDetail = {
      id: unit.id,
      title: unit.title,
      subject: subject,
      lessonCount: lessonCount,
      coreCount: coreCount,
      extensionCount: extensionCount,
      startDate: unit.startDate,
      endDate: unit.endDate,
      estimatedHours: unit.estimatedHours || (lessonCount * 0.75),
      bigIdeas: unit.bigIdeas || lrp.bigIdeas || `Explorer ${subject} ensemble`,
      essentialQuestions: unit.essentialQuestions || [
        `Qu'est-ce que ${subject}?`,
        'Comment apprendre ensemble?',
        'Pourquoi est-ce important?'
      ],
      expectations: expectations
    };
    
    unitDetails.push(unitDetail);
    
    // Track totals by subject
    if (!subjectTotals[subject]) {
      subjectTotals[subject] = {
        units: 0,
        lessons: 0
      };
    }
    subjectTotals[subject].units++;
    subjectTotals[subject].lessons += lessonCount;
  }
  
  // Display summary
  console.log('\n📚 SUBJECT TOTALS:');
  let grandTotal = 0;
  for (const [subject, totals] of Object.entries(subjectTotals)) {
    console.log(`${subject}: ${totals.units} units, ${totals.lessons} lessons`);
    grandTotal += totals.lessons;
  }
  console.log(`\n🎯 GRAND TOTAL: ${grandTotal} lessons`);
  
  // Save extracted details
  const outputPath = path.join(__dirname, '..', 'unit-details-extracted.json');
  await fs.writeFile(
    outputPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      totalUnits: unitDetails.length,
      totalLessons: grandTotal,
      subjectTotals: subjectTotals,
      units: unitDetails
    }, null, 2)
  );
  
  console.log(`\n✅ Unit details saved to: unit-details-extracted.json`);
  console.log(`   Total units: ${unitDetails.length}`);
  console.log(`   Total lessons: ${grandTotal}`);
  
  // Check against expected
  const expected = 975;
  if (Math.abs(grandTotal - expected) > 10) {
    console.warn(`\n⚠️ WARNING: Expected ~${expected} lessons, got ${grandTotal}`);
    console.warn('   May need to adjust extraction logic');
  } else {
    console.log(`\n✅ Lesson count validates! (Expected: ${expected}, Got: ${grandTotal})`);
  }
  
  return unitDetails;
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  extractAllUnitDetails().catch(console.error);
}

export { extractAllUnitDetails, extractLessonCount, extractCoreExtension };