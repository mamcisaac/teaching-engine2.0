#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Grade 1 appropriate action verbs by cognitive level
const ACTION_VERBS = {
  knowledge: ['Identifier', 'Reconnaître', 'Nommer', 'Décrire', 'Repérer', 'Montrer'],
  comprehension: ['Comprendre', 'Expliquer', 'Comparer', 'Distinguer', 'Classer', 'Raconter'],
  application: ['Utiliser', 'Appliquer', 'Créer', 'Démontrer', 'Pratiquer', 'Réaliser'],
  analysis: ['Observer', 'Explorer', 'Examiner', 'Découvrir', 'Chercher', 'Trier'],
  synthesis: ['Combiner', 'Organiser', 'Planifier', 'Construire', 'Composer', 'Assembler'],
  evaluation: ['Choisir', 'Décider', 'Justifier', 'Apprécier', 'Préférer', 'Sélectionner']
};

// Subject-specific objective templates
const SUBJECT_PATTERNS = {
  'Français (Immersion)': {
    verbs: ['Lire', 'Écrire', 'Communiquer', 'Écouter', 'Parler', 'Raconter', 'Comprendre', 'Exprimer'],
    themes: ['vocabulaire', 'sons', 'lettres', 'mots', 'phrases', 'histoire', 'communication orale', 'lecture'],
    competencies: ['conscience phonologique', 'fluidité en lecture', 'expression orale', 'compréhension', 'vocabulaire français']
  },
  'Mathématiques': {
    verbs: ['Compter', 'Calculer', 'Mesurer', 'Comparer', 'Résoudre', 'Estimer', 'Représenter', 'Ordonner'],
    themes: ['nombres', 'opérations', 'formes', 'motifs', 'mesures', 'données', 'problèmes', 'suites'],
    competencies: ['sens du nombre', 'pensée logique', 'résolution de problèmes', 'raisonnement spatial', 'pensée mathématique']
  },
  'Sciences de la nature': {
    verbs: ['Observer', 'Explorer', 'Expérimenter', 'Découvrir', 'Classifier', 'Prédire', 'Tester', 'Examiner'],
    themes: ['êtres vivants', 'matière', 'énergie', 'structures', 'changements', 'environnement', 'saisons', 'animaux'],
    competencies: ['démarche scientifique', 'observation systématique', 'curiosité scientifique', 'pensée critique', 'respect de la nature']
  },
  'Sciences humaines': {
    verbs: ['Explorer', 'Comprendre', 'Respecter', 'Participer', 'Collaborer', 'Célébrer', 'Partager', 'Apprécier'],
    themes: ['communauté', 'famille', 'traditions', 'règles', 'besoins', 'rôles', 'diversité', 'environnement'],
    competencies: ['citoyenneté', 'empathie', 'collaboration', 'conscience culturelle', 'responsabilité sociale']
  },
  'Arts visuels': {
    verbs: ['Créer', 'Dessiner', 'Peindre', 'Modeler', 'Explorer', 'Exprimer', 'Représenter', 'Transformer'],
    themes: ['couleurs', 'formes', 'textures', 'lignes', 'motifs', 'techniques', 'matériaux', 'créations'],
    competencies: ['créativité', 'expression artistique', 'motricité fine', 'sens esthétique', 'appréciation artistique']
  },
  'Formation personnelle et sociale': {
    verbs: ['Développer', 'Pratiquer', 'Reconnaître', 'Exprimer', 'Gérer', 'Coopérer', 'Respecter', 'Adopter'],
    themes: ['émotions', 'sécurité', 'santé', 'amitiés', 'corps', 'besoins', 'sentiments', 'bien-être'],
    competencies: ['conscience de soi', 'régulation émotionnelle', 'habiletés sociales', 'autonomie', 'résilience']
  }
};

