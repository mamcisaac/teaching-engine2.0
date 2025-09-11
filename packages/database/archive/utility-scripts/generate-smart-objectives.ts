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

// Subject-specific verb banks for Grade 1
const SUBJECT_VERBS = {
  'Français (Immersion)': {
    intro: ['Découvrir', 'Explorer', 'Identifier', 'Reconnaître'],
    practice: ['Lire', 'Écrire', 'Raconter', 'Communiquer', 'Exprimer', 'Décrire'],
    mastery: ['Maîtriser', 'Démontrer', 'Appliquer', 'Créer']
  },
  'Mathématiques': {
    intro: ['Reconnaître', 'Identifier', 'Explorer', 'Découvrir'],
    practice: ['Compter', 'Calculer', 'Mesurer', 'Comparer', 'Ordonner', 'Représenter'],
    mastery: ['Résoudre', 'Appliquer', 'Démontrer', 'Maîtriser']
  },
  'Sciences de la nature': {
    intro: ['Observer', 'Explorer', 'Découvrir', 'Examiner'],
    practice: ['Expérimenter', 'Classifier', 'Comparer', 'Tester', 'Prédire'],
    mastery: ['Analyser', 'Expliquer', 'Démontrer', 'Appliquer']
  },
  'Sciences humaines': {
    intro: ['Explorer', 'Découvrir', 'Identifier', 'Reconnaître'],
    practice: ['Comprendre', 'Participer', 'Partager', 'Respecter', 'Collaborer'],
    mastery: ['Apprécier', 'Célébrer', 'Contribuer', 'Démontrer']
  },
  'Arts visuels': {
    intro: ['Explorer', 'Découvrir', 'Observer', 'Expérimenter'],
    practice: ['Créer', 'Dessiner', 'Peindre', 'Modeler', 'Transformer', 'Représenter'],
    mastery: ['Maîtriser', 'Exprimer', 'Présenter', 'Intégrer']
  },
  'Formation personnelle et sociale': {
    intro: ['Reconnaître', 'Identifier', 'Explorer', 'Découvrir'],
    practice: ['Pratiquer', 'Développer', 'Exprimer', 'Gérer', 'Coopérer'],
    mastery: ['Adopter', 'Démontrer', 'Appliquer', 'Maintenir']
  }
};

// Competency development themes
const COMPETENCIES = {
  'Français (Immersion)': ['la conscience phonologique', 'le vocabulaire français', 'la communication orale', 'la compréhension', 'l\'expression écrite'],
  'Mathématiques': ['le sens du nombre', 'la pensée logique', 'le raisonnement spatial', 'la résolution de problèmes', 'les stratégies de calcul'],
  'Sciences de la nature': ['la démarche scientifique', 'l\'observation systématique', 'la curiosité', 'l\'esprit critique', 'le respect de la nature'],
  'Sciences humaines': ['la citoyenneté', 'l\'empathie', 'la collaboration', 'la conscience culturelle', 'l\'identité personnelle'],
  'Arts visuels': ['la créativité', 'l\'expression artistique', 'la motricité fine', 'le sens esthétique', 'l\'appréciation artistique'],
  'Formation personnelle et sociale': ['l\'autonomie', 'la régulation émotionnelle', 'les habiletés sociales', 'la conscience de soi', 'la résilience']
};

// Extract key concepts from title
function extractConceptsFromTitle(title: string): { main: string; context: string } {
  const titleLower = title.toLowerCase();
  
  // Common patterns in titles
  const patterns = {
    // Numbers and counting
    nombres: { main: 'les nombres', context: 'de 0 à 10' },
    addition: { main: 'l\'addition', context: 'avec manipulatifs' },
    soustraction: { main: 'la soustraction', context: 'par manipulation' },
    compter: { main: 'le comptage', context: 'avec stratégies' },
    
    // Letters and sounds
    lettres: { main: 'les lettres', context: 'de l\'alphabet' },
    sons: { main: 'les sons', context: 'et leur correspondance' },
    syllabes: { main: 'les syllabes', context: 'dans les mots' },
    mots: { main: 'les mots', context: 'familiers' },
    
    // Nature and science
    printemps: { main: 'les signes du printemps', context: 'dans la nature' },
    automne: { main: 'les changements d\'automne', context: 'dans l\'environnement' },
    hiver: { main: 'les caractéristiques de l\'hiver', context: 'et leurs effets' },
    animaux: { main: 'les animaux', context: 'et leurs besoins' },
    plantes: { main: 'les plantes', context: 'et leur croissance' },
    
    // Art concepts
    couleurs: { main: 'les couleurs', context: 'primaires et secondaires' },
    formes: { main: 'les formes', context: 'géométriques de base' },
    lignes: { main: 'les lignes', context: 'et leurs variations' },
    textures: { main: 'les textures', context: 'variées' },
    motifs: { main: 'les motifs', context: 'répétitifs' },
    
    // Social concepts
    famille: { main: 'la famille', context: 'et ses membres' },
    école: { main: 'l\'école', context: 'et ses routines' },
    communauté: { main: 'la communauté', context: 'locale' },
    émotions: { main: 'les émotions', context: 'de base' },
    amis: { main: 'l\'amitié', context: 'positive' },
    sécurité: { main: 'la sécurité', context: 'personnelle' },
    corps: { main: 'le corps', context: 'et ses besoins' }
  };
  
  // Check for pattern matches
  for (const [key, value] of Object.entries(patterns)) {
    if (titleLower.includes(key)) {
      return value;
    }
  }
  
  // Extract from title directly if no pattern match
  const words = title.split(' ');
  const main = words.length > 2 ? words.slice(0, 2).join(' ').toLowerCase() : title.toLowerCase();
  return { main: `le concept de ${main}`, context: '' };
}

