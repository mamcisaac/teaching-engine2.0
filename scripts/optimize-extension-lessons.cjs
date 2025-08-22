#!/usr/bin/env node

/**
 * Optimize extension lessons for Grade 1 French Immersion
 * Adds clear labels and teacher guidance for effective use
 */

const fs = require('fs');
const path = require('path');

// Extension lesson categories and their purposes
const EXTENSION_CATEGORIES = {
  enrichment: {
    label: 'Enrichissement',
    icon: '🌟',
    purpose: 'Pour approfondir et enrichir les apprentissages',
    when: 'Quand les élèves maîtrisent les concepts de base'
  },
  practice: {
    label: 'Pratique supplémentaire',
    icon: '🔄',
    purpose: 'Pour consolider les apprentissages essentiels',
    when: 'Quand les élèves ont besoin de plus de pratique'
  },
  exploration: {
    label: 'Exploration créative',
    icon: '🎨',
    purpose: 'Pour explorer les concepts de manière créative',
    when: 'Pour les journées spéciales ou projets libres'
  },
  integration: {
    label: 'Intégration',
    icon: '🔗',
    purpose: 'Pour connecter à d\'autres matières ou thèmes',
    when: 'Pour faire des liens interdisciplinaires'
  },
  celebration: {
    label: 'Célébration',
    icon: '🎉',
    purpose: 'Pour célébrer et partager les apprentissages',
    when: 'À la fin de l\'unité ou pour des événements spéciaux'
  },
  differentiation: {
    label: 'Différenciation',
    icon: '🎯',
    purpose: 'Pour répondre aux besoins variés des élèves',
    when: 'Pour adapter aux différents styles d\'apprentissage'
  }
};

// Determine extension category based on lesson content
function categorizeExtensionLesson(lesson) {
  const title = lesson.title?.toLowerCase() || '';
  const goal = lesson.oneGoal?.toLowerCase() || '';
  const combined = title + ' ' + goal;
  
  // Keywords for each category
  if (combined.includes('célébr') || combined.includes('partage') || combined.includes('exposition')) {
    return 'celebration';
  } else if (combined.includes('libre') || combined.includes('créati') || combined.includes('exploration')) {
    return 'exploration';
  } else if (combined.includes('pratique') || combined.includes('révision') || combined.includes('consolidation')) {
    return 'practice';
  } else if (combined.includes('école') || combined.includes('communaut') || combined.includes('famille')) {
    return 'integration';
  } else if (combined.includes('enrichi') || combined.includes('approfondi') || combined.includes('avancé')) {
    return 'enrichment';
  } else {
    return 'differentiation'; // Default category
  }
}

// Generate teacher guidance for extension lessons
function generateExtensionGuidance(category, lesson) {
  const cat = EXTENSION_CATEGORIES[category];
  
  return {
    category: cat.label,
    icon: cat.icon,
    purpose: cat.purpose,
    whenToUse: cat.when,
    
    teacherTips: {
      preparation: generatePreparationTips(category),
      implementation: generateImplementationTips(category),
      assessment: generateAssessmentTips(category),
      adaptation: generateAdaptationTips(category)
    },
    
    flexibilityNotes: [
      'Cette leçon peut être adaptée selon les besoins du groupe',
      'Le timing peut être ajusté selon l\'engagement des élèves',
      'Les matériaux peuvent être substitués selon la disponibilité',
      'L\'activité peut être simplifiée ou enrichie au besoin'
    ],
    
    connectionToCore: `Cette leçon d'extension ${cat.label.toLowerCase()} renforce les apprentissages des leçons principales`,
    
    alternativeUses: generateAlternativeUses(category)
  };
}

