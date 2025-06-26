import { 
  FrenchImmersionLessonContent, 
  FrenchImmersionUnitContent,
  FrenchImmersionTemplateMetadata 
} from '../../../types/frenchImmersion';
import { PlanTemplate } from '../../../types/template';

// Sample Grade 1 French Immersion Lesson Templates
export const GRADE1_FI_LESSON_TEMPLATES: Array<PlanTemplate & {
  content: FrenchImmersionLessonContent;
  fiMetadata: FrenchImmersionTemplateMetadata;
}> = [
  {
    id: 'fi-lesson-family',
    title: 'Ma famille - My Family',
    titleFr: 'Ma famille',
    description: 'Introduction to family vocabulary with cultural connections',
    descriptionFr: 'Introduction au vocabulaire de la famille avec liens culturels',
    type: 'LESSON_PLAN',
    category: 'BY_THEME',
    subject: 'French Language Arts',
    gradeMin: 1,
    gradeMax: 1,
    tags: ['family', 'vocabulary', 'oral-communication', 'french-immersion'],
    keywords: ['famille', 'family', 'maman', 'papa', 'Grade 1'],
    isSystem: true,
    isPublic: true,
    content: {
      duration: 60,
      objectivesEn: [
        'Students will learn basic family vocabulary in French',
        'Students will use simple sentences to describe their family'
      ],
      objectivesFr: [
        'Les élèves apprendront le vocabulaire de base de la famille en français',
        'Les élèves utiliseront des phrases simples pour décrire leur famille'
      ],
      materials: [
        'Family photos or drawings',
        'Flashcards with family vocabulary',
        'French picture book about families',
        'Chart paper for anchor chart',
        'Crayons and paper for family portraits'
      ],
      mindsOn: `1. Begin with the song "Ma famille" (tune: Frère Jacques)
2. Show family photos and introduce yourself: "Voici ma famille"
3. Review previous vocabulary with gestures
4. Ask students to think about their families`,
      action: `1. Introduce vocabulary with flashcards: maman, papa, frère, sœur, bébé
2. Practice pronunciation with echo game
3. Read French picture book about families
4. Students create family portraits with labels
5. Gallery walk - students share "C'est ma maman" etc.`,
      consolidation: `1. Students sit in circle with family portraits
2. Each child shares one family member in French
3. Class creates anchor chart of family words
4. Closing song: "Ma famille"`,
      languageFocus: {
        targetVocabulary: [
          { english: 'mom', french: 'maman', pronunciation: 'mah-mahn', context: 'family' },
          { english: 'dad', french: 'papa', pronunciation: 'pah-pah', context: 'family' },
          { english: 'brother', french: 'frère', pronunciation: 'frehr', context: 'family' },
          { english: 'sister', french: 'sœur', pronunciation: 'seur', context: 'family' },
          { english: 'baby', french: 'bébé', pronunciation: 'bay-bay', context: 'family' },
          { english: 'family', french: 'famille', pronunciation: 'fah-mee', context: 'general' }
        ],
        sentenceStructures: [
          "C'est ma/mon...",
          "Voici ma famille",
          "J'ai un/une..."
        ],
        grammarPoints: ['Introduction to ma/mon (possessive)'],
        pronunciationFocus: ['Silent letters in French', 'Nasal sounds in "maman"']
      },
      culturalConnections: {
        francophoneCulture: ['Discuss families in Acadian communities'],
        canadianContent: ['Compare family structures in PEI'],
        globalPerspectives: ['Show families from different Francophone countries']
      },
      assessmentNotes: 'Observe pronunciation attempts, participation in activities, and use of new vocabulary'
    },
    estimatedMinutes: 60,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fiMetadata: {
      gradeLevel: 1,
      frenchProficiencyLevel: 'Beginner',
      timeOfYear: 'September',
      thematicUnit: 'All About Me'
    }
  },
  {
    id: 'fi-lesson-colors',
    title: 'Les couleurs - Colors',
    titleFr: 'Les couleurs',
    description: 'Learning colors through art and movement',
    descriptionFr: 'Apprendre les couleurs par l\'art et le mouvement',
    type: 'LESSON_PLAN',
    category: 'BY_SKILL',
    subject: 'French Language Arts',
    gradeMin: 1,
    gradeMax: 1,
    tags: ['colors', 'vocabulary', 'art-integration', 'french-immersion'],
    keywords: ['couleurs', 'colors', 'rouge', 'bleu', 'Grade 1'],
    isSystem: true,
    isPublic: true,
    content: {
      duration: 60,
      objectivesEn: [
        'Students will identify and name colors in French',
        'Students will describe objects using color words'
      ],
      objectivesFr: [
        'Les élèves identifieront et nommeront les couleurs en français',
        'Les élèves décriront des objets en utilisant les mots de couleur'
      ],
      materials: [
        'Colored scarves or fabric squares',
        'Color flashcards',
        'Paintbrushes and watercolors',
        'White paper',
        'Colored objects for sorting',
        'French color song audio'
      ],
      mindsOn: `1. Start with movement: "Levez-vous si vous portez du rouge!"
2. Introduce color song with actions
3. Show mystery bag with colored objects
4. Build excitement for color exploration`,
      action: `1. Introduce colors with flashcards and real objects
2. Play "Jacques a dit" with colors: "Touchez quelque chose de bleu!"
3. Color mixing activity with paint
4. Create rainbow art with French labels
5. Color scavenger hunt in classroom`,
      consolidation: `1. Students present their rainbow art
2. Play "Quelle couleur manque?" (What color is missing?)
3. Sing color song with movements
4. Exit ticket: Hold up color cards as students name them`,
      languageFocus: {
        targetVocabulary: [
          { english: 'red', french: 'rouge', pronunciation: 'roozh', context: 'color' },
          { english: 'blue', french: 'bleu', pronunciation: 'bluh', context: 'color' },
          { english: 'yellow', french: 'jaune', pronunciation: 'zhohn', context: 'color' },
          { english: 'green', french: 'vert', pronunciation: 'vehr', context: 'color' },
          { english: 'orange', french: 'orange', pronunciation: 'oh-rahnzh', context: 'color' },
          { english: 'purple', french: 'violet', pronunciation: 'vee-oh-leh', context: 'color' }
        ],
        sentenceStructures: [
          "C'est...",
          "Je vois...",
          "J'aime le/la..."
        ],
        grammarPoints: ['Introduction to le/la with colors'],
        pronunciationFocus: ['French "r" sound', 'Silent final consonants']
      },
      culturalConnections: {
        francophoneCulture: ['French artists and their use of color'],
        canadianContent: ['PEI fall colors in French'],
        globalPerspectives: ['Colors in French flags around the world']
      },
      assessmentNotes: 'Track color recognition, pronunciation progress, and participation in activities'
    },
    estimatedMinutes: 60,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fiMetadata: {
      gradeLevel: 1,
      frenchProficiencyLevel: 'Beginner',
      timeOfYear: 'October',
      thematicUnit: 'Colors and Shapes'
    }
  },
  {
    id: 'fi-lesson-numbers',
    title: 'Les nombres 1-10 - Numbers 1-10',
    titleFr: 'Les nombres 1-10',
    description: 'Learning numbers through games and songs',
    descriptionFr: 'Apprendre les nombres par les jeux et les chansons',
    type: 'LESSON_PLAN',
    category: 'BY_SUBJECT',
    subject: 'Mathematics',
    gradeMin: 1,
    gradeMax: 1,
    tags: ['numbers', 'counting', 'math-integration', 'french-immersion'],
    keywords: ['nombres', 'numbers', 'compter', 'counting', 'Grade 1'],
    isSystem: true,
    isPublic: true,
    content: {
      duration: 60,
      objectivesEn: [
        'Students will count from 1-10 in French',
        'Students will recognize number words in French'
      ],
      objectivesFr: [
        'Les élèves compteront de 1 à 10 en français',
        'Les élèves reconnaîtront les mots de nombres en français'
      ],
      materials: [
        'Number cards 1-10',
        'Counting manipulatives (blocks, bears)',
        'Number song audio',
        'Ten frames',
        'Dice',
        'Number puzzles'
      ],
      mindsOn: `1. Start with finger counting rhyme in French
2. Students count classroom objects together
3. Mystery number bag - guess how many
4. Introduce number song with actions`,
      action: `1. Present numbers 1-5 with cards and objects
2. Practice with counting bears and ten frames
3. Number recognition game - match quantities to numerals
4. Add numbers 6-10 with movement activities
5. Play "Combien?" game with dice`,
      consolidation: `1. Human number line activity
2. Students create number books 1-10
3. Sing counting song with full actions
4. Count backwards from 10 in French`,
      languageFocus: {
        targetVocabulary: [
          { english: 'one', french: 'un', pronunciation: 'uh(n)', context: 'number' },
          { english: 'two', french: 'deux', pronunciation: 'duh', context: 'number' },
          { english: 'three', french: 'trois', pronunciation: 'twah', context: 'number' },
          { english: 'four', french: 'quatre', pronunciation: 'katr', context: 'number' },
          { english: 'five', french: 'cinq', pronunciation: 'sank', context: 'number' },
          { english: 'six', french: 'six', pronunciation: 'sees', context: 'number' },
          { english: 'seven', french: 'sept', pronunciation: 'set', context: 'number' },
          { english: 'eight', french: 'huit', pronunciation: 'weet', context: 'number' },
          { english: 'nine', french: 'neuf', pronunciation: 'nuhf', context: 'number' },
          { english: 'ten', french: 'dix', pronunciation: 'dees', context: 'number' }
        ],
        sentenceStructures: [
          "J'ai... (objects)",
          "Il y a...",
          "Combien?"
        ],
        grammarPoints: ['Number agreement basics'],
        pronunciationFocus: ['Nasal sounds', 'Silent letters in numbers']
      },
      culturalConnections: {
        francophoneCulture: ['French counting games and rhymes'],
        canadianContent: ['Counting in both official languages'],
        globalPerspectives: ['How children learn to count in France']
      },
      assessmentNotes: 'Observe counting accuracy, number recognition, and willingness to use French numbers'
    },
    estimatedMinutes: 60,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fiMetadata: {
      gradeLevel: 1,
      frenchProficiencyLevel: 'Beginner',
      timeOfYear: 'September',
      thematicUnit: 'Numbers and Counting'
    }
  }
];

