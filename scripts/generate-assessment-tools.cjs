#!/usr/bin/env node

/**
 * Generate comprehensive assessment tools for Grade 1 French Immersion
 * Creates observation checklists, rubrics, and self-assessment tools
 */

const fs = require('fs');
const path = require('path');

// Grade 1 appropriate assessment criteria
const ASSESSMENT_PRINCIPLES = {
  observable: true,          // Must be observable behaviors
  ageAppropriate: true,      // Simple, clear for 6-year-olds
  growthFocused: true,       // Focus on progress not perfection
  multiModal: true,          // Visual, verbal, physical demonstrations
  frequencyBased: true       // "Pas encore", "Parfois", "Souvent", "Toujours"
};

// Subject-specific assessment focus areas
const SUBJECT_ASSESSMENT_FOCUS = {
  'francais': {
    areas: ['Vocabulaire', 'Communication orale', 'Participation', 'Compréhension'],
    selfAssessmentIcons: ['😊', '😐', '😟']
  },
  'mathematiques': {
    areas: ['Résolution de problèmes', 'Manipulation', 'Vocabulaire mathématique', 'Représentation'],
    selfAssessmentIcons: ['✓', '~', '?']
  },
  'sciences': {
    areas: ['Observation', 'Questionnement', 'Exploration sécuritaire', 'Communication des découvertes'],
    selfAssessmentIcons: ['🌟', '⭐', '☆']
  },
  'sciences-humaines': {
    areas: ['Respect de la diversité', 'Participation communautaire', 'Compréhension culturelle', 'Expression personnelle'],
    selfAssessmentIcons: ['🌈', '☀️', '☁️']
  },
  'arts-visuels': {
    areas: ['Créativité', 'Utilisation des matériaux', 'Expression personnelle', 'Appréciation artistique'],
    selfAssessmentIcons: ['🎨', '🖌️', '✏️']
  },
  'formation-personnelle': {
    areas: ['Régulation émotionnelle', 'Relations positives', 'Sécurité personnelle', 'Bien-être'],
    selfAssessmentIcons: ['💚', '💛', '❤️']
  }
};

// Universal observation checklist template
function generateObservationChecklist(subject, unitTitle) {
  const focus = SUBJECT_ASSESSMENT_FOCUS[subject] || SUBJECT_ASSESSMENT_FOCUS['francais'];
  
  return focus.areas.map(area => ({
    category: area,
    items: [
      `Démontre une compréhension de base en ${area.toLowerCase()}`,
      `Participe activement aux activités de ${area.toLowerCase()}`,
      `Montre du progrès dans ${area.toLowerCase()}`,
      `Applique les apprentissages de ${area.toLowerCase()} dans de nouveaux contextes`
    ],
    frequency: ['Pas encore', 'Parfois', 'Souvent', 'Toujours'],
    notes: 'Observations spécifiques:'
  }));
}

// Simple 3-level rubric for Grade 1
function generateRubric(subject, unitTitle) {
  return {
    title: `Rubrique d'évaluation - ${unitTitle}`,
    levels: [
      {
        level: 'Émergent',
        emoji: '🌱',
        description: "L'élève commence à développer les compétences",
        criteria: [
          'Nécessite un soutien constant',
          'Démontre une compréhension partielle',
          'Participe avec encouragement',
          'Essaie les nouvelles activités'
        ]
      },
      {
        level: 'En développement',
        emoji: '🌿',
        description: "L'élève progresse vers les attentes",
        criteria: [
          'Nécessite un soutien occasionnel',
          'Démontre une bonne compréhension',
          'Participe régulièrement',
          'Applique les apprentissages avec aide'
        ]
      },
      {
        level: 'Maîtrise',
        emoji: '🌳',
        description: "L'élève répond aux attentes",
        criteria: [
          'Travaille de façon autonome',
          'Démontre une compréhension solide',
          'Participe activement et aide les autres',
          'Applique les apprentissages de façon créative'
        ]
      }
    ],
    focusAreas: SUBJECT_ASSESSMENT_FOCUS[subject]?.areas || []
  };
}

// Age-appropriate self-assessment tools
function generateSelfAssessment(subject, unitTitle) {
  const focus = SUBJECT_ASSESSMENT_FOCUS[subject] || SUBJECT_ASSESSMENT_FOCUS['francais'];
  
  return {
    visualScale: {
      title: "Comment je me sens sur mon apprentissage",
      options: focus.selfAssessmentIcons,
      meanings: ['Je peux le faire seul', 'J\'ai besoin d\'un peu d\'aide', 'J\'ai besoin de beaucoup d\'aide']
    },
    simpleQuestions: [
      {
        question: "J'ai essayé de mon mieux aujourd'hui",
        responseType: 'emoji',
        options: ['😊 Oui!', '😐 Un peu', '😟 Pas vraiment']
      },
      {
        question: "J'ai appris quelque chose de nouveau",
        responseType: 'emoji',
        options: ['🌟 Beaucoup!', '⭐ Un peu', '☆ Pas sûr']
      },
      {
        question: "J'ai aidé un ami",
        responseType: 'emoji',
        options: ['✓ Oui', '~ Parfois', '? Non']
      },
      {
        question: "Je peux expliquer ce que j'ai appris",
        responseType: 'drawing',
        prompt: 'Dessine ou montre ce que tu as appris'
      }
    ],
    reflectionPrompts: [
      "Ma partie préférée était...",
      "J'étais fier quand...",
      "La prochaine fois, je veux essayer..."
    ]
  };
}

