#!/usr/bin/env node

/**
 * ETFO Best Practices Library
 * Actual standards that agents MUST review and enforce
 */

const ETFO_BEST_PRACTICES = {
  /**
   * SIMPLIFIED TEACHING PRINCIPLES
   * Based on critical evaluation: Simplicity > Sophistication
   */
  simplifiedPrinciples: {
    core: {
      philosophy: 'Support teacher thinking, not replace it',
      maxDecisionPoints: 3,
      rationale: 'Teachers cannot track 16+ requirements while teaching 25 six-year-olds'
    },
    timeStructure: {
      approach: 'Flexible brackets, not rigid minutes',
      opening: '5-10 minutes',
      main: '20-30 minutes', 
      closing: '5-10 minutes',
      rationale: 'Real teaching adapts to student needs in the moment'
    },
    differentiation: {
      approach: 'Responsive mindset, not predetermined lists',
      principle: 'Pay attention and respond',
      examples: [
        'Some students may need visual supports → Use pictures',
        'Some students may need movement → Let them move',
        'Some students may need privacy → Honor that'
      ],
      rationale: 'Every "failure" is data about student needs'
    }
  },

  /**
   * MANDATORY REVIEW CHECKLIST
   * Agents must verify EVERY item
   */
  mandatoryChecklist: [
    {
      id: 'SIMP-1',
      category: 'Simplicity',
      requirement: 'Maximum 3 decision points per lesson',
      rationale: 'Teacher cognitive capacity in real classrooms',
      verification: 'Count decision points, not requirements',
      consequence: 'SIMPLIFY if more than 3'
    },
    {
      id: 'SIMP-2', 
      category: 'Learning Goal',
      requirement: 'ONE clear learning goal per lesson',
      rationale: 'If they get this one thing, the lesson succeeded',
      verification: 'Check for single, assessable goal',
      consequence: 'SIMPLIFY if multiple goals'
    },
    {
      id: 'SIMP-3',
      category: 'Flexibility',
      requirement: 'Built-in adaptation points, not scripts',
      rationale: 'True adaptivity cannot be predetermined',
      verification: 'Check for "if-then" teacher thinking support',
      consequence: 'REVISE if too scripted'
    },
    {
      id: 'FR-1',
      category: 'French Language',
      requirement: 'Learning goal in student-friendly language',
      rationale: 'Grade 1 comprehension level',
      verification: 'Check for simple, concrete language',
      consequence: 'SIMPLIFY if too complex'
    },
    {
      id: 'SUBJ-1',
      category: 'Subject Integrity',
      requirement: 'Activities match subject pedagogy',
      rationale: 'Subject-specific learning approaches',
      verification: 'Check activities align with subject',
      consequence: 'REVISE if misaligned'
    }
  ],

  /**
   * Grade 1 Developmental Standards
   */
  grade1Standards: {
    attention: {
      maximum: 8,
      rule: 'Age + 2 minutes',
      implication: 'No activity longer than 8-9 minutes'
    },
    cognition: {
      stage: 'Concrete operational',
      requirements: [
        'Use physical manipulatives',
        'Avoid abstract concepts',
        'Connect to real experiences',
        'Visual supports essential'
      ]
    },
    language: {
      frenchImmersion: 'Early production to speech emergence',
      vocabulary: '8-10 new words maximum per lesson',
      production: 'Single words to simple sentences',
      support: 'Heavy scaffolding with visuals and gestures'
    },
    social: {
      needs: [
        'Peer interaction every 10 minutes',
        'Structured collaboration',
        'Clear roles in group work',
        'Adult guidance for conflict'
      ]
    },
    physical: {
      needs: [
        'Movement every 10 minutes',
        'Fine motor practice daily',
        'Gross motor activities',
        'Brain breaks between activities'
      ]
    }
  },

  /**
   * Subject-Specific Non-Negotiables
   */
  subjectRequirements: {
    'Français (Immersion)': {
      mustHave: [
        'Centres de littératie',
        'Cercle de lecture',
        'Atelier d\'écriture',
        'Communication orale'
      ],
      mustNotHave: [],
      pedagogy: 'Balanced literacy with oral priority'
    },
    'Mathématiques': {
      mustHave: [
        'Matériel concret',
        'Représentation visuelle',
        'Résolution de problèmes',
        'Stations mathématiques'
      ],
      mustNotHave: [
        'Centres de littératie',
        'Cercle de lecture',
        'Atelier d\'écriture'
      ],
      pedagogy: 'Concrete-Pictorial-Abstract progression'
    },
    'Sciences de la nature': {
      mustHave: [
        'Investigation',
        'Observation',
        'Documentation',
        'Expérience pratique'
      ],
      mustNotHave: [
        'Centres de littératie',
        'Lecture guidée'
      ],
      pedagogy: 'Inquiry-based hands-on exploration'
    },
    'Sciences humaines': {
      mustHave: [
        'Exploration culturelle',
        'Cartes et globes',
        'Artéfacts',
        'Communauté'
      ],
      mustNotHave: [
        'Centres de littératie'
      ],
      pedagogy: 'Community and identity focus'
    },
    'Arts visuels': {
      mustHave: [
        'Processus créatif',
        'Exploration des médias',
        'Expression personnelle',
        'Stations d\'art'
      ],
      mustNotHave: [
        'Centres de littératie',
        'Lecture'
      ],
      pedagogy: 'Process over product'
    },
    'Formation personnelle et sociale': {
      mustHave: [
        'Activité physique',
        'Jeux coopératifs',
        'Bien-être',
        'Stations de mouvement'
      ],
      mustNotHave: [
        'Centres de littératie',
        'Lecture assise prolongée'
      ],
      pedagogy: 'Active participation and wellness'
    }
  },

  /**
   * Quality Indicators
   */
  qualityIndicators: {
    excellent: {
      score: 95,
      criteria: [
        'All mandatory items verified',
        'Developmentally perfect for Grade 1',
        'Subject pedagogy exemplary',
        'Differentiation specific and actionable',
        'Clear skill progression',
        'Engaging and varied activities'
      ]
    },
    acceptable: {
      score: 85,
      criteria: [
        'All mandatory items verified',
        'Mostly appropriate for Grade 1',
        'Subject pedagogy correct',
        'Differentiation present',
        'Some progression evident'
      ]
    },
    unacceptable: {
      score: 0,
      criteria: [
        'ANY mandatory item failed',
        'Developmentally inappropriate',
        'Wrong subject pedagogy',
        'Generic differentiation',
        'No clear progression'
      ]
    }
  },

  /**
   * Assessment Requirements
   */
  assessmentStandards: {
    diagnostic: {
      when: 'Lessons 1-2',
      purpose: 'Determine starting points',
      methods: ['Observation', 'Conversation', 'Simple tasks']
    },
    formative: {
      when: 'All lessons',
      purpose: 'Guide instruction',
      methods: ['Exit tickets', 'Thumbs up/down', 'Mini conferences', 'Observations']
    },
    summative: {
      when: 'Final lessons',
      purpose: 'Evaluate achievement',
      methods: ['Performance task', 'Portfolio', 'Demonstration']
    }
  },

  /**
   * UNIT PROGRESSION PRINCIPLES
   * Critical for generating coherent units, not isolated lessons
   */
  unitProgressionPrinciples: {
    philosophy: 'Units tell a learning story with clear progression',
    structure: {
      beginning: {
        lessons: '1-25% of unit',
        focus: 'Activation & Exploration',
        characteristics: [
          'Activate prior knowledge',
          'Introduce key vocabulary gradually',
          'Build safety and comfort',
          'Heavy scaffolding and support',
          'Concrete, hands-on exploration'
        ]
      },
      middle: {
        lessons: '26-75% of unit',
        focus: 'Development & Practice',
        characteristics: [
          'Gradual release of responsibility',
          'Multiple practice opportunities',
          'Increasing complexity',
          'Peer collaboration grows',
          'Building toward independence'
        ]
      },
      end: {
        lessons: '76-100% of unit',
        focus: 'Application & Consolidation',
        characteristics: [
          'Student demonstration of learning',
          'Creative application',
          'Self-assessment opportunities',
          'Celebration of growth',
          'Transfer to new contexts'
        ]
      }
    },
    coherenceRequirements: [
      'Each lesson builds on previous learning',
      'Vocabulary spirals and reinforces',
      'Skills develop incrementally',
      'Assessment aligns with progression',
      'Clear through-line connects all lessons'
    ],
    avoidanceList: [
      'Random topic jumping',
      'Isolated lesson planning',
      'Identical lesson structures',
      'Sudden complexity spikes',
      'Disconnected assessments'
    ]
  },

  /**
   * Progression Requirements
   */
  progressionStandards: {
    phases: [
      {
        lessons: '1-5',
        focus: 'Introduction/Exploration',
        keywords: ['découverte', 'exploration', 'introduction'],
        complexity: 'Simple, concrete, heavily scaffolded'
      },
      {
        lessons: '6-10',
        focus: 'Skill Building',
        keywords: ['pratique', 'développement', 'construction'],
        complexity: 'Gradual release of responsibility'
      },
      {
        lessons: '11-15',
        focus: 'Application',
        keywords: ['application', 'création', 'autonomie'],
        complexity: 'More independent practice'
      },
      {
        lessons: '16+',
        focus: 'Consolidation',
        keywords: ['consolidation', 'synthèse', 'réflexion'],
        complexity: 'Integration and transfer'
      }
    ]
  }
};

