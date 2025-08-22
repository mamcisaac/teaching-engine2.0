#!/usr/bin/env node

/**
 * PERFECT UNIT GENERATION SYSTEM
 * Using simplified pedagogy and real teacher support
 */

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { ETFO_BEST_PRACTICES, generateUnitGenerationPrompt } = require('./knowledge/best-practices-library.cjs');

// Load unit data based on command line argument
const unitType = process.argv[2] || 'french';
let unitData;

switch(unitType) {
  case 'temp':
    unitData = require('../temp-unit-data.json');
    break;
  case 'math':
    unitData = require('../test-math-unit-data.json');
    break;
  case 'science':
    unitData = require('../test-science-unit-data.json');
    break;
  case 'french':
  default:
    unitData = require('../packages/database/test-unit-data.json');
    break;
}

console.log(`Loading ${unitType} unit data...`);

// Extract core lesson count from differentiation strategies
function extractCoreCount(diffStrategies) {
  const text = JSON.stringify(diffStrategies);
  const match = text.match(/(\d+)\s*(essentielles|core|principales)/i);
  return match ? parseInt(match[1]) : null;
}

async function generatePerfectUnit() {
  console.log('🎯 PERFECT UNIT GENERATION SYSTEM');
  console.log('==================================');
  console.log('Unit:', unitData.unitPlan.title);
  console.log('Subject:', unitData.subject);
  
  // Extract lesson count from unit plan
  const totalHours = unitData.unitPlan.estimatedHours || 15;
  const totalLessons = Math.round(totalHours / 0.75); // 45 min lessons
  
  // Extract core/extension split from differentiation strategies
  const diffStrategies = unitData.unitPlan.differentiationStrategies || {};
  const coreCount = extractCoreCount(diffStrategies) || Math.floor(totalLessons * 0.7);
  const extensionCount = totalLessons - coreCount;
  
  console.log(`Lessons to generate: ${totalLessons} (${coreCount} core, ${extensionCount} extension)`);
  console.log('\nPrinciples:');
  console.log('- ONE clear goal per lesson');
  console.log('- Maximum 3 decision points');
  console.log('- Teacher thinking support, not scripts');
  console.log('- Real progression across unit');
  
  // Create agent prompts
  const designAgentPrompt = `
You are the Design Agent for Grade 1 ${unitData.subject}.

CRITICAL CONTEXT:
- This is for Emily McIsaac's Grade 1 French Immersion classroom
- Students are 6-7 years old with 7-8 minute attention spans
- ${unitData.subject === 'Français (Immersion)' ? 'This is their FIRST exposure to French (silent period expected)' : 'All instruction in French'}
- Heavy scaffolding and visual support essential

YOUR TASK: Create the progression map for ALL ${totalLessons} lessons in this unit.
- Lessons 1-${coreCount}: CORE (must cover all expectations)
- Lessons ${coreCount + 1}-${totalLessons}: EXTENSIONS (practice only)

UNIT DATA:
${JSON.stringify(unitData, null, 2)}

SIMPLIFIED APPROACH (MANDATORY):
1. Each lesson has ONE clear learning goal
2. Maximum 3 decision points per lesson (not 16 requirements)
3. Support teacher thinking, don't script everything
4. Acknowledge what can't be predetermined
5. EXPLICITLY connect each lesson: "Builds on Lesson X by..."

PROGRESSION REQUIREMENTS:
Lessons 1-${Math.floor(coreCount * 0.3)}: Activation & Exploration
- Activate prior knowledge
- Introduce key vocabulary gradually
- Build safety and comfort
- Heavy scaffolding, visuals, gestures

Lessons ${Math.floor(coreCount * 0.3) + 1}-${Math.floor(coreCount * 0.8)}: Development & Practice  
- Gradual release of responsibility
- Vocabulary spirals and reinforces
- Peer interaction increases
- Still heavily supported

Lessons ${Math.floor(coreCount * 0.8) + 1}-${coreCount}: Complete Coverage
- Ensure ALL curriculum expectations met
- Assessment opportunities
- Students demonstrate learning

Lessons ${coreCount + 1}-${totalLessons}: Extensions (Practice Only)
- NO new curriculum content
- Creative applications
- Additional practice
- Support and enrichment

GENERATE:
A JSON array of ${totalLessons} lesson outlines, each with:
{
  "lessonNumber": 1-20,
  "title": "Simple French title",
  "oneGoal": "The ONE thing students will learn",
  "keyVocabulary": ["3 words MAXIMUM - spread curriculum terms across lessons"],
  "decisionPoints": [
    "How are students feeling today?",
    "What support level needed?",
    "Learning style adjustment needed?"
  ],
  "progression": "Explicitly: Builds on Lesson X by...",
  "realWorldConnection": "How this applies in daily life"
}

Remember: This is about supporting real teachers with real 6-year-olds learning French for the first time.
`;

  const teachingAgentPrompt = `
You are the Teaching Agent for Grade 1 French Immersion.

CRITICAL CONTEXT:
- Students are 6-7 years old
- First exposure to French
- 7-8 minute attention spans
- Need movement every 10 minutes
- Concrete materials essential

YOUR TASK: Transform the design into 20 complete lessons.

LESSON STRUCTURE (Simplified):
1. Opening (~8 min): Start with connection to previous lesson
2. Main Activity (~27 min): Core learning with flexibility
3. Closing (~10 min): Simple consolidation

For each lesson provide:
- The ONE clear goal
- 3 decision points with if-then guidance
- Simple activities (not scripts)
- What to do when things go wrong
- Materials needed (keep minimal)

VOCABULARY GUIDANCE:
- MAXIMUM 3 new words per lesson (even if curriculum has more)
- Use curriculum terms for alignment but spread across lessons
- Teach using simplified language
- Example: "reconnaître" → teach as "voir"
- Include diverse family structures when relevant

VISUAL SUPPORTS (MANDATORY):
- Every activity needs visual/gestural support
- Include TPR (Total Physical Response)
- Provide non-verbal comprehension options

AVOID:
- Over-complicating timing (keep ~X min)
- 16 differentiation strategies
- Scripts and predetermined paths
- Fake precision

INCLUDE:
- Explicit connection to previous lesson
- Real-world applications (How do people use this daily?)
- Teacher thinking support
- Flexibility for real classrooms
- Focus on relationship over compliance
- Learning style considerations in decision points

Generate lessons that a substitute could use with 30 minutes notice.
`;

  const criticAgentPrompt = `
You are the Critic Agent evaluating unit coherence.

EVALUATE BASED ON:

1. SIMPLICITY (40% of score)
- Does each lesson have ONE clear goal?
- Are there only 3 decision points (not 16)?
- Is it usable by a substitute teacher?

2. PROGRESSION (30% of score)
- Do lessons build on each other?
- Does vocabulary spiral and reinforce?
- Is there clear growth from lesson 1 to 20?

3. AUTHENTICITY (30% of score)
- Does it support teacher thinking?
- Is flexibility built in?
- Does it acknowledge unpredictability?

REJECT if:
- Overcomplicated with too many requirements
- No clear progression through unit
- Too scripted without flexibility
- Fake sophistication over real utility

SCORE: 0-100%
Provide specific feedback for improvement.

Remember: Simple and useful beats sophisticated and overwhelming.
`;

  // Save prompts for agents in pipeline-docs directory
  const pipelineDocsDir = path.join(__dirname, '..', 'pipeline-docs');
  await fs.mkdir(pipelineDocsDir, { recursive: true });
  
  await fs.writeFile(path.join(pipelineDocsDir, 'design-agent-prompt.txt'), designAgentPrompt);
  await fs.writeFile(path.join(pipelineDocsDir, 'teaching-agent-prompt.txt'), teachingAgentPrompt);
  await fs.writeFile(path.join(pipelineDocsDir, 'critic-agent-prompt.txt'), criticAgentPrompt);
  
  console.log('\n✅ Agent prompts created in pipeline-docs/:');
  console.log('   - pipeline-docs/design-agent-prompt.txt');
  console.log('   - pipeline-docs/teaching-agent-prompt.txt');
  console.log('   - pipeline-docs/critic-agent-prompt.txt');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run Design Agent to create progression map');
  console.log('2. Run Teaching Agent to generate lessons');
  console.log('3. Run Critic Agent to evaluate');
  console.log('4. Iterate based on feedback');
  
  console.log('\n💡 Remember: Simplicity > Sophistication');
  console.log('   Support teachers, don\'t replace them.');
}

generatePerfectUnit().catch(console.error);