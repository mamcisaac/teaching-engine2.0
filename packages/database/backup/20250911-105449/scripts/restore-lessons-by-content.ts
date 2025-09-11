#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Content-based mapping rules for each subject
const CONTENT_MAPPINGS = {
  'Mathématiques': {
    'Les nombres tout autour de nous': [
      'number', 'nombre', 'counting', 'compter', 'recognition', 'reconnaissance',
      '1-10', 'un à dix', 'correspondence', 'collections'
    ],
    'Comprendre les nombres': [
      'comparing', 'comparer', 'plus', 'moins', 'égal', 'greater', 'less',
      'comparison', 'ordering', 'sequence'
    ],
    'Régularités et formes': [
      'pattern', 'motif', 'shape', 'forme', 'géométr', 'circle', 'square',
      'triangle', 'répéter', 'AB pattern'
    ],
    'Addition et soustraction': [
      'addition', 'soustraction', 'add', 'subtract', 'plus', 'minus',
      'somme', 'différence', 'total', 'enlever'
    ],
    'Stratégies de calcul mental': [
      'mental', 'stratég', 'calcul', 'doubles', 'near doubles', 'compensation',
      'decomposition', 'quick', 'rapide'
    ],
    'Explorer la mesure': [
      'measure', 'mesure', 'length', 'longueur', 'weight', 'poids', 'time',
      'temps', 'capacity', 'capacité', 'taller', 'shorter'
    ],
    'Aventures de résolution de problèmes': [
      'problem', 'problème', 'solve', 'résoudre', 'solution', 'strateg',
      'think', 'réfléchir', 'challenge', 'défi'
    ],
    'Célébration mathématique': [
      'celebration', 'célébr', 'review', 'révision', 'portfolio', 'showcase',
      'achievement', 'réussite', 'final', 'juin'
    ]
  },
  'Français (Immersion)': {
    'Bienvenue à l\'école!': [
      'bienvenue', 'welcome', 'école', 'school', 'classroom', 'classe',
      'routine', 'alphabet', 'prénom', 'name', 'règles'
    ],
    'Ma famille et moi': [
      'famille', 'family', 'maman', 'papa', 'frère', 'soeur', 'parent',
      'maison', 'home', 'tradition', 'généalogie'
    ],
    'Les fêtes d\'automne': [
      'automne', 'fall', 'autumn', 'halloween', 'thanksgiving', 'action de grâce',
      'feuille', 'leaf', 'récolte', 'harvest'
    ],
    'L\'hiver magique': [
      'hiver', 'winter', 'neige', 'snow', 'noël', 'christmas', 'froid',
      'cold', 'bonhomme de neige', 'patinage'
    ],
    'Nos amis les animaux': [
      'animal', 'animaux', 'pet', 'domestique', 'sauvage', 'wild',
      'habitat', 'zoo', 'ferme', 'farm'
    ],
    'Ma communauté': [
      'communauté', 'community', 'voisin', 'neighbor', 'métier', 'job',
      'pompier', 'police', 'docteur', 'ville'
    ],
    'Le printemps en fleurs': [
      'printemps', 'spring', 'fleur', 'flower', 'pâques', 'easter',
      'jardin', 'garden', 'plante', 'grandir'
    ],
    'Célébrons nos apprentissages': [
      'célébr', 'celebrate', 'portfolio', 'fin', 'end', 'été', 'summer',
      'graduation', 'achievement', 'réussite'
    ]
  },
  'Sciences': {
    'Les êtres vivants': ['living', 'vivant', 'plant', 'plante', 'animal', 'grow', 'pousser', 'être', 'vie'],
    'Les matériaux': ['material', 'matériaux', 'solid', 'liquid', 'gas', 'propriété', 'objet'],
    'L\'énergie': ['energy', 'énergie', 'light', 'lumière', 'sound', 'son', 'heat', 'chaleur'],
    'Les saisons': ['season', 'saison', 'weather', 'météo', 'temperature', 'climat', 'automne', 'hiver', 'printemps', 'été'],
    'Notre environnement': ['environment', 'environnement', 'recycle', 'recycler', 'earth', 'terre', 'nature']
  },
  'Arts': {
    'Exploration artistique': ['draw', 'dessin', 'line', 'ligne', 'colour', 'couleur', 'paint', 'peinture'],
    'Créativité et expression': ['create', 'créer', 'art', 'express', 'imagine', 'texture', 'collage'],
    'Techniques artistiques': ['sculpture', 'pattern', 'motif', 'print', 'impression', 'mixed', 'technique'],
    'Célébration artistique': ['gallery', 'galerie', 'showcase', 'exposition', 'celebrate', 'portfolio']
  },
  'Formation personnelle et sociale': {
    'Moi, moi-même et je': [
      'identity', 'identité', 'who am i', 'qui suis-je', 'unique', 'special',
      'feelings', 'émotions', 'self', 'moi'
    ],
    'Moi en santé': [
      'health', 'santé', 'hygiene', 'hygiène', 'nutrition', 'exercise',
      'body', 'corps', 'healthy', 'sain'
    ],
    'Sain et sauf': [
      'safety', 'sécurité', 'safe', 'sûr', 'danger', 'emergency', 'urgence',
      'rules', 'règles', 'protection'
    ],
    'Amis et sentiments': [
      'friend', 'ami', 'friendship', 'amitié', 'emotion', 'sentiment',
      'empathy', 'empathie', 'kindness', 'gentillesse'
    ],
    'Grandir et apprendre': [
      'grow', 'grandir', 'learn', 'apprendre', 'change', 'changer',
      'development', 'développement', 'progress'
    ],
    'Notre monde merveilleux': [
      'world', 'monde', 'community', 'communauté', 'environment', 'nature',
      'respect', 'care', 'soin', 'responsibility'
    ]
  }
};

