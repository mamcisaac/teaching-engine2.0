#!/usr/bin/env node

/**
 * GENERATE REAL LESSONS FROM PERFECT UNIT PLANS
 * Uses the perfect JSON data with AI agents to generate actual lessons
 */

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load perfect data
const unitPlans = require('../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json');
const lrps = require('../backups/perfect-lrps-20250818/perfect-lrps.json');
const expectations = require('../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/curriculum-expectations.json');

async function generateLessonForUnit(unitTitle) {
  console.log('\n🎯 GENERATING REAL LESSONS FOR:', unitTitle);
  console.log('=' + '='.repeat(50));
  
  // Find the unit
  const unit = unitPlans.find(u => u.title === unitTitle);
  if (!unit) {
    console.error(`❌ Unit not found: ${unitTitle}`);
    return;
  }
  
  // Find the LRP
  const lrp = lrps.lrps.find(l => l.id === unit.longRangePlanId);
  if (!lrp) {
    console.error(`❌ LRP not found for unit: ${unitTitle}`);
    return;
  }
  
  // Extract lesson count from unit description
  const lessonMatch = unit.description?.match(/(\d+)\s+leçons?\s+totales?/i);
  const totalLessons = lessonMatch ? parseInt(lessonMatch[1]) : 20;
  
  // Extract core/extension split
  const coreMatch = unit.description?.match(/Leçons essentielles:\s*(\d+)/i);
  const coreCount = coreMatch ? parseInt(coreMatch[1]) : 14;
  const extensionCount = totalLessons - coreCount;
  
  console.log(`📊 Unit Details:`);
  console.log(`   Subject: ${lrp.subject}`);
  console.log(`   Lessons: ${totalLessons} (${coreCount} core, ${extensionCount} extension)`);
  console.log(`   Dates: ${unit.startDate} to ${unit.endDate}`);
  
  // Create unit data in the format the pipeline expects
  const unitData = {
    unitPlan: {
      title: unit.title,
      bigIdeas: unit.bigIdeas || lrp.bigIdeas || "Explorer et apprendre ensemble",
      essentialQuestions: unit.essentialQuestions || [
        "Qu'est-ce qu'on apprend?",
        "Comment apprendre ensemble?",
        "Pourquoi est-ce important?"
      ],
      startDate: unit.startDate,
      endDate: unit.endDate,
      estimatedHours: unit.estimatedHours || 15,
      lessonCount: totalLessons,
      coreCount: coreCount,
      extensionCount: extensionCount,
      differentiationStrategies: unit.differentiationStrategies || {
        structure: `${coreCount} leçons essentielles couvrant tous les concepts fondamentaux, ${extensionCount} leçons d'extension pour pratique et enrichissement`
      },
      assessmentPlan: unit.assessmentPlan,
      successCriteria: unit.successCriteria,
      culminatingTask: unit.culminatingTask
    },
    subject: lrp.subject,
    expectations: getRelevantExpectations(lrp.subject)
  };
  
  // Save unit data for pipeline
  const unitDataFile = path.join(__dirname, '..', 'temp-unit-data.json');
  await fs.writeFile(unitDataFile, JSON.stringify(unitData, null, 2));
  
  console.log('\n✅ Unit data prepared for pipeline');
  console.log('   Saved to: temp-unit-data.json');
  
  // Output directory
  const subjectSlug = lrp.subject.toLowerCase().replace(/[^a-z]/g, '-');
  const unitSlug = unit.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const outputDir = path.join(__dirname, '..', 'generated-lessons', subjectSlug);
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('\n📁 Output directory:', outputDir);
  console.log('\n🚀 Ready to run AI pipeline:');
  console.log('   1. Run: node scripts/generate-perfect-unit.js temp');
  console.log('   2. Use Design Agent with design-agent-prompt.txt');
  console.log('   3. Use Teaching Agent with teaching-agent-prompt.txt');
  console.log('   4. Use Critic Agent with critic-agent-prompt.txt');
  console.log(`   5. Save outputs to: ${outputDir}/${unitSlug}-*.json`);
  
  return {
    unit,
    lrp,
    unitData,
    outputDir,
    unitSlug
  };
}

function getRelevantExpectations(subject) {
  // Get a subset of expectations for this subject
  const subjectExpectations = expectations.filter(e => e.subject === subject);
  return subjectExpectations.slice(0, 3).map(e => ({
    code: e.code,
    description: e.description
  }));
}

// If called directly with a unit title
if (process.argv[2]) {
  generateLessonForUnit(process.argv[2])
    .then(result => {
      if (result) {
        console.log('\n✨ Unit preparation complete!');
      }
    })
    .catch(console.error);
} else {
  console.log('Usage: node generate-lesson-from-unit.js "Unit Title"');
  console.log('\nAvailable units:');
  
  // Group by subject
  const bySubject = {};
  unitPlans.forEach(u => {
    const lrp = lrps.lrps.find(l => l.id === u.longRangePlanId);
    if (lrp) {
      if (!bySubject[lrp.subject]) bySubject[lrp.subject] = [];
      bySubject[lrp.subject].push(u.title);
    }
  });
  
  Object.entries(bySubject).forEach(([subject, units]) => {
    console.log(`\n${subject}:`);
    units.forEach(u => console.log(`  - ${u}`));
  });
}

export { generateLessonForUnit };