function generatePreparationTips(category) {
  const tips = {
    enrichment: [
      'Préparer du matériel supplémentaire pour les défis',
      'Avoir des questions ouvertes prêtes',
      'Prévoir des ressources pour approfondir'
    ],
    practice: [
      'Identifier les concepts nécessitant plus de pratique',
      'Préparer du matériel de manipulation',
      'Avoir des activités différenciées prêtes'
    ],
    exploration: [
      'Rassembler divers matériaux créatifs',
      'Créer un environnement ouvert à l\'exploration',
      'Préparer peu de directives, plus de possibilités'
    ],
    integration: [
      'Identifier les liens avec d\'autres matières',
      'Préparer des exemples concrets',
      'Coordonner avec d\'autres enseignants si nécessaire'
    ],
    celebration: [
      'Organiser l\'espace pour la présentation',
      'Inviter les familles si approprié',
      'Préparer des certificats ou reconnaissances'
    ],
    differentiation: [
      'Préparer plusieurs niveaux d\'activités',
      'Avoir des supports visuels variés',
      'Planifier des regroupements flexibles'
    ]
  };
  
  return tips[category] || tips.differentiation;
}

function generateImplementationTips(category) {
  const tips = {
    enrichment: [
      'Commencer par réviser les concepts de base',
      'Introduire progressivement les défis',
      'Encourager la pensée critique et créative'
    ],
    practice: [
      'Utiliser des jeux et activités ludiques',
      'Varier les modalités de pratique',
      'Offrir des rétroactions immédiates'
    ],
    exploration: [
      'Donner du temps pour explorer librement',
      'Poser des questions ouvertes',
      'Valoriser toutes les découvertes'
    ],
    integration: [
      'Faire des liens explicites entre les matières',
      'Utiliser des exemples de la vie quotidienne',
      'Encourager les élèves à voir les connexions'
    ],
    celebration: [
      'Créer une atmosphère festive',
      'Permettre à chaque élève de briller',
      'Documenter les accomplissements'
    ],
    differentiation: [
      'Observer et ajuster selon les réponses',
      'Offrir des choix aux élèves',
      'Utiliser des groupes flexibles'
    ]
  };
  
  return tips[category] || tips.differentiation;
}

function generateAssessmentTips(category) {
  const tips = {
    enrichment: 'Évaluer la profondeur de la compréhension et la créativité',
    practice: 'Observer les progrès dans la maîtrise des concepts',
    exploration: 'Documenter le processus d\'exploration et les découvertes',
    integration: 'Évaluer la capacité à faire des liens entre les concepts',
    celebration: 'Célébrer les accomplissements sans évaluation formelle',
    differentiation: 'Utiliser des critères adaptés aux objectifs individuels'
  };
  
  return tips[category] || tips.differentiation;
}

function generateAdaptationTips(category) {
  return {
    forStruggling: 'Simplifier les attentes, offrir plus de soutien, utiliser des manipulatifs',
    forAdvanced: 'Ajouter des défis, encourager l\'autonomie, proposer des extensions',
    forELL: 'Utiliser plus de supports visuels, permettre l\'usage de la L1, simplifier le vocabulaire',
    forIEP: 'Adapter selon les objectifs individuels, modifier les matériaux au besoin',
    timeShort: 'Réduire à l\'activité principale, éliminer les extensions',
    timeLong: 'Ajouter des activités d\'approfondissement, permettre plus d\'exploration'
  };
}

function generateAlternativeUses(category) {
  const uses = {
    enrichment: [
      'Centre d\'apprentissage autonome',
      'Projet pour élèves avancés',
      'Activité de mentorat par les pairs'
    ],
    practice: [
      'Station de révision',
      'Devoir optionnel à la maison',
      'Activité de transition'
    ],
    exploration: [
      'Journée thématique',
      'Projet d\'art libre',
      'Activité de fin de journée'
    ],
    integration: [
      'Projet interdisciplinaire',
      'Sortie éducative',
      'Collaboration avec d\'autres classes'
    ],
    celebration: [
      'Événement de fin d\'unité',
      'Présentation aux parents',
      'Assemblée scolaire'
    ],
    differentiation: [
      'Centre d\'apprentissage différencié',
      'Activité en petit groupe',
      'Support individuel'
    ]
  };
  
  return uses[category] || uses.differentiation;
}