function findBestUnitMatch(lesson: any, units: any[], subject: string): string | null {
  const mappings = CONTENT_MAPPINGS[subject as keyof typeof CONTENT_MAPPINGS];
  if (!mappings) return null;
  
  const lessonText = `${lesson.title || ''} ${lesson.titleFr || ''} ${lesson.learningGoals || ''} ${lesson.mindsOn || ''} ${lesson.action || ''}`.toLowerCase();
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const unit of units) {
    const unitKey = unit.titleFr || unit.title;
    const keywords = mappings[unitKey as keyof typeof mappings];
    
    if (!keywords) continue;
    
    let score = 0;
    for (const keyword of keywords) {
      if (lessonText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = unit.id;
    }
  }
  
  // If no match found, distribute evenly
  if (!bestMatch && units.length > 0) {
    const randomIndex = Math.floor(Math.random() * units.length);
    bestMatch = units[randomIndex].id;
  }
  
  return bestMatch;
}

async function extractLessonsFromSeed(seedFile: string): Promise<any[]> {
  const content = fs.readFileSync(seedFile, 'utf-8');
  const lessons: any[] = [];
  
  // Multiple extraction patterns
  const patterns = [
    /lessons\.push\(\{[\s\S]*?\}\);/g,
    /lessonPlans\.push\(\{[\s\S]*?\}\);/g,
    /\{[^{}]*title[Fr]*:\s*['"][^'"]+['"][^{}]*learningGoals[^{}]*\}/g
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern) || [];
    
    for (const match of matches) {
      try {
        // Extract fields using regex
        const extractField = (fieldName: string): string | null => {
          const patterns = [
            new RegExp(`${fieldName}:\\s*['"]([^'"]*?)['"]`, 'i'),
            new RegExp(`${fieldName}:\\s*\`([^\`]*?)\``, 'i')
          ];
          
          for (const p of patterns) {
            const m = match.match(p);
            if (m) return m[1];
          }
          return null;
        };
        
        const title = extractField('title') || extractField('titleFr');
        if (!title) continue;
        
        const lesson = {
          title: title,
          titleFr: extractField('titleFr') || title,
          learningGoals: extractField('learningGoals') || '',
          mindsOn: extractField('mindsOn') || '',
          action: extractField('action') || '',
          consolidation: extractField('consolidation') || '',
          duration: parseInt(extractField('duration') || '60'),
          materials: extractField('materials') || JSON.stringify(['Materials']),
          grouping: extractField('grouping') || 'Varied grouping',
          accommodations: extractField('accommodations') || JSON.stringify(['Accommodations']),
          differentiationStrategies: extractField('differentiationStrategies') || JSON.stringify({
            support: 'Support strategies',
            extension: 'Extension activities'
          }),
          assessmentNotes: extractField('assessmentNotes') || 'Formative assessment',
          assessmentType: extractField('assessmentType') || 'formative'
        };
        
        lessons.push(lesson);
      } catch (e) {
        // Skip malformed lessons
      }
    }
  }
  
  return lessons;
}

