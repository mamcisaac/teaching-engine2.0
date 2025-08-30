/**
 * Data Generator Functions for E2E Tests
 * Creates realistic test data for various scenarios
 */

const masteryLevels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
const evidenceTypes = ['OBSERVATION', 'CONVERSATION', 'PRODUCT'];

/**
 * Generate random student assessment data
 */
function generateAssessment(studentId, options = {}) {
  const defaults = {
    masteryLevel: randomChoice(masteryLevels),
    evidenceType: randomChoice(evidenceTypes),
    subject: randomChoice([
      'Français (Immersion)',
      'Mathématiques',
      'Sciences de la nature',
      'Arts visuels',
      'Sciences humaines',
      'Formation personnelle et sociale'
    ]),
    expectation: generateExpectation(options.subject),
    notes: generateAssessmentNote(),
    date: options.date || new Date().toISOString()
  };

  return { ...defaults, ...options, studentId };
}

/**
 * Generate curriculum expectation based on subject
 */
function generateExpectation(subject) {
  const expectations = {
    'Français (Immersion)': [
      'Utilise le vocabulaire français de base',
      'Communique des idées simples oralement',
      'Reconnaît les lettres et leurs sons',
      'Lit des textes simples avec support',
      'Écrit des phrases simples'
    ],
    'Mathématiques': [
      'Dénombre des objets jusqu\'à 20',
      'Reconnaît les formes 2D simples',
      'Compare et ordonne des nombres',
      'Résout des problèmes d\'addition simples',
      'Mesure avec des unités non-standard'
    ],
    'Sciences de la nature': [
      'Observe les changements saisonniers',
      'Identifie les besoins des êtres vivants',
      'Explore les propriétés des matériaux',
      'Décrit le cycle de vie des plantes',
      'Comprend les états de la matière'
    ],
    'Arts visuels': [
      'Utilise différents médiums artistiques',
      'Exprime des idées à travers l\'art',
      'Identifie les couleurs primaires et secondaires',
      'Crée des motifs et des textures',
      'Apprécie les œuvres d\'art diverses'
    ],
    'Sciences humaines': [
      'Comprend les rôles dans la famille',
      'Identifie les helpers communautaires',
      'Reconnaît les symboles canadiens',
      'Décrit les changements au fil du temps',
      'Respecte la diversité culturelle'
    ],
    'Formation personnelle et sociale': [
      'Identifie et exprime ses émotions',
      'Pratique l\'hygiène personnelle',
      'Démontre le respect envers les autres',
      'Fait des choix sains',
      'Résout des conflits pacifiquement'
    ]
  };

  const subjectExpectations = expectations[subject] || expectations['Français (Immersion)'];
  return randomChoice(subjectExpectations);
}

/**
 * Generate realistic assessment notes
 */
function generateAssessmentNote() {
  const templates = [
    'Démontre une compréhension {level} du concept. {observation}',
    '{action} de façon {manner}. {detail}',
    'Montre {progress} dans {area}. {suggestion}',
    'Participe {participation} aux activités. {strength}',
    'Utilise {strategy} pour {task}. {outcome}'
  ];

  const variables = {
    level: ['solide', 'émergente', 'partielle', 'excellente', 'croissante'],
    observation: [
      'Utilise des stratégies appropriées',
      'Demande de l\'aide au besoin',
      'Travaille de façon autonome',
      'Collabore bien avec les pairs',
      'Montre de la persévérance'
    ],
    action: ['Complete les tâches', 'Communique ses idées', 'Résout les problèmes', 'Explore les concepts'],
    manner: ['indépendante', 'créative', 'méthodique', 'enthousiaste', 'réfléchie'],
    detail: [
      'Attention aux détails remarquable',
      'Utilise le vocabulaire approprié',
      'Fait des connections pertinentes',
      'Démontre une pensée critique'
    ],
    progress: ['des progrès constants', 'une amélioration notable', 'un développement positif', 'une croissance'],
    area: ['la communication orale', 'la résolution de problèmes', 'la collaboration', 'l\'autonomie'],
    suggestion: [
      'Continuer à encourager',
      'Fournir plus d\'opportunités de pratique',
      'Célébrer les succès',
      'Offrir du soutien supplémentaire au besoin'
    ],
    participation: ['activement', 'avec enthousiasme', 'de façon consistante', 'volontiers'],
    strength: ['Leadership naturel observé', 'Aide spontanément les pairs', 'Pose des questions pertinentes'],
    strategy: ['des manipulatifs', 'des stratégies visuelles', 'la collaboration', 'l\'auto-correction'],
    task: ['résoudre des problèmes', 'comprendre les concepts', 'compléter les activités', 'expliquer sa pensée'],
    outcome: ['Résultats positifs', 'Compréhension démontrée', 'Objectif atteint', 'Progrès visible']
  };

  let template = randomChoice(templates);
  
  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const pattern = new RegExp(`{${key}}`, 'g');
    template = template.replace(pattern, randomChoice(variables[key]));
  });

  return template;
}

/**
 * Generate artifact/file metadata
 */