/**
 * Generate unit generation prompt for agents
 */
function generateUnitGenerationPrompt(unitPlan, lrp, expectations) {
  const subject = unitPlan.subject;
  const subjectReqs = ETFO_BEST_PRACTICES.subjectRequirements[subject];
  const totalLessons = unitPlan.numberOfLessons;
  
  return `
You are generating ALL ${totalLessons} lessons for this COMPLETE UNIT.

UNIT CONTEXT:
- Title: ${unitPlan.title}
- Subject: ${subject}
- Duration: ${unitPlan.numberOfLessons} lessons (${unitPlan.totalHours} hours)
- Big Ideas: ${unitPlan.bigIdeas}
- Essential Questions: ${unitPlan.essentialQuestions}

CRITICAL: SIMPLIFIED APPROACH
1. Each lesson has ONE clear learning goal
2. Maximum 3 decision points per lesson
3. Focus on teacher thinking support, not scripts
4. Flexibility over rigid timing

UNIT PROGRESSION MAP:
${generateProgressionMap(totalLessons)}

SUBJECT PEDAGOGY for ${subject}:
- Core Approach: ${subjectReqs.pedagogy}
- Must Include: ${subjectReqs.mustHave.join(', ')}
- Must Avoid: ${subjectReqs.mustNotHave.join(', ') || 'None'}

GRADE 1 REALITIES:
- Attention span: 7-8 minutes max
- Need movement every 10 minutes
- Concrete materials essential
- French immersion: heavy scaffolding needed
- Vocabulary: 3-5 new words per lesson max

GENERATE ALL ${totalLessons} LESSONS WITH:
1. Clear progression from lesson to lesson
2. Vocabulary that builds and spirals
3. Skills that develop incrementally
4. Increasing independence over time
5. Authentic assessment opportunities

REMEMBER: Support teacher thinking, don't replace it.
`;
}

