#!/usr/bin/env node
/**
 * TRULY PERFECT PROMPT GENERATOR
 * Creates prompts that incorporate ALL unit context and build progressively
 */

const fs = require('fs');
const path = require('path');

// Paths
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

/**
 * Get lesson progression context based on position in unit
 */
function getLessonProgression(lessonNumber, totalLessons) {
  const percentage = lessonNumber / totalLessons;
  
  if (percentage <= 0.2) {
    return {
      phase: 'Introduction',
      focus: 'Establish foundational concepts, build vocabulary, create safe learning environment',
      prior: 'This is early in the unit - assume minimal prior knowledge',
      assessment: 'Focus on diagnostic assessment and establishing baselines'
    };
  } else if (percentage <= 0.4) {
    return {
      phase: 'Building',
      focus: 'Develop core skills, expand on foundations, introduce complexity gradually',
      prior: 'Students have basic familiarity with unit concepts',
      assessment: 'Formative assessment to guide instruction'
    };
  } else if (percentage <= 0.6) {
    return {
      phase: 'Deepening',
      focus: 'Apply skills in new contexts, make connections, collaborative learning',
      prior: 'Students have solid understanding of basics',
      assessment: 'Peer and self-assessment become important'
    };
  } else if (percentage <= 0.8) {
    return {
      phase: 'Application',
      focus: 'Independent practice, creative application, problem-solving',
      prior: 'Students ready for independent work',
      assessment: 'Focus on application and transfer'
    };
  } else {
    return {
      phase: 'Consolidation',
      focus: 'Synthesis, reflection, celebration, preparation for culminating task',
      prior: 'Students have mastered unit concepts',
      assessment: 'Summative assessment and portfolio preparation'
    };
  }
}

/**
 * Get seasonal and contextual elements
 */
function getSeasonalContext(month) {
  const contexts = {
    9: {
      season: 'Fall/Autumn',
      context: 'Beginning of school year - establish routines, build classroom community',
      holidays: 'Labour Day, Fall Equinox',
      outdoor: 'Perfect weather for outdoor learning, collecting autumn materials',
      social: 'Focus on making friends, learning names, classroom agreements'
    },
    10: {
      season: 'Fall/Autumn',
      context: 'Routines established, building stamina for learning',
      holidays: 'Thanksgiving, Halloween',
      outdoor: 'Fall leaves, pumpkins, harvest themes',
      social: 'Developing collaboration skills, working in pairs'
    },
    11: {
      season: 'Fall/Autumn',
      context: 'Deeper learning, increased French usage',
      holidays: 'Remembrance Day',
      outdoor: 'Preparing for winter, observing seasonal changes',
      social: 'Small group work becoming possible'
    },
    12: {
      season: 'Winter',
      context: 'Pre-holiday excitement, maintaining focus',
      holidays: 'Christmas, Hanukkah, Winter celebrations',
      outdoor: 'Limited outdoor time, focus on indoor movement',
      social: 'Celebrating diversity, cultural sharing'
    },
    1: {
      season: 'Winter',
      context: 'Fresh start after break, re-establishing routines',
      holidays: 'New Year, Winter activities',
      outdoor: 'Winter science, snow and ice exploration',
      social: 'Setting new goals, renewed focus'
    },
    2: {
      season: 'Winter',
      context: 'Mid-year assessments, solid French foundation',
      holidays: "Valentine's Day, Heritage Day",
      outdoor: 'Winter persists, cabin fever considerations',
      social: 'Friendship and kindness themes'
    },
    3: {
      season: 'Winter/Spring',
      context: 'Increasing independence, complex learning',
      holidays: 'March Break, St. Patrick\'s Day',
      outdoor: 'Signs of spring, maple syrup season',
      social: 'Conflict resolution skills developed'
    },
    4: {
      season: 'Spring',
      context: 'High engagement, optimal learning conditions',
      holidays: 'Easter, Earth Day',
      outdoor: 'Spring growth, planting, life cycles',
      social: 'Community connections, field trips possible'
    },
    5: {
      season: 'Spring',
      context: 'Maintaining momentum, avoiding spring fever',
      holidays: 'Mother\'s Day, Victoria Day',
      outdoor: 'Full outdoor learning opportunities',
      social: 'Leadership skills emerging'
    },
    6: {
      season: 'Summer',
      context: 'Year-end celebrations, transitions, reflection',
      holidays: 'Father\'s Day, National Indigenous Day, End of school',
      outdoor: 'Maximum outdoor time, water play',
      social: 'Celebrating growth, preparing for Grade 2'
    }
  };
  
  return contexts[month] || contexts[9];
}

/**
 * Get subject-specific safety considerations
 */
