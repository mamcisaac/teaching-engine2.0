#!/usr/bin/env node

/**
 * Generate family engagement materials for Grade 1 French Immersion
 * Creates unit letters, home activities, and vocabulary lists
 */

const fs = require('fs');
const path = require('path');

// Family engagement templates by subject
const SUBJECT_TEMPLATES = {
  'francais': {
    greeting: "Chers parents et familles",
    closing: "Merci pour votre soutien continu dans l'apprentissage du français!",
    homeLanguageTip: "Il est normal et bénéfique que votre enfant mélange les langues à la maison."
  },
  'mathematiques': {
    greeting: "Chers parents et familles",
    closing: "Les mathématiques sont partout dans notre vie quotidienne!",
    homeLanguageTip: "Utilisez les moments quotidiens pour pratiquer les mathématiques (compter, mesurer, etc.)"
  },
  'sciences': {
    greeting: "Chers parents et familles",
    closing: "La curiosité scientifique commence à la maison!",
    homeLanguageTip: "Encouragez les questions 'pourquoi' et explorez ensemble les réponses."
  },
  'sciences-humaines': {
    greeting: "Chers parents et familles",
    closing: "Chaque famille a des histoires importantes à partager!",
    homeLanguageTip: "Partagez vos traditions familiales et culturelles avec votre enfant."
  },
  'arts-visuels': {
    greeting: "Chers parents et familles",
    closing: "La créativité s'épanouit avec votre encouragement!",
    homeLanguageTip: "Valorisez le processus créatif autant que le produit final."
  },
  'formation-personnelle': {
    greeting: "Chers parents et familles",
    closing: "Le bien-être émotionnel est la base de tout apprentissage!",
    homeLanguageTip: "Pratiquez l'identification des émotions ensemble à la maison."
  }
};

// Generate unit introduction letter for families
function generateUnitLetter(subject, unitTitle, lessons) {
  const template = SUBJECT_TEMPLATES[subject] || SUBJECT_TEMPLATES['francais'];
  const coreTopics = lessons
    .filter(l => l.lessonNumber <= 14)
    .slice(0, 5)
    .map(l => l.title)
    .join(', ');
  
  return `${template.greeting},

Nous sommes ravis de commencer notre nouvelle unité: "${unitTitle}"

Cette unité permettra à votre enfant de:
• Explorer des concepts importants en ${getSubjectName(subject)}
• Développer du vocabulaire en français
• Pratiquer de nouvelles compétences
• Faire des connexions avec la vie quotidienne

Quelques thèmes que nous explorerons:
${coreTopics}

Comment vous pouvez aider à la maison:
• Demandez à votre enfant de partager ce qu'il/elle a appris
• Pratiquez le nouveau vocabulaire ensemble (voir la liste ci-jointe)
• Essayez les activités suggérées quand vous avez du temps
• Célébrez les efforts et les progrès, pas seulement les résultats

${template.homeLanguageTip}

N'hésitez pas à me contacter si vous avez des questions ou si vous souhaitez partager des ressources culturelles liées à cette unité.

${template.closing}

Cordialement,
[Nom de l'enseignant(e)]`;
}

// Generate home activities based on unit content
function generateHomeActivities(subject, unitTitle, lessons) {
  const activities = [];
  
  // Universal activities for all subjects
  activities.push({
    title: "Conversation quotidienne",
    description: "Demandez chaque jour: 'Qu'as-tu appris de nouveau aujourd'hui?'",
    timeRequired: "5 minutes",
    materials: "Aucun",
    frenchSupport: "C'est correct si votre enfant répond en anglais!"
  });
  
  activities.push({
    title: "Chasse au trésor vocabulaire",
    description: "Cherchez ensemble les mots de vocabulaire dans votre environnement",
    timeRequired: "10-15 minutes",
    materials: "Liste de vocabulaire",
    frenchSupport: "Utilisez des gestes si la prononciation est difficile"
  });
  
  // Subject-specific activities
  const subjectActivities = generateSubjectSpecificActivities(subject, unitTitle);
  activities.push(...subjectActivities);
  
  // Extension activity
  activities.push({
    title: "Projet créatif familial",
    description: "Créez quelque chose ensemble en lien avec l'unité (dessin, construction, histoire)",
    timeRequired: "30 minutes (optionnel)",
    materials: "Matériaux créatifs disponibles",
    frenchSupport: "L'important est de s'amuser ensemble, peu importe la langue!"
  });
  
  return activities;
}