/**
 * Generate review prompt for agents
 */
function generateBestPracticesReviewPrompt(subject, lessonNumber, totalLessons) {
  const subjectReqs = ETFO_BEST_PRACTICES.subjectRequirements[subject];
  const phase = getProgressionPhase(lessonNumber, totalLessons);
  
  return `
REVIEW CHECKLIST for Lesson ${lessonNumber}/${totalLessons}:

1. SIMPLICITY:
   □ ONE clear learning goal
   □ Maximum 3 decision points
   □ Teacher thinking support, not scripts

2. PROGRESSION:
   Phase: ${phase.focus}
   This means: ${phase.complexity}

3. SUBJECT INTEGRITY for ${subject}:
   Pedagogy: ${subjectReqs.pedagogy}
   Activities align with subject approach

4. GRADE 1 APPROPRIATENESS:
   □ 7-8 minute attention spans respected
   □ Movement opportunities included
   □ Concrete materials used
   □ 3-5 new vocabulary words max

5. FLEXIBILITY:
   □ If-then decision points included
   □ Adaptation options provided
   □ Not overly scripted

VERIFY: Does this lesson support real teaching?
`;
}

/**
 * Generate progression map for unit
 */
function generateProgressionMap(totalLessons) {
  const map = [];
  const phases = ETFO_BEST_PRACTICES.unitProgressionPrinciples.structure;
  
  const beginEnd = Math.ceil(totalLessons * 0.25);
  const middleEnd = Math.ceil(totalLessons * 0.75);
  
  map.push(`Lessons 1-${beginEnd}: ${phases.beginning.focus}`);
  map.push(`  - Activate prior knowledge, introduce vocabulary`);
  map.push(`  - Build safety and comfort with heavy scaffolding`);
  
  map.push(`\nLessons ${beginEnd + 1}-${middleEnd}: ${phases.middle.focus}`);
  map.push(`  - Gradual release, increasing complexity`);
  map.push(`  - Multiple practice opportunities with peer collaboration`);
  
  map.push(`\nLessons ${middleEnd + 1}-${totalLessons}: ${phases.end.focus}`);
  map.push(`  - Student demonstration and creative application`);
  map.push(`  - Self-assessment and celebration of growth`);
  
  return map.join('\n');
}