function getSafetyConsiderations(subject) {
  const safety = {
    'Français (Immersion)': 'Emotional safety during oral presentations, inclusive language practices',
    'Mathématiques': 'Safe handling of manipulatives, organized workspace to prevent trips',
    'Sciences de la nature': 'Safety goggles for experiments, proper handling of materials, hand washing after activities',
    'Arts visuels': 'Scissors safety, non-toxic materials only, smock protection, proper ventilation',
    'Sciences humaines': 'Emotional safety when discussing families, respect for diverse backgrounds',
    'Formation personnelle et sociale': 'Emotional safety paramount, opt-out options for sensitive topics, confidentiality agreements'
  };
  
  return safety[subject] || 'General classroom safety protocols';
}

/**
 * Generate TRULY PERFECT prompt with full context
 */
function generateTrulyPerfectPrompt(unit, lessonNumber, totalLessons, month, curriculumExpectations) {
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  const frenchPercent = MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30;
  const progression = getLessonProgression(lessonNumber, totalLessons);
  const seasonal = getSeasonalContext(month);
  const safety = getSafetyConsiderations(unit.longRangePlan.subject);
  
  // Determine if this is a core or extension lesson
  const isCore = lessonNumber <= Math.floor(totalLessons * 0.7);
  const lessonType = isCore ? 'CORE/ESSENTIAL' : 'EXTENSION/ENRICHMENT';
  
  // Extract culminating task info
  const culminatingInfo = unit.culminatingTask ? 
    `This lesson contributes to: ${unit.culminatingTask.split('\\n')[0]}` : '';
  
  // Select appropriate curriculum expectation
  let curriculumFocus = '';
  if (curriculumExpectations && curriculumExpectations.length > 0) {
    const expectationIndex = (lessonNumber - 1) % curriculumExpectations.length;
    const expectation = curriculumExpectations[expectationIndex];
    curriculumFocus = `Curriculum Expectation ${expectation.code}: ${expectation.description}`;
  }
  
  return `Grade 1 French Immersion - ${unit.longRangePlan.subject}
Unit: "${unit.title}" (Lesson ${lessonNumber}/${totalLessons} - ${lessonType})
${curriculumFocus}

LESSON CONTEXT:
- Unit Phase: ${progression.phase} - ${progression.focus}
- Prior Knowledge: ${progression.prior}
- Season: ${seasonal.season} (${seasonal.context})
- Cultural/Holiday Connections: ${seasonal.holidays}
- Outdoor Opportunities: ${seasonal.outdoor}
- Social Development Focus: ${seasonal.social}
${culminatingInfo}

PRECISE ETFO REQUIREMENTS:
- Duration: 45 minutes EXACTLY
  * Minds On: 8 minutes (engagement, activation, vocabulary introduction)
  * Action: 27 minutes (guided 10min, collaborative 12min, independent 5min)
  * Consolidation: 10 minutes (sharing, self-assessment, preview next lesson)

LANGUAGE REQUIREMENTS (${seasonal.season} progression):
- French Instruction: ${frenchPercent}% (${month === 9 ? 'heavy visual support needed' : month >= 4 ? 'students comfortable with French' : 'building French confidence'})
- New Vocabulary: EXACTLY ${vocabLimit} terms
- Each term MUST include:
  * French word with pronunciation guide
  * English translation
  * Physical gesture or TPR action
  * Visual cue or image reference

MANDATORY ELEMENTS:
1. Movement break (consider ${seasonal.outdoor})
2. Partner/small group work (${seasonal.social})
3. Differentiation for 4 learner profiles
4. Observable assessment with checkboxes
5. Safety protocols: ${safety}

INDIGENOUS PERSPECTIVES (PEI Mi'kmaq):
- Connect to Mi'kmaq culture authentically
- Consider seasonal Mi'kmaq traditions for ${seasonal.season}
- Include land acknowledgment if appropriate
- Minimum 100 characters of meaningful connection

ASSESSMENT FOCUS:
- ${progression.assessment}
- Include student self-assessment appropriate for ${progression.phase} phase
- Observable behaviors checklist
- Portfolio artifact if applicable

DIFFERENTIATION REQUIREMENTS:
Based on ${progression.phase} phase of learning:
1. Support for struggling learners (visual, simplified, peer support)
2. IEP modifications (specify alternatives)
3. ELL support (considering ${frenchPercent}% French environment)
4. Extensions for advanced (leadership, creation, teaching others)

MATERIALS:
- Use standard Grade 1 supplies (crayons, paper, scissors, glue)
- Include manipulatives for kinesthetic learners
- Ensure all materials are safe and accessible
- Consider ${seasonal.season} materials available

SPECIFIC INSTRUCTIONS FOR AI:
Generate a complete, detailed lesson that:
1. Has a bilingual title reflecting the ${progression.phase} phase
2. Includes clear learning objective aligned to ${curriculumFocus || 'unit goals'}
3. Provides exactly ${vocabLimit} vocabulary terms with all requirements
4. Details three-part structure with minute-by-minute breakdown
5. Includes assessment checklist with specific observable behaviors
6. Integrates ${seasonal.holidays} or ${seasonal.season} themes naturally
7. Provides safety reminders for ${safety}
8. Offers authentic Mi'kmaq connection related to ${unit.title}
9. Builds on ${progression.prior}
10. Prepares students for ${culminatingInfo || 'unit culmination'}

Remember: This is lesson ${lessonNumber} of ${totalLessons}, so ${progression.phase === 'Introduction' ? 'introduce concepts gently' : progression.phase === 'Consolidation' ? 'prepare for culminating task' : 'build on previous lessons'}.

Focus on developmentally appropriate, hands-on learning for 6-year-olds in ${seasonal.season}.`;
}