// Process all lesson files
function processAllUnits() {
  const lessonsDir = path.join(__dirname, '..', 'generated-lessons');
  const subjects = fs.readdirSync(lessonsDir).filter(f => 
    fs.statSync(path.join(lessonsDir, f)).isDirectory()
  );
  
  let processedCount = 0;
  let extensionCount = 0;
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
        
        // Process extension lessons (lessons 15-20)
        if (content.lessons && Array.isArray(content.lessons)) {
          content.lessons.forEach(lesson => {
            if (lesson.lessonNumber >= 15 && lesson.lessonNumber <= 20) {
              // Categorize the extension lesson
              const category = categorizeExtensionLesson(lesson);
              
              // Add extension guidance
              lesson.extensionGuidance = generateExtensionGuidance(category, lesson);
              
              // Update lesson type label
              lesson.lessonType = 'extension';
              lesson.extensionCategory = category;
              
              extensionCount++;
            }
          });
        }
        
        // Write back
        fs.writeFileSync(
          filePath, 
          JSON.stringify(content, null, 2)
        );
        
        processedCount++;
        console.log(`✅ Optimized extensions in: ${file}`);
        
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
        console.error(`❌ Error processing ${file}: ${error.message}`);
      }
    });
  });
  
  return { processedCount, extensionCount, errors };
}

// Create extension lesson guide
function createExtensionGuide() {
  const guide = {
    title: "Guide des leçons d'extension - 1re année immersion française",
    purpose: "Les leçons d'extension offrent flexibilité et différenciation pour répondre aux besoins variés",
    
    structure: {
      coreVsExtension: "14 leçons principales (70%) + 6 leçons d'extension (30%)",
      flexibility: "Les extensions peuvent être utilisées selon les besoins, pas nécessairement dans l'ordre",
      adaptation: "Chaque extension peut être modifiée pour différents contextes"
    },
    
    categories: EXTENSION_CATEGORIES,
    
    usageScenarios: {
      fastFinishers: "Utiliser les extensions d'enrichissement pour les élèves qui terminent rapidement",
      needMorePractice: "Utiliser les extensions de pratique pour consolider les apprentissages",
      specialDays: "Utiliser les extensions d'exploration pour les journées spéciales",
      assessment: "Utiliser les extensions de célébration pour l'évaluation sommative",
      differentiation: "Adapter toute extension selon les besoins individuels"
    },
    
    planningTips: {
      weekly: "Planifier 1-2 extensions par semaine selon les besoins",
      flexible: "Garder les extensions flexibles pour s'adapter au rythme de la classe",
      studentChoice: "Permettre parfois aux élèves de choisir leur extension",
      documentation: "Documenter quelles extensions fonctionnent bien avec votre groupe"
    },
    
    commonChallenges: {
      time: "Solution: Utiliser des versions courtes des extensions",
      resources: "Solution: Adapter avec les matériaux disponibles",
      engagement: "Solution: Laisser les élèves choisir ou modifier l'activité",
      differentiation: "Solution: Préparer 2-3 niveaux de la même extension"
    }
  };
  
  // Save the guide
  const guidePath = path.join(__dirname, '..', 'extension-lessons-guide.json');
  fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));
  console.log(`📚 Created extension guide at: ${guidePath}`);
  
  return guide;
}

// Main execution
console.log('🎯 Optimizing extension lessons for Grade 1...\n');

// Create the extension guide first
createExtensionGuide();

// Process all units
const results = processAllUnits();

console.log('\n📊 Extension Optimization Complete:');
console.log(`✅ Successfully processed: ${results.processedCount} files`);
console.log(`🌟 Optimized extensions: ${results.extensionCount} lessons`);

if (results.errors.length > 0) {
  console.log(`❌ Errors encountered: ${results.errors.length}`);
  results.errors.forEach(err => {
    console.log(`   - ${err.file}: ${err.error}`);
  });
}

console.log('\n✨ All extension lessons now have clear categories and guidance!');
console.log('📖 Extension guide created for teacher reference');