// Keywords to identify lesson focus
const LESSON_KEYWORDS = {
  introduction: ['découvrir', 'introduction', 'premiers', 'initiation', 'bienvenue', 'exploration'],
  practice: ['pratique', 'exercice', 'application', 'consolidation', 'révision', 'renforcement'],
  creation: ['créer', 'création', 'projet', 'œuvre', 'construction', 'réalisation'],
  collaboration: ['ensemble', 'équipe', 'groupe', 'collectif', 'collaboration', 'coopération'],
  evaluation: ['évaluation', 'réflexion', 'bilan', 'auto-évaluation', 'progrès', 'portfolio'],
  celebration: ['célébration', 'partage', 'présentation', 'exposition', 'spectacle', 'fête']
};

function generateLearningObjectives(
  lessonTitle: string,
  lessonNumber: number,
  totalLessons: number,
  subject: string,
  unitTitle: string,
  expectations: string[]
): string {
  const pattern = SUBJECT_PATTERNS[subject] || SUBJECT_PATTERNS['Français (Immersion)'];
  const objectives: string[] = [];
  
  // Determine lesson phase
  const progressRatio = lessonNumber / totalLessons;
  let phase: 'introduction' | 'development' | 'consolidation' = 'development';
  if (progressRatio <= 0.2) phase = 'introduction';
  else if (progressRatio >= 0.8) phase = 'consolidation';
  
  // Analyze lesson title for keywords
  const titleLower = lessonTitle.toLowerCase();
  let lessonFocus = 'general';
  for (const [focus, keywords] of Object.entries(LESSON_KEYWORDS)) {
    if (keywords.some(kw => titleLower.includes(kw))) {
      lessonFocus = focus;
      break;
    }
  }
  
  // Generate objective 1: Main skill/concept
  const verb1 = selectVerb(pattern.verbs, phase, 0);
  const theme1 = selectTheme(pattern.themes, titleLower, 0);
  objectives.push(`${verb1} ${theme1}${getContextFromTitle(titleLower)}`);
  
  // Generate objective 2: Application/practice
  const verb2 = selectApplicationVerb(lessonFocus);
  const theme2 = selectTheme(pattern.themes, titleLower, 1);
  objectives.push(`${verb2} ${theme2}${getSpecificSkill(subject, phase)}`);
  
  // Generate objective 3: Broader competency
  const competency = selectCompetency(pattern.competencies, phase);
  objectives.push(`Développer ${competency}${getThroughActivity(lessonFocus)}`);
  
  return objectives.join('; ');
}

function selectVerb(verbs: string[], phase: string, index: number): string {
  // Select verb based on phase and variation
  if (phase === 'introduction') {
    return ['Découvrir', 'Explorer', 'Observer', 'Identifier'][index % 4];
  } else if (phase === 'consolidation') {
    return ['Maîtriser', 'Appliquer', 'Démontrer', 'Intégrer'][index % 4];
  }
  return verbs[index % verbs.length];
}

function selectApplicationVerb(focus: string): string {
  const verbMap = {
    introduction: 'Explorer',
    practice: 'Pratiquer',
    creation: 'Créer',
    collaboration: 'Collaborer pour',
    evaluation: 'Réfléchir sur',
    celebration: 'Présenter',
    general: 'Appliquer'
  };
  return verbMap[focus] || 'Utiliser';
}

function selectTheme(themes: string[], title: string, index: number): string {
  // Try to match theme from title
  for (const theme of themes) {
    if (title.includes(theme)) return `les ${theme}`;
  }
  return `les ${themes[index % themes.length]}`;
}

function selectCompetency(competencies: string[], phase: string): string {
  // Select appropriate competency for lesson phase
  const index = phase === 'introduction' ? 0 : phase === 'consolidation' ? competencies.length - 1 : Math.floor(competencies.length / 2);
  return `la ${competencies[index % competencies.length]}`;
}

function getContextFromTitle(title: string): string {
  // Extract context from title if possible
  if (title.includes('nombres')) return ' jusqu\'à 20';
  if (title.includes('lettres')) return ' de l\'alphabet';
  if (title.includes('sons')) return ' simples';
  if (title.includes('famille')) return ' dans le contexte familial';
  if (title.includes('hiver') || title.includes('automne')) return ' selon les saisons';
  if (title.includes('animaux')) return ' du monde animal';
  return '';
}

