/**
 * ✅ POSITIVE PATTERNS FOR AI GENERATION
 * Examples of excellent Grade 1 French Immersion practices
 * AI should emulate these patterns
 */

export interface PositivePattern {
  category: string;
  pattern: string;
  example: string;
  rationale: string;
}

export const EXCELLENT_GRADE1_PATTERNS: PositivePattern[] = [
  // ENGAGEMENT PATTERNS
  {
    category: 'engagement',
    pattern: 'Mystery Box Introduction',
    example: 'Place objects related to lesson in a decorated box, reveal one at a time',
    rationale: 'Creates curiosity, maintains attention, provides visual support'
  },
  {
    category: 'engagement',
    pattern: 'Puppet Teacher',
    example: 'Puppet only speaks French, makes mistakes students can correct',
    rationale: 'Reduces anxiety, encourages risk-taking, makes errors acceptable'
  },
  {
    category: 'engagement',
    pattern: 'Real-World Connection',
    example: 'Count lunch boxes, sort by color, graph results',
    rationale: 'Uses familiar objects, makes learning relevant, integrates subjects'
  },
  
  // INSTRUCTION PATTERNS
  {
    category: 'instruction',
    pattern: 'I Do, We Do, You Do',
    example: 'Teacher models, class practices together, students try with partner',
    rationale: 'Gradual release of responsibility, builds confidence'
  },
  {
    category: 'instruction',
    pattern: 'Think-Pair-Share (Grade 1 version)',
    example: 'Think quietly (5 seconds), tell partner, share one idea',
    rationale: 'Gives processing time, reduces anxiety, ensures participation'
  },
  {
    category: 'instruction',
    pattern: 'Visual Schedule',
    example: 'Pictures showing lesson steps on board',
    rationale: 'Reduces anxiety, supports organization, helps transitions'
  },
  
  // VOCABULARY PATTERNS
  {
    category: 'vocabulary',
    pattern: 'Word + Gesture + Object',
    example: 'Say "rouge", show red apple, make circle gesture',
    rationale: 'Multi-sensory learning, supports different learning styles'
  },
  {
    category: 'vocabulary',
    pattern: 'Vocabulary Routine',
    example: 'Mon mot, ton mot, notre mot (my word, your word, our word)',
    rationale: 'Repetition without boredom, builds community, practices pronunciation'
  },
  {
    category: 'vocabulary',
    pattern: 'Living Word Wall',
    example: 'Students draw pictures for new words, add to wall',
    rationale: 'Student ownership, visual reference, celebrates learning'
  },
  
  // ASSESSMENT PATTERNS
  {
    category: 'assessment',
    pattern: 'Thumbs Up/Middle/Down',
    example: 'Show understanding with thumb position',
    rationale: 'Quick, non-threatening, immediate feedback'
  },
  {
    category: 'assessment',
    pattern: 'Exit Ticket Drawing',
    example: 'Draw one thing you learned today',
    rationale: 'Non-verbal option, concrete evidence, respects developmental stage'
  },
  {
    category: 'assessment',
    pattern: 'Partner Check',
    example: 'Tell your partner the three new words',
    rationale: 'Peer support, oral practice, low pressure'
  },
  
  // DIFFERENTIATION PATTERNS
  {
    category: 'differentiation',
    pattern: 'Choice Board',
    example: 'Draw it, build it, or act it out',
    rationale: 'Multiple intelligences, student agency, same objective different paths'
  },
  {
    category: 'differentiation',
    pattern: 'Tiered Questioning',
    example: 'What color? What colors? Why did you choose those colors?',
    rationale: 'All students can participate, natural differentiation'
  },
  {
    category: 'differentiation',
    pattern: 'Flexible Grouping',
    example: 'Sometimes by ability, sometimes by interest, sometimes random',
    rationale: 'Prevents labeling, builds different skills, maintains engagement'
  },
  
  // TRANSITION PATTERNS
  {
    category: 'transition',
    pattern: 'Transition Song',
    example: 'Specific song for cleanup, different song for carpet time',
    rationale: 'Clear signal, predictable routine, makes transitions fun'
  },
  {
    category: 'transition',
    pattern: 'Magic Number',
    example: 'By the time I count to 10 in French, be ready',
    rationale: 'Practices counting, gives clear timeframe, adds urgency without stress'
  },
  {
    category: 'transition',
    pattern: 'Freeze Dance',
    example: '30 seconds of movement, freeze when music stops',
    rationale: 'Releases energy, practices self-control, fun reset'
  },
  
  // BEHAVIOR SUPPORT PATTERNS
  {
    category: 'behavior',
    pattern: 'Positive Narration',
    example: 'I see Maya sitting quietly, I see Chen with his book ready',
    rationale: 'Reinforces desired behavior, non-punitive, clear expectations'
  },
  {
    category: 'behavior',
    pattern: 'Brain Break Menu',
    example: 'Choose: stretches, deep breaths, or wall push-ups',
    rationale: 'Proactive energy management, student choice, prevents disruption'
  },
  {
    category: 'behavior',
    pattern: 'Silent Signal',
    example: 'Hand on head when ready, finger on nose when you hear the word',
    rationale: 'Non-disruptive checking, keeps lesson flow, includes everyone'
  },
  
  // FRENCH IMMERSION PATTERNS
  {
    category: 'french-immersion',
    pattern: 'French Sandwich',
    example: 'French instruction → English clarification → French practice',
    rationale: 'Ensures comprehension, maintains French exposure, reduces anxiety'
  },
  {
    category: 'french-immersion',
    pattern: 'Cognate Celebration',
    example: 'Celebrate when French and English words are similar',
    rationale: 'Builds confidence, makes connections, reduces cognitive load'
  },
  {
    category: 'french-immersion',
    pattern: 'Echo Speaking',
    example: 'Teacher says phrase, students echo with same intonation',
    rationale: 'Safe practice, builds pronunciation, fun and engaging'
  },
  
  // INDIGENOUS INTEGRATION PATTERNS
  {
    category: 'indigenous',
    pattern: 'Land Acknowledgment Routine',
    example: 'Daily acknowledgment in simple language, connect to lesson',
    rationale: 'Normalizes Indigenous presence, builds respect, authentic integration'
  },
  {
    category: 'indigenous',
    pattern: 'Seasonal Teaching',
    example: 'Connect lesson to Mi\'kmaq seasonal calendar',
    rationale: 'Different knowledge system, environmental connection, cultural respect'
  },
  {
    category: 'indigenous',
    pattern: 'Circle Pedagogy',
    example: 'Sit in circle for sharing, everyone can see everyone',
    rationale: 'Indigenous teaching method, builds community, equality'
  },
  
  // SAFETY PATTERNS
  {
    category: 'safety',
    pattern: 'Safety Check Song',
    example: 'Sing material safety rules before using',
    rationale: 'Makes safety fun, ensures everyone hears, becomes routine'
  },
  {
    category: 'safety',
    pattern: 'Partner Safety',
    example: 'Safety buddy watches and helps',
    rationale: 'Peer support, shared responsibility, builds community'
  },
  {
    category: 'safety',
    pattern: 'Visual Safety Rules',
    example: 'Pictures showing safe scissor holding, walking feet',
    rationale: 'Constant reminder, language-free understanding, clear expectations'
  }
];