// Generate contextual learning objectives
function generateSmartObjectives(
  lesson: any
): string {
  const subject = lesson.unitPlan?.longRangePlan?.subject || 'Français (Immersion)';
  const title = lesson.title || lesson.titleFr || '';
  const unitTitle = lesson.unitPlan?.title || '';
  const lessonNumber = lesson.lessonNumber || 1;
  const expectations = lesson.expectations?.map((e: any) => e.expectation.code) || [];
  
  // Get subject-specific verbs and competencies
  const verbs = SUBJECT_VERBS[subject] || SUBJECT_VERBS['Français (Immersion)'];
  const competencies = COMPETENCIES[subject] || COMPETENCIES['Français (Immersion)'];
  
  // Determine lesson phase based on position in unit
  let verbSet = verbs.practice;
  if (lessonNumber <= 3) verbSet = verbs.intro;
  else if (lessonNumber >= 18) verbSet = verbs.mastery;
  
  // Extract concepts from title
  const concepts = extractConceptsFromTitle(title);
  
  // Generate three objectives
  const objectives: string[] = [];
  
  // Objective 1: Main concept/skill from title
  const verb1 = verbSet[lessonNumber % verbSet.length];
  const concept1 = concepts.main;
  const context1 = concepts.context ? ` ${concepts.context}` : '';
  objectives.push(`${verb1} ${concept1}${context1}`);
  
  // Objective 2: Application based on subject and unit context
  const applicationVerb = getApplicationVerb(title, subject);
  const applicationContext = getApplicationContext(title, unitTitle, subject);
  objectives.push(`${applicationVerb} ${applicationContext}`);
  
  // Objective 3: Competency development
  const competency = competencies[Math.floor((lessonNumber - 1) / 4) % competencies.length];
  const throughActivity = getThroughActivity(title, subject);
  objectives.push(`Développer ${competency} ${throughActivity}`);
  
  return objectives.join('; ');
}

// Get appropriate application verb based on lesson focus
function getApplicationVerb(title: string, subject: string): string {
  const titleLower = title.toLowerCase();
  
  // Activity-specific verbs
  if (titleLower.includes('projet')) return 'Réaliser';
  if (titleLower.includes('création') || titleLower.includes('créer')) return 'Créer';
  if (titleLower.includes('exploration') || titleLower.includes('explorer')) return 'Explorer';
  if (titleLower.includes('pratique') || titleLower.includes('pratiquer')) return 'Pratiquer';
  if (titleLower.includes('jeu') || titleLower.includes('jouer')) return 'Participer à';
  if (titleLower.includes('histoire') || titleLower.includes('conte')) return 'Raconter';
  if (titleLower.includes('chanson') || titleLower.includes('comptine')) return 'Chanter';
  if (titleLower.includes('expérience') || titleLower.includes('expérimenter')) return 'Expérimenter avec';
  if (titleLower.includes('observation') || titleLower.includes('observer')) return 'Observer';
  if (titleLower.includes('présentation') || titleLower.includes('présenter')) return 'Présenter';
  
  // Subject defaults
  const subjectDefaults: Record<string, string> = {
    'Français (Immersion)': 'Utiliser',
    'Mathématiques': 'Appliquer',
    'Sciences de la nature': 'Expérimenter avec',
    'Sciences humaines': 'Participer à',
    'Arts visuels': 'Créer',
    'Formation personnelle et sociale': 'Pratiquer'
  };
  
  return subjectDefaults[subject] || 'Appliquer';
}