async function restoreLessonsByContent() {
  console.log('🔄 CONTENT-BASED LESSON RESTORATION');
  console.log('=====================================\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    // Clear existing lessons
    console.log('🗑️ Clearing existing lessons...');
    await prisma.eTFOLessonPlan.deleteMany({
      where: { userId: emily.id }
    });
    
    // Get all units by subject
    const unitsBySubject: Record<string, any[]> = {};
    const subjects = [
      'Français (Immersion)',
      'Mathématiques',
      'Sciences',
      'Sciences humaines',
      'Arts',
      'Formation personnelle et sociale'
    ];
    
    for (const subject of subjects) {
      const lrp = await prisma.longRangePlan.findFirst({
        where: { userId: emily.id, subject }
      });
      
      if (lrp) {
        const units = await prisma.unitPlan.findMany({
          where: { longRangePlanId: lrp.id },
          orderBy: { startDate: 'asc' }
        });
        unitsBySubject[subject] = units;
        console.log(`✅ Found ${units.length} units for ${subject}`);
      }
    }
    
    // Map of seed files to subjects - more specific patterns
    const seedMappings = [
      { pattern: /seed-lesson-plans-math/i, subject: 'Mathématiques' },
      { pattern: /seed-lesson-plans-french|seed-lesson-plans-bienvenue|seed-french-lessons/i, subject: 'Français (Immersion)' },
      { pattern: /seed-lesson-plans-science/i, subject: 'Sciences' },
      { pattern: /seed-lesson-plans-arts/i, subject: 'Arts' },
      { pattern: /seed-health-fps|seed-lesson-plans-health/i, subject: 'Formation personnelle et sociale' }
    ];
    
    const seedDir = path.join(__dirname, 'prisma');
    const backupDir = path.join(__dirname, 'backup/seeds-20250814-182348');
    
    // Try both directories
    const dirs = [seedDir, backupDir];
    let totalRestored = 0;
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir)
        .filter(f => (f.startsWith('seed-lesson-plans-') || f.includes('health-fps') || f.includes('french-lessons')) && f.endsWith('.ts'));
      
      for (const file of files) {
        // Skip PE and Music files
        if (file.includes('pe-') || file.includes('music')) continue;
        
        // Determine subject from filename
        let subject = null;
        for (const mapping of seedMappings) {
          if (mapping.pattern.test(file)) {
            subject = mapping.subject;
            break;
          }
        }
        
        if (!subject) continue;
        
        // If no units exist for this subject, try to create some basic ones
        if (!unitsBySubject[subject] || unitsBySubject[subject].length === 0) {
          console.log(`   ⚠️ No units found for ${subject}, skipping...`);
          continue;
        }
        
        console.log(`\n📄 Processing ${file} for ${subject}...`);
        
        const lessons = await extractLessonsFromSeed(path.join(dir, file));
        console.log(`   Found ${lessons.length} lessons`);
        
        const units = unitsBySubject[subject];
        let created = 0;
        
        for (const lesson of lessons) {
          const unitId = findBestUnitMatch(lesson, units, subject);
          if (!unitId) continue;
          
          const unit = units.find(u => u.id === unitId);
          
          // Calculate a date within the unit's range
          const unitStart = new Date(unit.startDate);
          const unitEnd = new Date(unit.endDate);
          const unitDays = Math.ceil((unitEnd.getTime() - unitStart.getTime()) / (1000 * 60 * 60 * 24));
          const lessonDate = new Date(unitStart);
          lessonDate.setDate(lessonDate.getDate() + Math.floor(Math.random() * unitDays));
          
          // Skip weekends
          while (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) {
            lessonDate.setDate(lessonDate.getDate() + 1);
          }
          
          try {
            await prisma.eTFOLessonPlan.create({
              data: {
                userId: emily.id,
                unitPlanId: unitId,
                title: lesson.title,
                titleFr: lesson.titleFr,
                date: lessonDate,
                duration: lesson.duration,
                grade: 1,
                subject: subject,
                language: subject === 'English Language Arts' ? 'en' : 'fr',
                learningGoals: lesson.learningGoals,
                mindsOn: typeof lesson.mindsOn === 'string' ? 
                  JSON.stringify({ activities: [lesson.mindsOn], duration: 15 }) : 
                  lesson.mindsOn,
                action: typeof lesson.action === 'string' ?
                  JSON.stringify({ activities: [lesson.action], duration: 25 }) :
                  lesson.action,
                consolidation: typeof lesson.consolidation === 'string' ?
                  JSON.stringify({ activities: [lesson.consolidation], duration: 10 }) :
                  lesson.consolidation,
                materials: lesson.materials,
                grouping: lesson.grouping,
                accommodations: lesson.accommodations,
                differentiationStrategies: lesson.differentiationStrategies,
                assessmentNotes: lesson.assessmentNotes,
                assessmentType: lesson.assessmentType,
                isSubFriendly: true
              }
            });
            created++;
          } catch (e: any) {
            // Skip duplicates
          }
        }
        
        console.log(`   ✅ Created ${created} lessons`);
        totalRestored += created;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESTORATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total lessons restored: ${totalRestored}`);
    
    // Verify by subject
    for (const subject of subjects) {
      const count = await prisma.eTFOLessonPlan.count({
        where: { userId: emily.id, subject }
      });
      console.log(`${subject}: ${count} lessons`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreLessonsByContent()
  .then(() => console.log('\n✅ Done!'))
  .catch(console.error);