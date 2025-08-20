/**
 * PERFECT PROMPT GENERATOR
 * Balances structure with creativity
 * Prevents hallucination while enabling engaging lessons
 */

import { SubjectType } from './PerfectLessonTemplate';

export function generatePerfectPrompt(
  subject: SubjectType,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number
): string {
  const constraints = getMonthlyConstraints(month);
  const subjectContext = getSubjectContext(subject, lessonNumber, totalLessons);
  const safetyNotes = getSafetyConsiderations(subject);
  
  return `Create a Grade 1 French Immersion ${subject} lesson.

CONTEXT:
Unit: "${unitTitle}" (Lesson ${lessonNumber} of ${totalLessons})
${subjectContext.positioning}

CONSTRAINTS:
• Language: ${constraints.frenchPercent}% French, ${constraints.englishPercent}% English
• New vocabulary: Maximum ${constraints.vocabLimit} French words
• Duration: 45 minutes total

REQUIRED ELEMENTS:
1. Opening Hook (8-12 min): Something that sparks curiosity or excitement
2. Main Learning (25-30 min): Hands-on exploration with at least one movement break
3. Wrap-up (5-8 min): Quick consolidation of learning

ESSENTIAL FEATURES:
• Every new French word needs a gesture AND a visual
• Include partner work (Grade 1 students can't do whole-class sharing well)
• No activity should require sitting still more than 7 minutes
• Use only standard classroom materials (crayons, paper, glue, scissors, blocks, etc.)
• Instructions must be single-step or demonstrated

${subjectContext.focus}

${safetyNotes}

DIFFERENTIATION:
• Provide 2-3 ways to support struggling learners
• Include 1-2 extensions for students who finish early
• Remember some students may be non-verbal in French still

Create a lesson that includes:
- A title (French and English)
- Clear learning goal with observable success indicators
- Vocabulary with gestures and visuals
- Three connected activities that build on each other
- Simple assessment method (observation, thumbs up/down, or exit drawing)
- List of specific materials needed

Keep the lesson playful and concrete. These are 6-year-olds learning in their second language.`;
}

function getMonthlyConstraints(month: number): {
  vocabLimit: number;
  frenchPercent: number;
  englishPercent: number;
} {
  const constraints = {
    9: { vocabLimit: 3, frenchPercent: 30, englishPercent: 70 },
    10: { vocabLimit: 3, frenchPercent: 40, englishPercent: 60 },
    11: { vocabLimit: 4, frenchPercent: 50, englishPercent: 50 },
    12: { vocabLimit: 4, frenchPercent: 60, englishPercent: 40 },
    1: { vocabLimit: 4, frenchPercent: 65, englishPercent: 35 },
    2: { vocabLimit: 5, frenchPercent: 70, englishPercent: 30 },
    3: { vocabLimit: 5, frenchPercent: 75, englishPercent: 25 },
    4: { vocabLimit: 5, frenchPercent: 80, englishPercent: 20 },
    5: { vocabLimit: 5, frenchPercent: 85, englishPercent: 15 },
    6: { vocabLimit: 5, frenchPercent: 85, englishPercent: 15 }
  };
  
  return constraints[month] || constraints[9];
}