// Portfolio guidelines for collecting evidence
function generatePortfolioGuidelines(subject, unitTitle) {
  return {
    purpose: "Documenter le parcours d'apprentissage de chaque élève",
    collectionGuidelines: [
      'Inclure des échantillons de travail datés',
      'Photographier les créations 3D ou temporaires',
      'Noter les observations orales importantes',
      'Inclure les autoévaluations de l\'élève',
      'Documenter les moments de fierté'
    ],
    organizationTips: [
      'Organiser par date ou par compétence',
      'Inclure des réflexions de l\'élève',
      'Ajouter des notes sur le contexte',
      'Partager régulièrement avec les familles'
    ],
    evidenceTypes: {
      'Travaux écrits': 'Échantillons de début, milieu et fin d\'unité',
      'Photos': 'Processus de création, produits finaux, collaboration',
      'Enregistrements': 'Présentations orales, explications, chansons',
      'Observations': 'Notes anecdotiques, listes de vérification complétées'
    }
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
        
        // Generate assessment tools
        const assessmentTools = {
          observationChecklist: generateObservationChecklist(subject, content.unitTitle),
          rubrics: generateRubric(subject, content.unitTitle),
          selfAssessment: generateSelfAssessment(subject, content.unitTitle),
          portfolioGuidelines: generatePortfolioGuidelines(subject, content.unitTitle)
        };
        
        // Update the content
        content.assessmentTools = assessmentTools;
        
        // Write back
        fs.writeFileSync(
          filePath, 
          JSON.stringify(content, null, 2)
        );
        
        processedCount++;
        console.log(`✅ Added assessment tools to: ${file}`);
        
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
        console.error(`❌ Error processing ${file}: ${error.message}`);
      }
    });
  });
  
  return { processedCount, errors };
}

// Create assessment resources document
function createAssessmentGuide() {
  const guide = {
    title: "Guide d'évaluation - 1re année immersion française",
    philosophy: "L'évaluation en première année doit être bienveillante, formative et axée sur la croissance",
    
    principles: {
      developmentallyAppropriate: "Utiliser des méthodes adaptées à l'âge (6-7 ans)",
      strengthBased: "Célébrer les forces et les progrès",
      multiModal: "Permettre diverses façons de démontrer l'apprentissage",
      ongoing: "Évaluer de façon continue, pas seulement à la fin",
      inclusive: "Respecter tous les styles et rythmes d'apprentissage"
    },
    
    observationTips: {
      when: "Observer pendant les activités naturelles, pas en situation de test",
      what: "Noter les comportements observables, pas les interprétations",
      how: "Utiliser des outils simples et rapides (listes, photos, notes vocales)",
      frequency: "Observer chaque élève au moins une fois par semaine dans chaque matière"
    },
    
    communicationWithFamilies: {
      regular: "Partager les observations positives régulièrement",
      specific: "Donner des exemples concrets de progrès",
      collaborative: "Inviter les familles à partager leurs observations",
      celebratory: "Célébrer toutes les formes de croissance"
    },
    
    adaptations: {
      forELL: "Permettre des démonstrations non-verbales",
      forIEP: "Adapter les critères selon les objectifs individuels",
      forAnxious: "Offrir des options d'évaluation en petit groupe ou individuelle",
      forAdvanced: "Ajouter des défis optionnels à documenter"
    }
  };
  
  // Save the guide
  const guidePath = path.join(__dirname, '..', 'assessment-guide-grade1.json');
  fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));
  console.log(`📚 Created assessment guide at: ${guidePath}`);
  
  return guide;
}

// Main execution
console.log('🎯 Generating Grade 1 assessment tools...\n');

// Create the assessment guide first
createAssessmentGuide();

// Process all units
const results = processAllUnits();

console.log('\n📊 Assessment Tools Generation Complete:');
console.log(`✅ Successfully processed: ${results.processedCount} files`);

if (results.errors.length > 0) {
  console.log(`❌ Errors encountered: ${results.errors.length}`);
  results.errors.forEach(err => {
    console.log(`   - ${err.file}: ${err.error}`);
  });
}

console.log('\n✨ All units now have comprehensive assessment tools!');
console.log('📖 Assessment guide created for teacher reference');