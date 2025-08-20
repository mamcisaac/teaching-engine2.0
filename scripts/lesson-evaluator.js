/**
 * Lesson Evaluator
 * Intelligent evaluation of lesson quality and ETFO compliance
 */

/**
 * Evaluate if lesson progression is pedagogically sound
 */
function evaluateLessonProgression(overview, unit) {
  const issues = [];
  
  // Check if expectations are properly distributed
  const expectationBalance = checkExpectationBalance(overview, unit);
  if (!expectationBalance.balanced) {
    issues.push(expectationBalance.issue);
  }
  
  // Check for appropriate cognitive progression
  const cognitiveProgression = checkCognitiveProgression(overview);
  if (!cognitiveProgression.appropriate) {
    issues.push(cognitiveProgression.issue);
  }
  
  // Check for variety in instructional approaches
  const instructionalVariety = checkInstructionalVariety(overview);
  if (!instructionalVariety.sufficient) {
    issues.push(instructionalVariety.issue);
  }
  
  // Check culminating task preparation
  const culminatingPrep = checkCulminatingPreparation(overview, unit);
  if (!culminatingPrep.adequate) {
    issues.push(culminatingPrep.issue);
  }
  
  if (issues.length === 0) {
    return { approved: true };
  }
  
  return {
    approved: false,
    feedback: issues.join(' Additionally, '),
    issues: issues
  };
}

/**
 * Check if expectations are balanced across lessons
 */
function checkExpectationBalance(overview, unit) {
  if (!unit.expectations || unit.expectations.length < 2) {
    return { balanced: true }; // Single expectation units are auto-balanced
  }
  
  const lessonCount = overview.lessonCount || 20;
  const expectations = unit.expectations.map(e => e.expectation.code);
  
  // Count how many lessons focus on each expectation
  const coverage = {};
  for (const exp of expectations) {
    coverage[exp] = 0;
  }
  
  // Parse overview to see expectation distribution
  if (overview.lessonTitles) {
    for (const lesson of overview.lessonTitles) {
      for (const exp of expectations) {
        if (lesson.content?.includes(exp)) {
          coverage[exp]++;
        }
      }
    }
  }
  
  // Check if any expectation is under-represented
  const minCoverage = Math.floor(lessonCount * 0.3); // At least 30% coverage
  
  for (const [exp, count] of Object.entries(coverage)) {
    if (count < minCoverage) {
      return {
        balanced: false,
        issue: `Expectation ${exp} appears underrepresented. Please ensure it's covered in at least ${minCoverage} lessons`
      };
    }
  }
  
  return { balanced: true };
}

/**
 * Check for appropriate cognitive progression (concrete to abstract)
 */
function checkCognitiveProgression(overview) {
  const earlyLessons = overview.lessonTitles?.slice(0, 5) || [];
  const lateLessons = overview.lessonTitles?.slice(-5) || [];
  
  // Early lessons should emphasize concrete/manipulative work
  const concreteKeywords = ['manipulat', 'concrete', 'hands-on', 'physical', 'object', 'material'];
  const abstractKeywords = ['abstract', 'mental', 'symbolic', 'represent', 'concept'];
  
  let earlyConcrete = 0;
  let earlyAbstract = 0;
  
  for (const lesson of earlyLessons) {
    const content = lesson.content?.toLowerCase() || '';
    if (concreteKeywords.some(k => content.includes(k))) earlyConcrete++;
    if (abstractKeywords.some(k => content.includes(k))) earlyAbstract++;
  }
  
  // Grade 1 should be heavily concrete in early lessons
  if (earlyAbstract > earlyConcrete) {
    return {
      appropriate: false,
      issue: 'Early lessons appear too abstract for Grade 1. Please emphasize concrete manipulatives and hands-on learning in lessons 1-5'
    };
  }
  
  return { appropriate: true };
}

/**
 * Check for variety in instructional approaches
 */
function checkInstructionalVariety(overview) {
  const approaches = new Set();
  const approachKeywords = {
    'game': 'games',
    'partner': 'collaboration',
    'explore': 'exploration',
    'practice': 'practice',
    'create': 'creation',
    'problem': 'problem-solving',
    'discuss': 'discussion',
    'demonstrat': 'demonstration',
    'investiga': 'investigation',
    'model': 'modeling'
  };
  
  if (overview.lessonTitles) {
    for (const lesson of overview.lessonTitles) {
      const content = lesson.content?.toLowerCase() || '';
      for (const [keyword, approach] of Object.entries(approachKeywords)) {
        if (content.includes(keyword)) {
          approaches.add(approach);
        }
      }
    }
  }
  
  // Should have at least 5 different approaches across the unit
  if (approaches.size < 5) {
    return {
      sufficient: false,
      issue: `Limited instructional variety detected (only ${approaches.size} approaches). Please include more diverse activities like games, partner work, investigations, and creative tasks`
    };
  }
  
  return { sufficient: true };
}

/**
 * Check if culminating task is properly prepared
 */