/**
 * Get progression phase for lesson
 */
function getProgressionPhase(lessonNumber, totalLessons) {
  const ratio = lessonNumber / totalLessons;
  const phases = ETFO_BEST_PRACTICES.unitProgressionPrinciples.structure;
  
  if (ratio <= 0.25) {
    return {
      focus: phases.beginning.focus,
      complexity: phases.beginning.characteristics[0]
    };
  } else if (ratio <= 0.75) {
    return {
      focus: phases.middle.focus,
      complexity: phases.middle.characteristics[0]
    };
  } else {
    return {
      focus: phases.end.focus,
      complexity: phases.end.characteristics[0]
    };
  }
}

/**
 * Verify lesson against mandatory checklist
 */
function verifyAgainstChecklist(lesson, subject) {
  const failures = [];
  const checklist = ETFO_BEST_PRACTICES.mandatoryChecklist;
  
  // Check each mandatory item
  for (const item of checklist) {
    let passed = false;
    
    switch (item.id) {
      case 'ETFO-1':
        passed = lesson.mindsOn?.duration === 8;
        break;
      case 'ETFO-2':
        passed = lesson.action?.duration === 27;
        break;
      case 'ETFO-3':
        passed = lesson.consolidation?.duration === 10;
        break;
      case 'DIFF-1':
        const allStrats = [
          ...(lesson.action?.differentiation?.forStruggling || []),
          ...(lesson.action?.differentiation?.forAdvanced || []),
          ...(lesson.action?.differentiation?.forELL || []),
          ...(lesson.action?.differentiation?.forIEP || [])
        ];
        passed = new Set(allStrats).size === 16;
        break;
      case 'DIFF-2':
        const diff = lesson.action?.differentiation;
        passed = diff?.forStruggling?.length === 4 &&
                 diff?.forAdvanced?.length === 4 &&
                 diff?.forELL?.length === 4 &&
                 diff?.forIEP?.length === 4;
        break;
      case 'FR-1':
        passed = lesson.learningGoals?.startsWith('Nous');
        break;
      case 'FR-2':
        passed = lesson.successCriteria?.every(c => c.startsWith('Je peux'));
        break;
      case 'SUBJ-1':
        if (subject !== 'Français (Immersion)') {
          const lessonText = JSON.stringify(lesson).toLowerCase();
          passed = !lessonText.includes('centres de littératie');
        } else {
          passed = true;
        }
        break;
    }
    
    if (!passed) {
      failures.push({
        id: item.id,
        requirement: item.requirement,
        consequence: item.consequence,
        rationale: item.rationale
      });
    }
  }
  
  return {
    passed: failures.length === 0,
    failures,
    score: failures.length === 0 ? 100 : 0
  };
}

module.exports = {
  ETFO_BEST_PRACTICES,
  generateUnitGenerationPrompt,
  generateBestPracticesReviewPrompt,
  generateProgressionMap,
  getProgressionPhase,
  verifyAgainstChecklist
};