#!/usr/bin/env node

/**
 * PERFECT UNIT GENERATION SYSTEM
 * Using simplified pedagogy and real teacher support
 */

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { ETFO_BEST_PRACTICES, generateUnitGenerationPrompt } = require('./knowledge/best-practices-library.cjs');

// Load unit data
const unitData = require('../packages/database/test-unit-data.json');

async function generatePerfectUnit() {
  console.log('🎯 PERFECT UNIT GENERATION SYSTEM');
  console.log('==================================');
  console.log('Unit:', unitData.unitPlan.title);
  console.log('Subject:', unitData.subject);
  console.log('Lessons to generate: 20');
  console.log('\nPrinciples:');
  console.log('- ONE clear goal per lesson');
  console.log('- Maximum 3 decision points');
  console.log('- Teacher thinking support, not scripts');
  console.log('- Real progression across unit');
  
  // Create agent prompts
  const designAgentPrompt = `
You are the Design Agent for Grade 1 French Immersion.

CRITICAL CONTEXT:
- This is for Emily McIsaac's Grade 1 French Immersion classroom
- Students are 6-7 years old with 7-8 minute attention spans
- This is their FIRST exposure to French (silent period expected)
- Heavy scaffolding and visual support essential

YOUR TASK: Create the progression map for ALL 20 lessons in this unit.

UNIT DATA:
${JSON.stringify(unitData, null, 2)}

SIMPLIFIED APPROACH (MANDATORY):
1. Each lesson has ONE clear learning goal
2. Maximum 3 decision points per lesson (not 16 requirements)
3. Support teacher thinking, don't script everything
4. Acknowledge what can't be predetermined

PROGRESSION REQUIREMENTS:
Lessons 1-5: Activation & Exploration
- Activate prior knowledge (they know NO French)
- Introduce 3-5 words per lesson MAX
- Build safety and comfort
- Heavy scaffolding, visuals, gestures

Lessons 6-15: Development & Practice  
- Gradual release of responsibility
- Vocabulary spirals and reinforces
- Peer interaction increases
- Still heavily supported

Lessons 16-20: Application & Consolidation
- Students can use learned vocabulary
- Simple creative expression
- Celebration of growth
- Transfer to new contexts

GENERATE:
A JSON array of 20 lesson outlines, each with:
{
  "lessonNumber": 1-20,
  "title": "Simple French title",
  "oneGoal": "The ONE thing students will learn",
  "keyVocabulary": ["3-5 words max"],
  "decisionPoints": [
    "How are students feeling today?",
    "What support level needed?",
    "Time flexibility needed?"
  ],
  "progression": "How this builds on previous lesson"
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
1. Opening (5-10 min): How to start based on student energy
2. Main Activity (20-30 min): Core learning with flexibility
3. Closing (5-10 min): Simple consolidation

For each lesson provide:
- The ONE clear goal
- 3 decision points with if-then guidance
- Simple activities (not scripts)
- What to do when things go wrong
- Materials needed (keep minimal)

AVOID:
- Rigid timing (8 min, 27 min, 10 min)
- 16 differentiation strategies
- Scripts and predetermined paths
- Fake precision

INCLUDE:
- Teacher thinking support
- Flexibility for real classrooms
- Acknowledgment of unpredictability
- Focus on relationship over compliance

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

  // Save prompts for agents
  await fs.writeFile('design-agent-prompt.txt', designAgentPrompt);
  await fs.writeFile('teaching-agent-prompt.txt', teachingAgentPrompt);
  await fs.writeFile('critic-agent-prompt.txt', criticAgentPrompt);
  
  console.log('\n✅ Agent prompts created:');
  console.log('   - design-agent-prompt.txt');
  console.log('   - teaching-agent-prompt.txt');
  console.log('   - critic-agent-prompt.txt');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run Design Agent to create progression map');
  console.log('2. Run Teaching Agent to generate lessons');
  console.log('3. Run Critic Agent to evaluate');
  console.log('4. Iterate based on feedback');
  
  console.log('\n💡 Remember: Simplicity > Sophistication');
  console.log('   Support teachers, don\'t replace them.');
}

generatePerfectUnit().catch(console.error);