function checkCulminatingPreparation(overview, unit) {
  if (!unit.culminatingTask) {
    return { adequate: true }; // No culminating task to prepare for
  }
  
  const lastLessons = overview.lessonTitles?.slice(-3) || [];
  const culminatingKeywords = ['culminat', 'final', 'demonstrat', 'present', 'show', 'share', 'celebrat'];
  
  let preparationFound = false;
  
  for (const lesson of lastLessons) {
    const content = lesson.content?.toLowerCase() || '';
    if (culminatingKeywords.some(k => content.includes(k))) {
      preparationFound = true;
      break;
    }
  }
  
  if (!preparationFound) {
    return {
      adequate: false,
      issue: 'The final lessons should explicitly prepare for the culminating task. Please revise lessons 18-20 to include culminating task preparation'
    };
  }
  
  return { adequate: true };
}

/**
 * Validate ETFO compliance for individual lesson
 */
function validateETFOCompliance(lesson) {
  const requiredComponents = {
    'title': lesson.title,
    'objectives': lesson.objectives || lesson.learningGoals,
    'mindsOn': lesson.mindsOn || lesson.introduction,
    'action': lesson.action || lesson.mainActivity,
    'consolidation': lesson.consolidation || lesson.closing,
    'assessment': lesson.assessment,
    'differentiation': lesson.differentiation,
    'materials': lesson.materials,
    'vocabulary': lesson.vocabulary
  };
  
  const missing = [];
  
  for (const [component, value] of Object.entries(requiredComponents)) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missing.push(component);
    }
  }
  
  // Check time allocations
  const timeCheck = validateTimeAllocations(lesson);
  if (!timeCheck.valid) {
    missing.push('proper time allocation');
  }
  
  return {
    complete: missing.length === 0,
    missing: missing,
    components: requiredComponents
  };
}

/**
 * Validate time allocations match ETFO requirements
 */
function validateTimeAllocations(lesson) {
  const required = {
    mindsOn: 8,
    action: 27,
    consolidation: 10
  };
  
  const actual = {
    mindsOn: lesson.mindsOn?.duration || 0,
    action: lesson.action?.duration || 0,
    consolidation: lesson.consolidation?.duration || 0
  };
  
  const total = actual.mindsOn + actual.action + actual.consolidation;
  
  if (total !== 45) {
    return {
      valid: false,
      issue: `Total time is ${total} minutes, should be 45`
    };
  }
  
  // Allow 2-minute flexibility for each component
  for (const [component, time] of Object.entries(required)) {
    if (Math.abs(actual[component] - time) > 2) {
      return {
        valid: false,
        issue: `${component} is ${actual[component]} minutes, should be ~${time}`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check developmental appropriateness for Grade 1
 */
function checkDevelopmentalAppropriateness(lesson) {
  const inappropriate = [];
  
  // Check for overly complex vocabulary
  const complexTerms = ['abstract', 'theoretical', 'hypothesis', 'analyze', 'synthesize'];
  const lessonText = JSON.stringify(lesson).toLowerCase();
  
  for (const term of complexTerms) {
    if (lessonText.includes(term)) {
      inappropriate.push(`Term "${term}" may be too complex for Grade 1`);
    }
  }
  
  // Check for appropriate activity duration
  if (lesson.action?.activities) {
    for (const activity of lesson.action.activities) {
      if (activity.duration > 10) {
        inappropriate.push(`Activity "${activity.name}" is ${activity.duration} minutes - too long for Grade 1 attention span`);
      }
    }
  }
  
  // Check for movement and hands-on learning
  const hasMovement = lessonText.includes('move') || lessonText.includes('physical') || lessonText.includes('stand');
  const hasManipulatives = lessonText.includes('manipulat') || lessonText.includes('hands-on') || lessonText.includes('touch');
  
  if (!hasMovement) {
    inappropriate.push('Grade 1 lessons should include movement activities');
  }
  
  if (!hasManipulatives) {
    inappropriate.push('Grade 1 lessons should include hands-on manipulation');
  }
  
  return {
    appropriate: inappropriate.length === 0,
    issues: inappropriate
  };
}

/**
 * Evaluate safety considerations
 */
function evaluateSafetyConsiderations(lesson, subject) {
  const safetyRequired = ['Sciences', 'Arts visuels', 'Éducation physique'];
  
  if (!safetyRequired.some(s => subject.includes(s))) {
    return { adequate: true }; // Safety not critical for this subject
  }
  
  if (!lesson.safety || lesson.safety.length < 10) {
    return {
      adequate: false,
      issue: 'Safety considerations required for this subject'
    };
  }
  
  return { adequate: true };
}

module.exports = {
  evaluateLessonProgression,
  validateETFOCompliance,
  checkDevelopmentalAppropriateness,
  evaluateSafetyConsiderations,
  checkExpectationBalance,
  checkCognitiveProgression,
  checkInstructionalVariety,
  checkCulminatingPreparation,
  validateTimeAllocations
};