// Sample Grade 1 French Immersion Unit Templates
export const GRADE1_FI_UNIT_TEMPLATES: Array<PlanTemplate & {
  content: FrenchImmersionUnitContent;
  fiMetadata: FrenchImmersionTemplateMetadata;
}> = [
  {
    id: 'fi-unit-all-about-me',
    title: 'Tout sur moi - All About Me',
    titleFr: 'Tout sur moi',
    description: 'A 4-week unit introducing personal identity vocabulary and expressions',
    descriptionFr: 'Une unité de 4 semaines introduisant le vocabulaire et les expressions d\'identité personnelle',
    type: 'UNIT_PLAN',
    category: 'BY_THEME',
    subject: 'French Language Arts',
    gradeMin: 1,
    gradeMax: 1,
    tags: ['identity', 'family', 'emotions', 'french-immersion', 'september'],
    keywords: ['moi', 'famille', 'emotions', 'Grade 1', 'introduction'],
    isSystem: true,
    isPublic: true,
    content: {
      overviewEn: 'Students explore personal identity through French language learning',
      overviewFr: 'Les élèves explorent l\'identité personnelle à travers l\'apprentissage du français',
      learningGoalsEn: [
        'Introduce themselves in French',
        'Describe family members',
        'Express basic emotions',
        'Use numbers 1-10 in context'
      ],
      learningGoalsFr: [
        'Se présenter en français',
        'Décrire les membres de la famille',
        'Exprimer les émotions de base',
        'Utiliser les nombres 1-10 en contexte'
      ],
      bigIdeas: 'Language learning connects us to ourselves and others',
      essentialQuestions: [
        'How do we share who we are in a new language?',
        'What makes my family special?'
      ],
      keyVocabulary: [
        'Personal pronouns', 'Family members', 'Emotions', 'Numbers 1-10',
        'Body parts', 'Age expressions'
      ],
      languageProgression: {
        week1Focus: {
          vocabulary: [
            { english: 'I', french: 'je', pronunciation: 'zhuh' },
            { english: 'my name is', french: 'je m\'appelle', pronunciation: 'zhuh mah-pel' }
          ],
          structures: ['Je m\'appelle...', 'J\'ai ... ans'],
          communicationGoals: ['Introduce oneself', 'State age'],
          culturalElements: ['French greetings and politeness']
        },
        week2Focus: {
          vocabulary: [
            { english: 'mom', french: 'maman', pronunciation: 'mah-mahn' },
            { english: 'dad', french: 'papa', pronunciation: 'pah-pah' }
          ],
          structures: ['C\'est ma/mon...', 'Voici...'],
          communicationGoals: ['Introduce family members', 'Use possessives'],
          culturalElements: ['Family structures in Francophone cultures']
        },
        week3Focus: {
          vocabulary: [
            { english: 'happy', french: 'content(e)', pronunciation: 'kon-tahn' },
            { english: 'sad', french: 'triste', pronunciation: 'treest' }
          ],
          structures: ['Je suis...', 'Il/Elle est...'],
          communicationGoals: ['Express emotions', 'Describe others'],
          culturalElements: ['Emotion expressions in French culture']
        },
        week4Focus: {
          vocabulary: [
            { english: 'head', french: 'tête', pronunciation: 'tet' },
            { english: 'hand', french: 'main', pronunciation: 'man' }
          ],
          structures: ['J\'ai mal à...', 'Touchez votre...'],
          communicationGoals: ['Name body parts', 'Express simple needs'],
          culturalElements: ['French action songs and games']
        }
      },
      crossCurricularFrench: {
        mathematics: ['Counting family members', 'Age in numbers'],
        science: ['Body parts and senses', 'Emotions and feelings'],
        socialStudies: ['Family diversity', 'Community helpers'],
        arts: ['Self-portraits with labels', 'Family trees'],
        physicalEducation: ['Simon Says in French', 'Body part movements']
      },
      assessments: [
        {
          type: 'Formative',
          description: 'Daily observation of oral language use',
          timing: 'Ongoing'
        },
        {
          type: 'Performance',
          description: 'Introduce self and family presentation',
          timing: 'End of unit'
        }
      ],
      culminatingTask: 'Create and present "Mon livre de moi" (My book about me)',
      parentCommunicationPlan: 'Weekly bilingual newsletters with vocabulary and home activities'
    },
    estimatedWeeks: 4,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fiMetadata: {
      gradeLevel: 1,
      frenchProficiencyLevel: 'Beginner',
      timeOfYear: 'September',
      thematicUnit: 'Identity and Self'
    }
  },
  {
    id: 'fi-unit-seasons-weather',
    title: 'Les saisons et le temps - Seasons and Weather',
    titleFr: 'Les saisons et le temps',
    description: 'Exploring seasons and weather through French language and culture',
    descriptionFr: 'Explorer les saisons et le temps à travers la langue et la culture françaises',
    type: 'UNIT_PLAN',
    category: 'BY_SEASON',
    subject: 'French Language Arts',
    gradeMin: 1,
    gradeMax: 1,
    tags: ['seasons', 'weather', 'clothing', 'french-immersion', 'cross-curricular'],
    keywords: ['saisons', 'temps', 'météo', 'vêtements', 'Grade 1'],
    isSystem: true,
    isPublic: true,
    content: {
      overviewEn: 'Students learn to describe weather and seasons while building French vocabulary',
      overviewFr: 'Les élèves apprennent à décrire le temps et les saisons en développant le vocabulaire français',
      learningGoalsEn: [
        'Name the four seasons in French',
        'Describe daily weather',
        'Choose appropriate clothing',
        'Create weather reports'
      ],
      learningGoalsFr: [
        'Nommer les quatre saisons en français',
        'Décrire le temps quotidien',
        'Choisir les vêtements appropriés',
        'Créer des bulletins météo'
      ],
      bigIdeas: 'Weather and seasons connect us to our environment and culture',
      essentialQuestions: [
        'How does weather affect our daily lives?',
        'What makes each season special in PEI?'
      ],
      keyVocabulary: [
        'Season names', 'Weather expressions', 'Clothing items', 
        'Temperature words', 'Calendar terms'
      ],
      languageProgression: {
        week1Focus: {
          vocabulary: [
            { english: 'winter', french: 'hiver', pronunciation: 'ee-vehr' },
            { english: 'cold', french: 'froid', pronunciation: 'fwah' }
          ],
          structures: ['Il fait...', 'C\'est l\'hiver'],
          communicationGoals: ['Describe winter weather', 'Name the season'],
          culturalElements: ['Winter celebrations in Quebec']
        },
        week2Focus: {
          vocabulary: [
            { english: 'snow', french: 'neige', pronunciation: 'nezh' },
            { english: 'coat', french: 'manteau', pronunciation: 'man-toh' }
          ],
          structures: ['Il neige', 'Je porte...'],
          communicationGoals: ['Describe precipitation', 'Name winter clothing'],
          culturalElements: ['Winter sports in French Canada']
        },
        week3Focus: {
          vocabulary: [
            { english: 'spring', french: 'printemps', pronunciation: 'pran-tahn' },
            { english: 'rain', french: 'pluie', pronunciation: 'ploo-ee' }
          ],
          structures: ['Il pleut', 'Les fleurs poussent'],
          communicationGoals: ['Describe spring changes', 'Talk about rain'],
          culturalElements: ['Maple syrup season traditions']
        },
        week4Focus: {
          vocabulary: [
            { english: 'summer', french: 'été', pronunciation: 'ay-tay' },
            { english: 'hot', french: 'chaud', pronunciation: 'shoh' }
          ],
          structures: ['Il fait chaud', 'J\'aime l\'été'],
          communicationGoals: ['Express weather preferences', 'Plan summer activities'],
          culturalElements: ['PEI summer festivals']
        }
      },
      crossCurricularFrench: {
        mathematics: ['Weather graphing', 'Temperature counting'],
        science: ['Season cycles', 'Weather observations'],
        socialStudies: ['Seasonal celebrations', 'Climate in PEI'],
        arts: ['Season collages', 'Weather symbols'],
        physicalEducation: ['Weather-appropriate activities', 'Season movement games']
      },
      assessments: [
        {
          type: 'Formative',
          description: 'Weather calendar tracking',
          timing: 'Daily'
        },
        {
          type: 'Performance',
          description: 'Weather reporter presentation',
          timing: 'Weekly'
        }
      ],
      culminatingTask: 'Create a four seasons book with weather descriptions',
      parentCommunicationPlan: 'Monthly calendar with weather vocabulary and daily practice suggestions'
    },
    estimatedWeeks: 4,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fiMetadata: {
      gradeLevel: 1,
      frenchProficiencyLevel: 'Beginner',
      timeOfYear: 'January',
      thematicUnit: 'Environment and Nature'
    }
  }
];

// Helper function to get all Grade 1 French Immersion templates
export function getAllGrade1FITemplates() {
  return {
    lessonTemplates: GRADE1_FI_LESSON_TEMPLATES,
    unitTemplates: GRADE1_FI_UNIT_TEMPLATES
  };
}

// Helper function to get templates by theme
export function getTemplatesByTheme(theme: string) {
  const allTemplates = [...GRADE1_FI_LESSON_TEMPLATES, ...GRADE1_FI_UNIT_TEMPLATES];
  return allTemplates.filter(template => 
    template.fiMetadata.thematicUnit?.toLowerCase().includes(theme.toLowerCase())
  );
}

// Helper function to get templates by time of year
export function getTemplatesByTimeOfYear(month: string) {
  const allTemplates = [...GRADE1_FI_LESSON_TEMPLATES, ...GRADE1_FI_UNIT_TEMPLATES];
  return allTemplates.filter(template => 
    template.fiMetadata.timeOfYear?.toLowerCase() === month.toLowerCase()
  );
}