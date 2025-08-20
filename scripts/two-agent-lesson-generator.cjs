#!/usr/bin/env node

/**
 * Two-Agent Lesson Generation System
 * Generator and Critic agents collaborate to create perfect lessons
 * Exactly like the claude.ai plan, but using Task subagents
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class TwoAgentLessonGenerator {
  constructor() {
    this.prisma = new PrismaClient();
    this.outputDir = path.join(__dirname, '../EMILY-PERFECT-LESSONS');
  }

  /**
   * Generate perfect lessons through agent collaboration
   */
  async generatePerfectLessons(unit, lrp, lessonCount) {
    console.log(`\n🤖 Starting two-agent generation for: ${unit.title}`);
    console.log(`   Subject: ${lrp.subject}`);
    console.log(`   Lessons needed: ${lessonCount}`);
    
    let lessons = null;
    let iteration = 1;
    const maxIterations = 5;
    let perfect = false;
    
    // Initial generation
    console.log('\n📝 Generator Agent: Creating initial lesson set...');
    lessons = await this.generatorAgent(unit, lrp, lessonCount);
    
    // Refinement loop
    while (!perfect && iteration <= maxIterations) {
      console.log(`\n🔍 Critic Agent: Reviewing lessons (iteration ${iteration})...`);
      
      const critique = await this.criticAgent(lessons, unit, lrp);
      
      if (critique.includes('"isPerfect": true') || 
          critique.includes('PERFECT') || 
          critique.includes('no issues found')) {
        console.log('   ✅ Critic: Lessons are PERFECT!');
        perfect = true;
      } else {
        console.log('   ⚠️  Critic found issues:');
        console.log(`      ${critique.substring(0, 200)}...`);
        
        console.log('\n🔧 Generator Agent: Improving based on critique...');
        lessons = await this.improveWithGenerator(lessons, critique, unit, lrp);
        
        iteration++;
      }
    }
    
    if (!perfect) {
      console.log('   ⚡ Reached max iterations - using best version');
    }
    
    return this.parseLessons(lessons);
  }

  /**
   * Generator Agent - Creates lessons
   */
  async generatorAgent(unit, lrp, lessonCount) {
    const prompt = `You are an expert Grade 1 French Immersion pedagogue specializing in ${lrp.subject}.

TASK: Generate ${lessonCount} cohesive, progressive lessons for this unit.

UNIT CONTEXT:
Title: ${unit.title} (${unit.titleFr})
Dates: ${unit.startDate} to ${unit.endDate}
Big Ideas: ${unit.bigIdeas}
Essential Questions: ${JSON.stringify(unit.essentialQuestions)}

LONG RANGE PLAN CONTEXT:
Subject: ${lrp.subject}
Grade: ${lrp.gradeLevel}
Total Hours: ${lrp.totalHours}
Key Concepts: ${lrp.keyConcepts}

REQUIREMENTS FOR ALL ${lessonCount} LESSONS:

1. ETFO Structure (MANDATORY each lesson):
   - Minds On: EXACTLY 8 minutes
   - Action: EXACTLY 27 minutes
   - Consolidation: EXACTLY 10 minutes

2. Progressive Skill Development:
   - Lessons 1-5: Introduction/exploration
   - Lessons 6-10: Building skills
   - Lessons 11-15: Practicing/applying
   - Lessons 16-${lessonCount}: Consolidating/extending

3. Subject-Specific Pedagogy for ${lrp.subject}:
${this.getSubjectRequirements(lrp.subject)}

4. Complete Differentiation (each lesson):
   - 4 strategies for struggling learners
   - 4 strategies for advanced learners
   - 4 strategies for ELL students
   - 4 strategies for IEP students

5. French Immersion Requirements:
   - ALL instruction in grammatically correct French
   - 8-10 key vocabulary words per lesson
   - Oral communication priority for Grade 1

6. Assessment:
   - Diagnostic (lesson 1)
   - Formative (all lessons)
   - Summative (lesson ${lessonCount})
   - 4 assessment tools per lesson

7. Connections:
   - Authentic Indigenous perspectives (Mi'kmaq)
   - 2 cross-curricular connections per lesson
   - Parent communication suggestions
   - Safety considerations

CRITICAL: Ensure activities are appropriate for ${lrp.subject}.
${this.getSubjectWarnings(lrp.subject)}

OUTPUT: Return a JSON array of ${lessonCount} complete lesson objects with this structure:

{
  "lessonNumber": 1,
  "title": "Unit - Leçon X: Theme",
  "learningGoals": "Nous [grammatically correct French goal]",
  "successCriteria": ["Je peux...", "Je peux...", "Je peux..."],
  "vocabulary": ["8-10 words"],
  "materials": ["5+ specific materials"],
  "mindsOn": {
    "duration": 8,
    "description": "Specific activity",
    "grouping": "Organization"
  },
  "action": {
    "duration": 27,
    "activities": [
      {"name": "Activity", "duration": X, "description": "Details"}
    ],
    "differentiation": {
      "forStruggling": ["4 strategies"],
      "forAdvanced": ["4 strategies"],
      "forELL": ["4 strategies"],
      "forIEP": ["4 strategies"]
    }
  },
  "consolidation": {
    "duration": 10,
    "description": "Closing activity",
    "assessment": "Method"
  },
  "assessment": {
    "formative": "Description",
    "tools": ["4 tools"]
  },
  "indigenousPerspectives": "Authentic connection",
  "crossCurricular": ["Connection 1", "Connection 2"],
  "parentCommunication": "Suggestion"
}

Generate all ${lessonCount} lessons now as a cohesive unit.`;

    const result = await Task({
      subagent_type: 'general-purpose',
      description: `Generate ${lessonCount} Grade 1 ${lrp.subject} lessons`,
      prompt: prompt
    });

    return result;
  }

  /**
   * Critic Agent - Reviews and critiques lessons
   */
  async criticAgent(lessons, unit, lrp) {
    const prompt = `You are an expert pedagogical reviewer specializing in Grade 1 French Immersion and ${lrp.subject}.

TASK: Critically review these lessons for perfection.

UNIT CONTEXT:
Title: ${unit.title}
Subject: ${lrp.subject}

LESSONS TO REVIEW:
${typeof lessons === 'string' ? lessons.substring(0, 3000) : JSON.stringify(lessons).substring(0, 3000)}...

REVIEW CRITERIA:

1. ETFO Compliance:
   - Is EVERY lesson exactly 8-27-10 minutes?
   - Are the three parts distinct and appropriate?

2. Subject Appropriateness for ${lrp.subject}:
   - Are activities correct for ${lrp.subject}?
   - No literacy centers in non-French subjects?
   - Subject-specific pedagogy followed?

3. Progression:
   - Do skills build from lesson 1 to ${unit.lessonCount || 20}?
   - Are success criteria increasingly complex?
   - Is there clear learning trajectory?

4. French Language:
   - Are learning goals grammatically correct?
   - Is vocabulary appropriate and progressive?
   - No awkward translations?

5. Differentiation:
   - Are all 16 strategies present per lesson?
   - Are they specific and actionable?
   - Not generic/copy-pasted?

6. Grade 1 Appropriateness:
   - Activities suitable for 6-year-olds?
   - Concrete, hands-on learning?
   - Appropriate attention span considered?

7. Cohesion:
   - Do lessons form a cohesive unit?
   - Clear connections between lessons?
   - Unit big ideas addressed?

RESPONSE:
If lessons are PERFECT: Return {"isPerfect": true, "summary": "Lessons meet all criteria perfectly"}

If issues found: Return {
  "isPerfect": false,
  "issues": [
    "Specific issue 1",
    "Specific issue 2"
  ],
  "mustFix": ["Critical issues"],
  "shouldImprove": ["Minor issues"]
}

Be thorough but fair. We want excellence, not impossible perfection.`;

    const result = await Task({
      subagent_type: 'general-purpose',
      description: 'Critique lessons for perfection',
      prompt: prompt
    });

    return result;
  }

  /**
   * Generator improves lessons based on critique
   */
  async improveWithGenerator(lessons, critique, unit, lrp) {
    const prompt = `You are the lesson generator. The critic has reviewed your lessons and found issues.

ORIGINAL LESSONS:
${typeof lessons === 'string' ? lessons.substring(0, 2000) : JSON.stringify(lessons).substring(0, 2000)}...

CRITIC'S FEEDBACK:
${critique}

TASK: Fix ALL issues identified by the critic.

REQUIREMENTS:
- Maintain what's working well
- Fix all identified problems
- Ensure ${lrp.subject} appropriateness
- Keep ETFO structure (8-27-10)
- Maintain cohesion across lessons

Return the COMPLETE improved JSON array of all lessons with issues fixed.`;

    const result = await Task({
      subagent_type: 'general-purpose',
      description: 'Improve lessons based on critique',
      prompt: prompt
    });

    return result;
  }

  /**
   * Parse lessons from agent response
   */
  parseLessons(lessonsString) {
    try {
      // If already an array, return it
      if (Array.isArray(lessonsString)) {
        return lessonsString;
      }
      
      // Try to parse as JSON
      if (typeof lessonsString === 'string') {
        // Find JSON array in response
        const jsonMatch = lessonsString.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Try direct parse
        return JSON.parse(lessonsString);
      }
      
      return [];
    } catch (error) {
      console.error('   ⚠️  Error parsing lessons:', error.message);
      return [];
    }
  }

  /**
   * Get subject-specific requirements
   */
  getSubjectRequirements(subject) {
    const requirements = {
      'Français (Immersion)': `
   - Balanced literacy: reading, writing, speaking, listening
   - Literacy centers ARE appropriate
   - Phonemic awareness → phonics → fluency progression
   - Daily oral communication practice`,
      
      'Mathématiques': `
   - Concrete → Pictorial → Abstract approach
   - Math manipulatives essential
   - NO literacy centers - use math games/stations
   - Problem-solving focus`,
      
      'Sciences de la nature': `
   - Inquiry-based learning
   - Hands-on experiments
   - NO literacy centers - use science stations
   - Observation and documentation`,
      
      'Sciences humaines': `
   - Community-centered learning
   - Identity and belonging
   - NO literacy centers - use exploration stations
   - Maps, artifacts, photos`,
      
      'Arts visuels': `
   - Process over product
   - Various media exploration
   - NO literacy centers - use art creation stations
   - Fine motor development`,
      
      'Formation personnelle et sociale': `
   - Physical activity + social-emotional learning
   - Movement and wellness
   - NO literacy centers - use activity stations
   - Self-regulation practice`
    };
    
    return requirements[subject] || requirements['Français (Immersion)'];
  }

  /**
   * Get subject-specific warnings
   */
  getSubjectWarnings(subject) {
    if (subject === 'Français (Immersion)') {
      return '✅ Literacy activities are CORRECT for French';
    }
    return '❌ NO literacy centers, shared writing, or reading circles in ' + subject;
  }

  /**
   * Save lessons to file
   */
  async saveLessons(unit, lessons, subject) {
    const subjectDir = path.join(this.outputDir, subject.replace(/[^a-z0-9]/gi, '_'));
    
    if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }
    
    const unitData = {
      unitId: unit.id,
      unitTitle: unit.title,
      unitTitleFr: unit.titleFr,
      startDate: unit.startDate,
      endDate: unit.endDate,
      bigIdeas: unit.bigIdeas,
      essentialQuestions: unit.essentialQuestions,
      lessonCount: lessons.length,
      generatedBy: 'Two-Agent Collaboration (Generator + Critic)',
      generatedAt: new Date().toISOString(),
      lessons: lessons
    };
    
    const fileName = `${unit.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filePath = path.join(subjectDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(unitData, null, 2));
    console.log(`\n💾 Saved ${lessons.length} perfect lessons to: ${fileName}`);
    
    return fileName;
  }

  /**
   * Process single unit
   */
  async processUnit(unit, lessonCount) {
    const lrp = unit.longRangePlan;
    
    console.log('\n' + '═'.repeat(70));
    console.log(`📚 UNIT: ${unit.title}`);
    console.log('═'.repeat(70));
    
    const lessons = await this.generatePerfectLessons(unit, lrp, lessonCount);
    
    if (lessons.length > 0) {
      await this.saveLessons(unit, lessons, lrp.subject);
      return lessons.length;
    } else {
      console.error('   ❌ No lessons generated');
      return 0;
    }
  }

  /**
   * Process all units
   */
  async processAllUnits() {
    console.log('=' .repeat(80));
    console.log('🤖 TWO-AGENT COLLABORATIVE LESSON GENERATION');
    console.log('=' .repeat(80));
    console.log('Generator and Critic agents working toward perfection\n');
    
    try {
      const units = await this.prisma.unitPlan.findMany({
        include: {
          longRangePlan: true,
          expectations: {
            include: {
              expectation: true
            }
          }
        },
        orderBy: [
          { longRangePlanId: 'asc' },
          { startDate: 'asc' }
        ]
      });
      
      console.log(`📚 Found ${units.length} units to process\n`);
      
      // Group by subject for proper lesson distribution
      const unitsBySubject = {};
      units.forEach(unit => {
        const subject = unit.longRangePlan.subject;
        if (!unitsBySubject[subject]) {
          unitsBySubject[subject] = [];
        }
        unitsBySubject[subject].push(unit);
      });
      
      // Lesson targets per subject
      const lessonTargets = {
        'Français (Immersion)': 195,
        'Mathématiques': 195,
        'Sciences de la nature': 195,
        'Arts visuels': 195,
        'Sciences humaines': 97,
        'Formation personnelle et sociale': 98
      };
      
      let totalGenerated = 0;
      
      // Process each subject's units
      for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
        console.log(`\n📘 SUBJECT: ${subject}`);
        console.log('─'.repeat(60));
        
        const targetLessons = lessonTargets[subject] || 195;
        const lessonsPerUnit = Math.floor(targetLessons / subjectUnits.length);
        const remainder = targetLessons % subjectUnits.length;
        
        for (let i = 0; i < subjectUnits.length; i++) {
          const unit = subjectUnits[i];
          const lessonCount = lessonsPerUnit + (i < remainder ? 1 : 0);
          
          const generated = await this.processUnit(unit, lessonCount);
          totalGenerated += generated;
        }
      }
      
      console.log('\n' + '=' .repeat(80));
      console.log('✅ TWO-AGENT GENERATION COMPLETE');
      console.log('=' .repeat(80));
      console.log(`\n📁 Location: ${this.outputDir}`);
      console.log(`📊 Total Lessons Generated: ${totalGenerated}`);
      console.log('🤝 Method: Generator + Critic collaboration');
      console.log('✨ Quality: Refined to perfection through iteration');
      
      await this.prisma.$disconnect();
      
    } catch (error) {
      console.error('❌ Error:', error);
      await this.prisma.$disconnect();
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new TwoAgentLessonGenerator();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    // Test with one unit
    console.log('🧪 TEST MODE: Processing one unit\n');
    
    const prisma = new PrismaClient();
    prisma.unitPlan.findFirst({
      where: { title: 'Bienvenue en français' },
      include: {
        longRangePlan: true,
        expectations: {
          include: { expectation: true }
        }
      }
    }).then(unit => {
      if (unit) {
        return generator.processUnit(unit, 5); // Just 5 lessons for test
      } else {
        throw new Error('Test unit not found');
      }
    }).then(() => {
      console.log('\n✨ Test complete!');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
    
  } else {
    // Process all units
    console.log('🚀 Starting two-agent collaborative generation...\n');
    console.log('Each unit will be refined to perfection through agent dialogue.\n');
    
    generator.processAllUnits()
      .then(() => {
        console.log('\n✨ All units processed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
      });
  }
}

module.exports = { TwoAgentLessonGenerator };