/**
 * Main execution
 */
async function generateAllPrompts() {
  console.log('🚀 Starting TRULY PERFECT prompt generation for 975 lessons...\n');
  
  // Load unit plans
  const unitPlansPath = path.join(BACKUP_PATH, 'strategically-perfect-unit-plans.json');
  const unitPlans = JSON.parse(fs.readFileSync(unitPlansPath, 'utf-8'));
  
  // Load curriculum expectations
  let curriculumData = null;
  if (fs.existsSync(CURRICULUM_PATH)) {
    curriculumData = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
    console.log('✅ Loaded curriculum expectations');
  }
  
  // Generate prompts for each subject
  let totalGenerated = 0;
  const allPrompts = {};
  
  for (const [subject, expectedLessons] of Object.entries(SUBJECT_LESSONS)) {
    console.log(`\n📚 Processing ${subject}...`);
    
    // Get units for this subject
    const subjectUnits = unitPlans.filter(u => u.longRangePlan.subject === subject);
    if (subjectUnits.length === 0) continue;
    
    // Sort by date
    subjectUnits.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    // Calculate lessons per unit
    const lessonsPerUnit = Math.floor(expectedLessons / subjectUnits.length);
    const remainder = expectedLessons % subjectUnits.length;
    
    const subjectPrompts = [];
    
    for (let i = 0; i < subjectUnits.length; i++) {
      const unit = subjectUnits[i];
      const unitLessons = lessonsPerUnit + (i < remainder ? 1 : 0);
      
      console.log(`  📝 Unit "${unit.title}": ${unitLessons} lessons`);
      
      // Get curriculum expectations for this subject
      const expectations = curriculumData?.taught_in_french?.[subject] || [];
      
      // Generate prompts for each lesson in unit
      for (let j = 0; j < unitLessons; j++) {
        const lessonNumber = j + 1;
        
        // Calculate month based on unit timing
        const unitProgress = j / unitLessons;
        const unitStartDate = new Date(unit.startDate);
        const unitEndDate = new Date(unit.endDate);
        const unitDuration = unitEndDate - unitStartDate;
        const lessonDate = new Date(unitStartDate.getTime() + unitDuration * unitProgress);
        const month = lessonDate.getMonth() + 1;
        const schoolMonth = month >= 9 ? month : month <= 6 ? month : 9;
        
        const prompt = generateTrulyPerfectPrompt(
          unit, 
          lessonNumber, 
          unitLessons, 
          schoolMonth,
          expectations
        );
        
        subjectPrompts.push({
          id: `${unit.id}-lesson-${lessonNumber}`,
          subject: subject,
          unitPlanId: unit.id,
          unitTitle: unit.title,
          lessonNumber: lessonNumber,
          totalLessonsInUnit: unitLessons,
          month: schoolMonth,
          lessonType: lessonNumber <= Math.floor(unitLessons * 0.7) ? 'core' : 'extension',
          prompt: prompt
        });
      }
    }
    
    allPrompts[subject] = subjectPrompts;
    totalGenerated += subjectPrompts.length;
    
    // Save to file
    const subjectDir = subject.toLowerCase().replace(/[éèç() ]/g, '-');
    const outputDir = path.join(OUTPUT_PATH, subjectDir);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'prompts.json'),
      JSON.stringify(subjectPrompts, null, 2)
    );
  }
  
  // Save master file
  fs.writeFileSync(
    path.join(OUTPUT_PATH, 'all-prompts-perfect.json'),
    JSON.stringify(allPrompts, null, 2)
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ TRULY PERFECT PROMPT GENERATION COMPLETE!');
  console.log(`📊 Total prompts generated: ${totalGenerated}`);
  console.log(`📁 Saved to: ${OUTPUT_PATH}`);
  console.log('='.repeat(60));
  
  if (totalGenerated === 975) {
    console.log('\n🎯 SUCCESS: Generated exactly 975 PERFECT lesson prompts!');
  } else {
    console.log(`\n⚠️  Generated ${totalGenerated} prompts (expected 975)`);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllPrompts().catch(console.error);
}

module.exports = { generateTrulyPerfectPrompt, getLessonProgression, getSeasonalContext };