function generateSubjectSpecificActivities(subject, unitTitle) {
  const activities = {
    'francais': [
      {
        title: "Lecture ensemble",
        description: "Lisez des livres en français ou en anglais sur le thème de l'unité",
        timeRequired: "15 minutes",
        materials: "Livres de la bibliothèque",
        frenchSupport: "Les livres bilingues sont excellents!"
      },
      {
        title: "Jeu de mots",
        description: "Jouez à des jeux simples avec les nouveaux mots (mémoire, devinettes)",
        timeRequired: "10 minutes",
        materials: "Cartes de vocabulaire maison",
        frenchSupport: "Mélanger les langues est normal et utile"
      }
    ],
    'mathematiques': [
      {
        title: "Mathématiques en cuisine",
        description: "Comptez, mesurez et comparez en préparant des collations",
        timeRequired: "Pendant la préparation des repas",
        materials: "Ingrédients de cuisine",
        frenchSupport: "Utilisez les nombres en français si possible"
      },
      {
        title: "Jeux de société mathématiques",
        description: "Jouez à des jeux impliquant compter, additionner ou reconnaître des formes",
        timeRequired: "20 minutes",
        materials: "Jeux de société, dés, cartes",
        frenchSupport: "Comptez ensemble en français"
      }
    ],
    'sciences': [
      {
        title: "Observations de la nature",
        description: "Observez et discutez des phénomènes naturels liés à l'unité",
        timeRequired: "15 minutes",
        materials: "Carnet d'observations",
        frenchSupport: "Dessiner les observations aide la communication"
      },
      {
        title: "Expérience simple",
        description: "Faites une expérience sécuritaire liée au thème",
        timeRequired: "20 minutes",
        materials: "Matériaux simples du quotidien",
        frenchSupport: "Utilisez les mots scientifiques en français"
      }
    ],
    'sciences-humaines': [
      {
        title: "Partage d'histoires familiales",
        description: "Partagez des histoires ou traditions familiales liées au thème",
        timeRequired: "15 minutes",
        materials: "Photos familiales (optionnel)",
        frenchSupport: "Racontez dans votre langue maternelle si préféré"
      },
      {
        title: "Exploration communautaire",
        description: "Visitez un lieu dans la communauté lié à l'unité",
        timeRequired: "Variable",
        materials: "Transport",
        frenchSupport: "Discutez dans la langue la plus confortable"
      }
    ],
    'arts-visuels': [
      {
        title: "Création artistique libre",
        description: "Créez de l'art ensemble en utilisant les techniques apprises",
        timeRequired: "20 minutes",
        materials: "Matériaux d'art disponibles",
        frenchSupport: "L'art transcende les langues!"
      },
      {
        title: "Galerie maison",
        description: "Créez un espace pour exposer les créations de votre enfant",
        timeRequired: "10 minutes",
        materials: "Espace mural ou table",
        frenchSupport: "Demandez à votre enfant d'expliquer ses œuvres"
      }
    ],
    'formation-personnelle': [
      {
        title: "Pratique de bien-être",
        description: "Pratiquez ensemble des techniques de calme ou de respiration",
        timeRequired: "5-10 minutes",
        materials: "Espace calme",
        frenchSupport: "Les émotions sont universelles"
      },
      {
        title: "Discussion sur les émotions",
        description: "Parlez des émotions de la journée et comment les gérer",
        timeRequired: "10 minutes",
        materials: "Aucun",
        frenchSupport: "Utilisez la langue où l'enfant s'exprime le mieux"
      }
    ]
  };
  
  return activities[subject] || activities['francais'];
}

// Generate vocabulary list from lessons
function generateVocabularyList(lessons) {
  const vocabularyList = [];
  
  // Extract vocabulary from core lessons
  lessons
    .filter(l => l.lessonNumber <= 14)
    .forEach(lesson => {
      if (lesson.keyVocabulary && Array.isArray(lesson.keyVocabulary)) {
        lesson.keyVocabulary.forEach(word => {
          if (!vocabularyList.find(v => v.word === word)) {
            vocabularyList.push({
              word: word,
              lesson: lesson.lessonNumber,
              context: lesson.title,
              practiceIdeas: generatePracticeIdeas(word)
            });
          }
        });
      }
    });
  
  return vocabularyList;
}

function generatePracticeIdeas(word) {
  return [
    `Pointez l'objet en disant "${word}"`,
    `Utilisez "${word}" dans une phrase simple`,
    `Trouvez des images représentant "${word}"`,
    `Faites des gestes pour "${word}"`
  ];
}

function getSubjectName(subject) {
  const names = {
    'francais': 'français',
    'mathematiques': 'mathématiques',
    'sciences': 'sciences',
    'sciences-humaines': 'sciences humaines',
    'arts-visuels': 'arts visuels',
    'formation-personnelle': 'formation personnelle et sociale'
  };
  return names[subject] || subject;
}

// Generate resource alternatives for diverse families
function generateResourceAlternatives(subject, unitTitle) {
  return {
    materials: {
      lowCost: [
        "Matériaux recyclés (boîtes, papier, carton)",
        "Objets de la nature (feuilles, pierres, branches)",
        "Matériaux quotidiens (boutons, pâtes, haricots)",
        "Papier et crayons de base"
      ],
      noCost: [
        "Observation de l'environnement",
        "Discussion et partage oral",
        "Mouvements et gestes",
        "Jeux d'imagination"
      ],
      digital: [
        "Applications éducatives gratuites",
        "Vidéos éducatives en ligne",
        "Livres numériques de la bibliothèque",
        "Jeux éducatifs en ligne"
      ]
    },
    digitalResources: [
      {
        type: "Sites web éducatifs",
        examples: [
          "Radio-Canada Jeunesse",
          "TFO Éducation",
          "Bibliothèque numérique locale"
        ],
        note: "Ressources gratuites en français"
      },
      {
        type: "Applications",
        examples: [
          "Applications de lecture",
          "Jeux mathématiques",
          "Exploration scientifique"
        ],
        note: "Cherchez des options gratuites"
      }
    ]
  };
}