function getSpecificSkill(subject: string, phase: string): string {
  const skills = {
    'Français (Immersion)': [' avec fluidité', ' de manière autonome', ' avec précision'],
    'Mathématiques': [' avec manipulation', ' de façon systématique', ' avec stratégies'],
    'Sciences de la nature': [' par expérimentation', ' avec méthode', ' en équipe'],
    'Sciences humaines': [' dans la communauté', ' avec respect', ' de façon inclusive'],
    'Arts visuels': [' avec créativité', ' en explorant', ' avec expression'],
    'Formation personnelle et sociale': [' au quotidien', ' de façon sécuritaire', ' avec confiance']
  };
  
  const subjectSkills = skills[subject] || skills['Français (Immersion)'];
  const index = phase === 'introduction' ? 0 : phase === 'consolidation' ? 2 : 1;
  return subjectSkills[index % subjectSkills.length];
}

function getThroughActivity(focus: string): string {
  const activities = {
    introduction: ' par l\'exploration guidée',
    practice: ' par la pratique répétée',
    creation: ' par la création personnelle',
    collaboration: ' par le travail d\'équipe',
    evaluation: ' par la réflexion personnelle',
    celebration: ' par le partage des apprentissages',
    general: ' par des activités variées'
  };
  return activities[focus] || activities.general;
}

async function generateAllLearningObjectives() {
  console.log('🎯 GENERATING LEARNING OBJECTIVES FOR ALL LESSONS\n');
  
  // Get all lessons that need objectives
  const lessonsToUpdate = await prisma.eTFOLessonPlan.findMany({
    where: {
      learningGoals: 'Développer les compétences'
    },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      },
      expectations: {
        include: {
          expectation: true
        }
      }
    },
    orderBy: [
      { unitPlanId: 'asc' },
      { lessonNumber: 'asc' }
    ]
  });
  
  console.log(`📚 Found ${lessonsToUpdate.length} lessons needing objectives\n`);
  
  // Group by unit for context
  const lessonsByUnit = new Map<string, typeof lessonsToUpdate>();
  for (const lesson of lessonsToUpdate) {
    const unitId = lesson.unitPlanId;
    if (!lessonsByUnit.has(unitId)) {
      lessonsByUnit.set(unitId, []);
    }
    lessonsByUnit.get(unitId)!.push(lesson);
  }
  
  const updates: { id: string; objectives: string }[] = [];
  
  // Process each unit's lessons
  for (const [unitId, unitLessons] of lessonsByUnit) {
    const firstLesson = unitLessons[0];
    const subject = firstLesson.unitPlan?.longRangePlan?.subject || 'Français (Immersion)';
    const unitTitle = firstLesson.unitPlan?.title || '';
    const totalInUnit = unitLessons.length;
    
    console.log(`📖 Processing ${subject} - ${unitTitle}: ${totalInUnit} lessons`);
    
    for (const lesson of unitLessons) {
      const expectations = lesson.expectations.map(e => e.expectation.code);
      
      const objectives = generateLearningObjectives(
        lesson.title || lesson.titleFr || '',
        lesson.lessonNumber || 1,
        totalInUnit,
        subject,
        unitTitle,
        expectations
      );
      
      updates.push({
        id: lesson.id,
        objectives: objectives
      });
    }
  }
  
  // Save to JSON for review
  const outputPath = path.join(process.cwd(), 'learning-objectives.json');
  fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2));
  
  console.log(`\n💾 Generated ${updates.length} learning objectives`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review objectives in learning-objectives.json`);
  console.log(`   2. Run 'npx tsx apply-learning-objectives.ts' to update database`);
  
  await prisma.$disconnect();
}

generateAllLearningObjectives()
  .then(() => {
    console.log('\n✅ Generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Generation failed:', error);
    process.exit(1);
  });