function generateArtifact(studentId, type = 'photo') {
  const artifacts = {
    photo: {
      fileName: `student_work_${Date.now()}.jpg`,
      mimeType: 'image/jpeg',
      size: randomInt(500000, 2000000), // 500KB - 2MB
      title: randomChoice([
        'Travail de mathématiques',
        'Projet d\'art',
        'Écriture créative',
        'Expérience scientifique',
        'Activité de groupe'
      ]),
      description: 'Échantillon de travail d\'élève documentant l\'apprentissage'
    },
    video: {
      fileName: `presentation_${Date.now()}.mp4`,
      mimeType: 'video/mp4',
      size: randomInt(5000000, 25000000), // 5MB - 25MB
      title: randomChoice([
        'Présentation orale',
        'Démonstration de lecture',
        'Explication mathématique',
        'Performance musicale',
        'Activité physique'
      ]),
      description: 'Enregistrement vidéo de l\'activité d\'apprentissage'
    },
    document: {
      fileName: `assignment_${Date.now()}.pdf`,
      mimeType: 'application/pdf',
      size: randomInt(100000, 1000000), // 100KB - 1MB
      title: randomChoice([
        'Devoir complété',
        'Feuille d\'exercices',
        'Projet de recherche',
        'Journal de réflexion',
        'Portfolio d\'apprentissage'
      ]),
      description: 'Document de travail de l\'élève'
    },
    audio: {
      fileName: `recording_${Date.now()}.mp3`,
      mimeType: 'audio/mpeg',
      size: randomInt(1000000, 5000000), // 1MB - 5MB
      title: randomChoice([
        'Lecture à voix haute',
        'Explication verbale',
        'Chanson ou comptine',
        'Discussion de groupe',
        'Réflexion personnelle'
      ]),
      description: 'Enregistrement audio de l\'élève'
    }
  };

  const artifactData = artifacts[type] || artifacts.photo;
  
  return {
    ...artifactData,
    studentId,
    uploadedAt: new Date().toISOString(),
    tags: generateTags(),
    linkedExpectations: [generateExpectation()]
  };
}

/**
 * Generate relevant tags for artifacts
 */
function generateTags() {
  const allTags = [
    'excellent-travail',
    'amélioration-notable',
    'créativité',
    'collaboration',
    'autonomie',
    'persévérance',
    'pensée-critique',
    'communication-claire',
    'effort-soutenu',
    'innovation'
  ];

  const numTags = randomInt(2, 5);
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const tag = randomChoice(allTags);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Generate parent communication message
 */
function generateParentMessage(studentName, assessments) {
  const recentProgress = assessments.slice(-5); // Last 5 assessments
  const strengths = recentProgress
    .filter(a => a.masteryLevel === 'EXCEEDING' || a.masteryLevel === 'MEETING')
    .map(a => a.subject);
  
  const needsSupport = recentProgress
    .filter(a => a.masteryLevel === 'NOT_YET' || a.masteryLevel === 'APPROACHING')
    .map(a => a.subject);

  let message = `Chers parents de ${studentName},\n\n`;
  message += `J'espère que ce message vous trouve bien. Voici un résumé des progrès récents de votre enfant.\n\n`;
  
  if (strengths.length > 0) {
    message += `**Points forts observés:**\n`;
    message += `${studentName} démontre d'excellentes compétences en ${[...new Set(strengths)].join(', ')}. `;
    message += `Ces succès méritent d'être célébrés!\n\n`;
  }

  if (needsSupport.length > 0) {
    message += `**Domaines de croissance:**\n`;
    message += `Nous continuons à travailler sur ${[...new Set(needsSupport)].join(', ')}. `;
    message += `Votre soutien à la maison avec ces concepts serait très apprécié.\n\n`;
  }

  message += `**Prochaines étapes:**\n`;
  message += `- Continuer la lecture quotidienne en français (15 minutes)\n`;
  message += `- Pratiquer les nombres et le comptage dans les activités quotidiennes\n`;
  message += `- Encourager l'expression créative à travers l'art et le jeu\n\n`;
  
  message += `N'hésitez pas à me contacter si vous avez des questions.\n\n`;
  message += `Cordialement,\nMme Emily McIsaac`;

  return message;
}

/**
 * Helper functions
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Generate batch of assessments with realistic distribution
 */
function generateAssessmentBatch(students, days = 5) {
  const assessments = [];
  const subjects = [
    'Français (Immersion)',
    'Mathématiques',
    'Sciences de la nature',
    'Arts visuels',
    'Sciences humaines',
    'Formation personnelle et sociale'
  ];

  students.forEach(student => {
    // Each student gets 2-4 assessments per day
    for (let day = 0; day < days; day++) {
      const assessmentsPerDay = randomInt(2, 4);
      const date = new Date();
      date.setDate(date.getDate() - (days - day));

      for (let i = 0; i < assessmentsPerDay; i++) {
        // Ensure variety in subjects
        const subject = subjects[i % subjects.length];
        
        // Create realistic mastery distribution
        // Most students are MEETING (40%), some APPROACHING (30%), 
        // fewer EXCEEDING (20%) or NOT_YET (10%)
        const rand = Math.random();
        let masteryLevel;
        if (rand < 0.1) masteryLevel = 'NOT_YET';
        else if (rand < 0.4) masteryLevel = 'APPROACHING';
        else if (rand < 0.8) masteryLevel = 'MEETING';
        else masteryLevel = 'EXCEEDING';

        // Balance evidence types
        const evidenceType = evidenceTypes[assessments.length % 3];

        assessments.push(generateAssessment(student.studentId, {
          subject,
          masteryLevel,
          evidenceType,
          date: date.toISOString()
        }));
      }
    }
  });

  return assessments;
}

module.exports = {
  generateAssessment,
  generateExpectation,
  generateAssessmentNote,
  generateArtifact,
  generateTags,
  generateParentMessage,
  generateAssessmentBatch,
  generateId,
  randomChoice,
  randomInt,
  randomFloat,
  masteryLevels,
  evidenceTypes
};