// Process all lesson files
function processAllUnits() {
  const lessonsDir = path.join(__dirname, '..', 'generated-lessons');
  const subjects = fs.readdirSync(lessonsDir).filter(f => 
    fs.statSync(path.join(lessonsDir, f)).isDirectory()
  );
  
  let processedCount = 0;
  let errors = [];
  
  subjects.forEach(subject => {
    const subjectPath = path.join(lessonsDir, subject);
    const files = fs.readdirSync(subjectPath).filter(f => 
      f.endsWith('-full.json')
    );
    
    files.forEach(file => {
      const filePath = path.join(subjectPath, file);
      
      try {
        // Read existing file
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Generate family engagement materials
        const familyConnections = {
          unitLetter: generateUnitLetter(subject, content.unitTitle, content.lessons || []),
          homeActivities: generateHomeActivities(subject, content.unitTitle, content.lessons || []),
          vocabularyList: generateVocabularyList(content.lessons || [])
        };
        
        // Generate resource alternatives
        const resourceAlternatives = generateResourceAlternatives(subject, content.unitTitle);
        
        // Update the content
        content.familyConnections = familyConnections;
        content.resourceAlternatives = resourceAlternatives;
        
        // Write back
        fs.writeFileSync(
          filePath, 
          JSON.stringify(content, null, 2)
        );
        
        processedCount++;
        console.log(`✅ Added family materials to: ${file}`);
        
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
        console.error(`❌ Error processing ${file}: ${error.message}`);
      }
    });
  });
  
  return { processedCount, errors };
}

// Create family engagement guide
function createFamilyGuide() {
  const guide = {
    title: "Guide d'engagement familial - 1re année immersion française",
    introduction: "Ce guide aide les familles à soutenir l'apprentissage à la maison, même sans parler français",
    
    coreprinciples: {
      inclusive: "Toutes les familles peuvent contribuer, peu importe la langue parlée",
      flexible: "Les activités s'adaptent aux horaires et ressources de chaque famille",
      celebratory: "Célébrez les efforts et progrès, pas seulement les résultats",
      collaborative: "L'apprentissage est un partenariat famille-école"
    },
    
    forNonFrenchSpeakingFamilies: {
      reassurance: "Vous n'avez pas besoin de parler français pour aider votre enfant!",
      strategies: [
        "Demandez à votre enfant de vous enseigner les nouveaux mots",
        "Utilisez des gestes et des images pour communiquer",
        "Célébrez quand votre enfant utilise le français",
        "Partagez vos propres langues et cultures",
        "Focalisez sur la compréhension, pas la perfection"
      ],
      benefits: "Les enfants bilingues bénéficient de toutes leurs langues"
    },
    
    communicationTips: {
      daily: "Créez une routine de conversation quotidienne",
      weekly: "Regardez ensemble le travail de la semaine",
      monthly: "Célébrez les accomplissements du mois",
      ongoing: "Communiquez avec l'enseignant(e) régulièrement"
    },
    
    homeEnvironment: {
      printRich: "Affichez des mots et images en français et autres langues",
      materials: "Gardez des matériaux créatifs accessibles",
      quietSpace: "Créez un coin calme pour le travail",
      celebration: "Créez un espace pour afficher les travaux"
    },
    
    culturalConnections: {
      share: "Partagez vos traditions et histoires familiales",
      explore: "Explorez ensemble différentes cultures",
      food: "Préparez des repas de différentes cultures",
      music: "Écoutez de la musique en différentes langues",
      stories: "Racontez des histoires dans votre langue maternelle"
    },
    
    whenChallenges: {
      frustration: "C'est normal! Faites une pause et revenez plus tard",
      confusion: "Utilisez des dessins ou gestes pour clarifier",
      resistance: "Rendez l'apprentissage ludique et sans pression",
      time: "Même 5 minutes par jour font une différence",
      resources: "Utilisez ce que vous avez - créativité > matériaux coûteux"
    }
  };
  
  // Save the guide
  const guidePath = path.join(__dirname, '..', 'family-engagement-guide.json');
  fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));
  console.log(`📚 Created family guide at: ${guidePath}`);
  
  return guide;
}

// Main execution
console.log('👨‍👩‍👧‍👦 Generating family engagement materials...\n');

// Create the family guide first
createFamilyGuide();

// Process all units
const results = processAllUnits();

console.log('\n📊 Family Materials Generation Complete:');
console.log(`✅ Successfully processed: ${results.processedCount} files`);

if (results.errors.length > 0) {
  console.log(`❌ Errors encountered: ${results.errors.length}`);
  results.errors.forEach(err => {
    console.log(`   - ${err.file}: ${err.error}`);
  });
}

console.log('\n✨ All units now have comprehensive family engagement materials!');
console.log('📖 Family guide created for inclusive support');
console.log('🌍 Materials support diverse families and languages');