// Sentence starters that work for Grade 1
export const GRADE1_SENTENCE_STARTERS = {
  instructions: [
    "Regardez..." // Look at...
    "Écoutez..." // Listen to...
    "Montrez-moi..." // Show me...
    "Trouvez..." // Find...
    "Touchez..." // Touch...
    "Pointez..." // Point to...
    "Levez la main si..." // Raise your hand if...
    "Mettez votre doigt sur..." // Put your finger on...
  ],
  
  praise: [
    "Bravo!", 
    "Excellent!",
    "Super!",
    "Magnifique!",
    "Fantastique!",
    "J'aime ça!", // I like that!
    "Bon travail!", // Good work!
    "C'est ça!", // That's it!
  ],
  
  transitions: [
    "Maintenant..." // Now...
    "Ensuite..." // Next...
    "Quand je dis 'go'..." // When I say go...
    "À trois..." // On three...
    "Doucement..." // Gently...
    "Ensemble..." // Together...
  ],
  
  questions: [
    "Qu'est-ce que c'est?" // What is it?
    "Où est...?" // Where is...?
    "Combien?" // How many?
    "Quelle couleur?" // What color?
    "Qui peut...?" // Who can...?
    "Est-ce que...?" // Is it...?
  ]
};

// Activity duration recommendations by time of day
export const ACTIVITY_DURATION_GUIDE = {
  morning: {
    mindsOn: 10,
    action: 30,
    consolidation: 5
  },
  afterRecess: {
    mindsOn: 12, // Longer to calm down
    action: 25, // Shorter due to energy
    consolidation: 8 // More reflection time
  },
  beforeLunch: {
    mindsOn: 8, // Quick, they're hungry
    action: 27,
    consolidation: 10 // Include cleanup time
  },
  afterLunch: {
    mindsOn: 15, // Wake them up
    action: 25, // Gentle activities
    consolidation: 5
  },
  endOfDay: {
    mindsOn: 5, // Quick
    action: 30, // Active/engaging
    consolidation: 10 // Include cleanup and pack up
  }
};

// Materials that are ALWAYS appropriate for Grade 1
export const SAFE_MATERIALS = [
  'crayons', 'washable markers', 'pencils', 'erasers',
  'glue sticks', 'safety scissors', 'construction paper',
  'white paper', 'play dough', 'large beads', 'yarn',
  'unifix cubes', 'pattern blocks', 'counting bears',
  'dice', 'number cards', 'letter cards', 'books',
  'puppets', 'felt pieces', 'magnetic letters/numbers',
  'whiteboards', 'dry erase markers', 'stamps', 'stickers'
];

// Common mistakes AI makes and how to fix them
export const AI_CORRECTION_GUIDE = [
  {
    mistake: 'Using "discuss" with Grade 1',
    correction: 'Use "share one idea with your partner"'
  },
  {
    mistake: 'Expecting 10+ minutes of independent work',
    correction: 'Break into 3-5 minute chunks with check-ins'
  },
  {
    mistake: 'Complex multi-step instructions',
    correction: 'One instruction at a time, with visual support'
  },
  {
    mistake: 'Abstract concepts without concrete examples',
    correction: 'Always start with manipulatives or real objects'
  },
  {
    mistake: 'Assuming reading ability',
    correction: 'Use pictures, symbols, and oral instructions'
  },
  {
    mistake: 'Forgetting movement breaks',
    correction: 'Add 30-60 second movement every 10 minutes'
  },
  {
    mistake: 'Using worksheets as main activity',
    correction: 'Hands-on exploration first, record learning after'
  },
  {
    mistake: 'Expecting perfect French production',
    correction: 'Accept gestures, single words, and attempts'
  },
  {
    mistake: 'Group sharing with whole class',
    correction: 'Share with partner or table group first'
  },
  {
    mistake: 'Not providing wait time',
    correction: 'Count to 5 in your head after asking questions'
  }
];