function getSubjectContext(
  subject: SubjectType, 
  lessonNumber: number, 
  totalLessons: number
): {
  positioning: string;
  focus: string;
} {
  const position = lessonNumber <= 2 ? 'early' : 
                  lessonNumber >= totalLessons - 1 ? 'final' : 'middle';
  
  const contexts = {
    'Français (Immersion)': {
      early: {
        positioning: 'This is an introductory lesson - establish key vocabulary and build interest.',
        focus: `FRENCH FOCUS:
• Prioritize oral language and listening comprehension
• Use repetition, songs, or rhymes for memory
• Include echo speaking for pronunciation practice
• Keep written work to tracing or circling only`
      },
      middle: {
        positioning: 'Students have some familiarity with the topic - build on established vocabulary.',
        focus: `FRENCH FOCUS:
• Expand vocabulary through story or dialogue
• Include interactive speaking activities
• Use familiar words in new combinations
• Add simple written work (copying words, matching)`
      },
      final: {
        positioning: 'This wraps up the unit - celebrate and consolidate learning.',
        focus: `FRENCH FOCUS:
• Review and celebrate vocabulary learned
• Create something to share (mini-book, poster, song)
• Include student choice in activities
• Focus on using language creatively`
      }
    },
    
    'Mathématiques': {
      early: {
        positioning: 'Introduce the mathematical concept using concrete materials.',
        focus: `MATH FOCUS:
• Start with manipulatives before any numbers
• Use real objects for counting/sorting
• Include a math song or finger play
• Connect to classroom routines (counting friends, days)`
      },
      middle: {
        positioning: 'Students are developing the concept - provide varied practice.',
        focus: `MATH FOCUS:
• Multiple representations (objects, pictures, numbers)
• Include games for practice
• Add simple problem-solving
• Use math vocabulary in context`
      },
      final: {
        positioning: 'Students can apply the concept - add challenge and choice.',
        focus: `MATH FOCUS:
• Apply concept to new situations
• Include student-created problems
• Add gentle challenges for ready students
• Celebrate math learning with math museum or gallery`
      }
    },
    
    'Sciences de la nature': {
      early: {
        positioning: 'Spark curiosity and wonder about the topic.',
        focus: `SCIENCE FOCUS:
• Start with "I wonder" questions
• Explore through senses (safe materials only)
• Make observations before explanations
• Use science tools (magnifying glass, containers)`
      },
      middle: {
        positioning: 'Investigate and explore the concept hands-on.',
        focus: `SCIENCE FOCUS:
• Conduct simple investigations
• Record observations with drawings
• Make predictions and test them
• Compare and sort findings`
      },
      final: {
        positioning: 'Share discoveries and connect to bigger ideas.',
        focus: `SCIENCE FOCUS:
• Share findings with others
• Make connections to daily life
• Create science display or demonstration
• Celebrate being scientists`
      }
    },
    
    'Arts visuels': {
      early: {
        positioning: 'Introduce technique or medium playfully.',
        focus: `ARTS FOCUS:
• Explore materials freely first
• Focus on process not product
• No "right" way to create
• Celebrate all attempts`
      },
      middle: {
        positioning: 'Develop skills while maintaining creativity.',
        focus: `ARTS FOCUS:
• Add gentle technique guidance
• Show variety of approaches
• Include choice in creation
• Build on previous explorations`
      },
      final: {
        positioning: 'Celebrate creative expression.',
        focus: `ARTS FOCUS:
• Create for authentic purpose (gift, display)
• Include student choice in medium/subject
• Set up gallery or exhibition
• Reflect on creative process`
      }
    },
    
    'Sciences humaines': {
      early: {
        positioning: 'Start with self and immediate environment.',
        focus: `SOCIAL STUDIES FOCUS:
• Begin with student's own experience
• Use photos and concrete examples
• Build vocabulary for discussing topic
• Make personal connections`
      },
      middle: {
        positioning: 'Expand to family and classroom community.',
        focus: `SOCIAL STUDIES FOCUS:
• Compare and contrast experiences
• Respect diversity in families/communities
• Use maps, photos, artifacts
• Include different perspectives`
      },
      final: {
        positioning: 'Connect to wider community.',
        focus: `SOCIAL STUDIES FOCUS:
• Link to school or local community
• Create something for others
• Celebrate diversity and belonging
• Take action (letters, posters, presentations)`
      }
    },
    
    'Formation personnelle et sociale': {
      early: {
        positioning: 'Establish safe environment for topic.',
        focus: `WELLNESS FOCUS:
• Create emotionally safe space
• Use puppets or stories for sensitive topics
• Provide opt-out options
• Focus on building vocabulary for feelings/concepts`
      },
      middle: {
        positioning: 'Practice skills in supportive environment.',
        focus: `WELLNESS FOCUS:
• Practice through role-play or scenarios
• Include movement and body awareness
• Build emotional vocabulary
• Celebrate different ways of being`
      },
      final: {
        positioning: 'Apply learning to real situations.',
        focus: `WELLNESS FOCUS:
• Create personal strategies or tools
• Practice in authentic contexts
• Celebrate growth and learning
• Make commitments for future`
      }
    }
  };
  
  return contexts[subject][position];
}

function getSafetyConsiderations(subject: SubjectType): string {
  const safety = {
    'Français (Immersion)': '',
    
    'Mathématiques': `SAFETY NOTE:
• Check manipulatives for choking hazards
• Ensure fair sharing of materials`,
    
    'Sciences de la nature': `SAFETY REQUIREMENTS:
• List any safety concerns with materials
• Include safety rules at activity start
• Have cleanup procedures ready
• No taste tests without permission notes`,
    
    'Arts visuels': `SAFETY CONSIDERATIONS:
• Scissors need supervision
• Use washable materials only
• Cover tables if needed
• Have cleanup routine established`,
    
    'Sciences humaines': `SENSITIVITY NOTE:
• Respect diverse family structures
• Avoid assumptions about home life
• Provide alternatives to family sharing`,
    
    'Formation personnelle et sociale': `EMOTIONAL SAFETY:
• Never force personal disclosure
• Provide private opt-out option
• Have comfort items available
• Include calming strategies
• Be trauma-informed in approach`
  };
  
  return safety[subject] || '';
}

// VALIDATION FUNCTION FOR AI RESPONSES
export function validatePerfectResponse(response: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for hallucination indicators
  const hallucinations = [
    'friday', 'monday', 'tuesday', 'wednesday', 'thursday',
    'morning', 'afternoon', 'lunch', 'recess',
    'energetic', 'tired', 'restless',
    'the class of', 'the 20 students', 'the 25 students',
    'yesterday we', 'last lesson', 'tomorrow we will',
    'halloween', 'christmas party', 'valentine',
    'parents will', 'families are coming'
  ];
  
  const foundHallucinations = hallucinations.filter(h => 
    response.toLowerCase().includes(h)
  );
  
  if (foundHallucinations.length > 0) {
    issues.push(`Contains temporal/contextual assumptions: ${foundHallucinations.join(', ')}`);
  }
  
  // Check for required elements
  const required = [
    { element: 'gesture', message: 'Missing gestures for vocabulary' },
    { element: 'visual', message: 'Missing visual supports' },
    { element: 'partner', message: 'Missing partner work' },
    { element: 'movement', message: 'Missing movement break' }
  ];
  
  required.forEach(req => {
    if (!response.toLowerCase().includes(req.element)) {
      issues.push(req.message);
    }
  });
  
  // Check for inappropriate content
  if (response.includes('worksheet') && !response.includes('no worksheet')) {
    issues.push('Worksheets as main activity not appropriate for Grade 1');
  }
  
  if (response.includes('silent') && response.includes('10 minutes')) {
    issues.push('Silent work over 5 minutes not appropriate');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}