// Get application context based on lesson and unit
function getApplicationContext(title: string, unitTitle: string, subject: string): string {
  const titleLower = title.toLowerCase();
  const unitLower = unitTitle.toLowerCase();
  
  // Specific contexts based on keywords
  if (titleLower.includes('nombres')) return 'des stratégies de comptage efficaces';
  if (titleLower.includes('lettres')) return 'la formation correcte des lettres';
  if (titleLower.includes('sons')) return 'la discrimination auditive des sons';
  if (titleLower.includes('mots')) return 'le vocabulaire thématique en contexte';
  if (titleLower.includes('addition')) return 'des stratégies d\'addition variées';
  if (titleLower.includes('soustraction')) return 'des méthodes de soustraction concrètes';
  if (titleLower.includes('formes')) return 'la reconnaissance des formes géométriques';
  if (titleLower.includes('mesure')) return 'des outils de mesure non standard';
  if (titleLower.includes('couleurs')) return 'des techniques de mélange de couleurs';
  if (titleLower.includes('motifs')) return 'des séquences répétitives créatives';
  if (titleLower.includes('animaux')) return 'les caractéristiques des êtres vivants';
  if (titleLower.includes('plantes')) return 'les besoins essentiels des plantes';
  if (titleLower.includes('saisons')) return 'les changements saisonniers observables';
  if (titleLower.includes('famille')) return 'les rôles familiaux avec respect';
  if (titleLower.includes('émotions')) return 'des stratégies de gestion émotionnelle';
  if (titleLower.includes('sécurité')) return 'les règles de sécurité essentielles';
  
  // Unit-based contexts
  if (unitLower.includes('bienvenue')) return 'les routines de classe en français';
  if (unitLower.includes('automne')) return 'les observations automnales';
  if (unitLower.includes('hiver')) return 'les phénomènes hivernaux';
  if (unitLower.includes('printemps')) return 'les transformations printanières';
  
  // Subject defaults
  const subjectDefaults: Record<string, string> = {
    'Français (Immersion)': 'les compétences langagières fondamentales',
    'Mathématiques': 'les concepts mathématiques de base',
    'Sciences de la nature': 'la méthode d\'investigation scientifique',
    'Sciences humaines': 'les interactions sociales positives',
    'Arts visuels': 'les techniques artistiques appropriées',
    'Formation personnelle et sociale': 'les habiletés de vie quotidienne'
  };
  
  return subjectDefaults[subject] || 'les apprentissages ciblés';
}

// Get activity context for competency development
function getThroughActivity(title: string, subject: string): string {
  const titleLower = title.toLowerCase();
  
  // Activity-based contexts
  if (titleLower.includes('jeu')) return 'par le jeu dirigé';
  if (titleLower.includes('histoire') || titleLower.includes('conte')) return 'par la narration';
  if (titleLower.includes('chanson') || titleLower.includes('comptine')) return 'par les activités musicales';
  if (titleLower.includes('création') || titleLower.includes('projet')) return 'par la création personnelle';
  if (titleLower.includes('équipe') || titleLower.includes('groupe')) return 'par le travail collaboratif';
  if (titleLower.includes('exploration')) return 'par l\'exploration guidée';
  if (titleLower.includes('pratique')) return 'par la pratique structurée';
  if (titleLower.includes('expérience')) return 'par l\'expérimentation active';
  if (titleLower.includes('observation')) return 'par l\'observation attentive';
  if (titleLower.includes('présentation')) return 'par le partage des apprentissages';
  if (titleLower.includes('célébration')) return 'par la célébration collective';
  
  // Subject-specific defaults
  const subjectDefaults: Record<string, string> = {
    'Français (Immersion)': 'par des activités langagières variées',
    'Mathématiques': 'par la manipulation et le raisonnement',
    'Sciences de la nature': 'par l\'investigation scientifique',
    'Sciences humaines': 'par l\'interaction sociale',
    'Arts visuels': 'par l\'expression créative',
    'Formation personnelle et sociale': 'par des situations authentiques'
  };
  
  return subjectDefaults[subject] || 'par des activités engageantes';
}

async function generateAllSmartObjectives() {
  console.log('🧠 GENERATING SMART LEARNING OBJECTIVES\n');
  
  // Get all lessons needing objectives
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
  
  console.log(`📚 Processing ${lessonsToUpdate.length} lessons\n`);
  
  const updates: { id: string; objectives: string }[] = [];
  let currentUnit = '';
  let unitCount = 0;
  
  for (const lesson of lessonsToUpdate) {
    const unitTitle = lesson.unitPlan?.title || '';
    
    // Track progress by unit
    if (unitTitle !== currentUnit) {
      currentUnit = unitTitle;
      unitCount++;
      if (unitCount % 10 === 0) {
        console.log(`  ✅ Processed ${unitCount} units...`);
      }
    }
    
    const objectives = generateSmartObjectives(lesson);
    updates.push({
      id: lesson.id,
      objectives: objectives
    });
  }
  
  // Save to JSON
  const outputPath = path.join(process.cwd(), 'smart-objectives.json');
  fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2));
  
  console.log(`\n💾 Generated ${updates.length} smart objectives`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\n📋 Next: Run 'npx tsx apply-smart-objectives.ts'`);
  
  await prisma.$disconnect();
}

generateAllSmartObjectives()
  .then(() => {
    console.log('\n✅ Smart generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Generation failed:', error);
    process.exit(1);
  });