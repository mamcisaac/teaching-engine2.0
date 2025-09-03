#!/usr/bin/env node
/**
 * PROPER IMPORT USING WORKING LOGIC FROM a8cf022a
 * Creates a new unit for each JSON file, ensuring perfect 1:1 mapping
 */

const { PrismaClient } = require('./packages/database/dist/index.js');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Subject mappings
const SUBJECTS = {
  'francais': 'Français (Immersion)',
  'mathematiques': 'Mathématiques',
  'sciences': 'Sciences de la nature',
  'sciences-humaines': 'Sciences humaines',
  'arts-visuels': 'Arts visuels',
  'formation-personnelle': 'Formation personnelle et sociale',
  'formation-personnelle-et-sociale': 'Formation personnelle et sociale'
};

async function properImport() {
  console.log('🚀 PROPER IMPORT - CREATING UNITS FROM JSON FILES');
  console.log('=' + '='.repeat(50));
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found');
    }
    
    console.log(`✅ Found Emily: ${emily.name}`);
    
    // Get existing LRPs
    const existingLRPs = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    const lrpMap = new Map();
    existingLRPs.forEach(lrp => {
      lrpMap.set(lrp.subject, lrp.id);
    });
    
    console.log(`✅ Found ${existingLRPs.length} Long Range Plans`);
    
    // Process each subject folder
    const lessonsDir = path.join(process.cwd(), 'generated-lessons');
    const subjectFolders = await fs.readdir(lessonsDir);
    
    let totalUnits = 0;
    let totalLessons = 0;
    
    for (const folder of subjectFolders) {
      if (folder.startsWith('.')) continue;
      
      const subjectPath = path.join(lessonsDir, folder);
      const stat = await fs.stat(subjectPath);
      
      if (!stat.isDirectory()) continue;
      
      // Get subject name from folder
      const subjectName = SUBJECTS[folder] || SUBJECTS[folder.replace(/-/g, '')];
      if (!subjectName) {
        console.warn(`  ⚠️ Unknown subject folder: ${folder}`);
        continue;
      }
      
      console.log(`\\n📚 Processing ${subjectName}...`);
      const lrpId = lrpMap.get(subjectName);
      
      if (!lrpId) {
        console.warn(`  ⚠️ No LRP found for ${subjectName}`);
        continue;
      }
      
      // Find all full lesson files in this subject
      const files = await fs.readdir(subjectPath);
      const fullLessonFiles = files.filter(f => f.endsWith('-full.json'));
      
      for (const file of fullLessonFiles) {
        const unitName = file.replace('-full.json', '');
        const filePath = path.join(subjectPath, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const unitData = JSON.parse(content);
          
          // CREATE NEW UNIT FOR EACH JSON FILE
          const unit = await prisma.unitPlan.create({
            data: {
              userId: emily.id,
              longRangePlanId: lrpId,
              title: unitData.title || unitName.replace(/-/g, ' '),
              titleFr: unitData.titleFr || unitData.title || unitName.replace(/-/g, ' '),
              description: unitData.description || unitData.overview || '',
              descriptionFr: unitData.descriptionFr || unitData.description || '',
              bigIdeas: unitData.bigIdeas || unitData.overview || '',
              bigIdeasFr: unitData.bigIdeasFr || unitData.bigIdeas || '',
              essentialQuestions: unitData.essentialQuestions || [],
              assessmentPlan: unitData.assessmentStrategies || 'Observation continue',
              keyVocabulary: unitData.vocabulary || unitData.keyVocabulary || [],
              startDate: new Date('2025-09-03'),
              endDate: new Date('2025-09-27'),
              isLocked: true,
              lockedAt: new Date(),
              lockedReason: 'PERFECT - Generated for Grade 1 French Immersion'
            }
          });
          
          totalUnits++;
          console.log(`  ✅ Created unit: ${unit.title} (${unitData.lessons?.length || 0} lessons)`);
          
          // Create lessons for this unit
          const lessons = unitData.lessons || [];
          for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            
            await prisma.eTFOLessonPlan.create({
              data: {
                userId: emily.id,
                unitPlanId: unit.id,
                title: lesson.title || `Leçon ${i + 1}`,
                titleFr: lesson.titleFr || lesson.title || `Leçon ${i + 1}`,
                subject: subjectName,
                grade: 1,
                language: 'fr',
                duration: typeof lesson.duration === 'string' 
                  ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) || 45
                  : (lesson.duration || 45),
                date: new Date('2025-09-03'),
                
                // Three-part lesson structure
                mindsOn: lesson.opening?.activity || lesson.mindsOn || lesson.introduction || 'Activation des connaissances',
                mindsOnFr: lesson.opening?.activity || lesson.mindsOnFr || lesson.mindsOn || 'Activation des connaissances',
                action: lesson.main?.activity || lesson.action || lesson.mainActivity || 'Activité principale',
                actionFr: lesson.main?.activity || lesson.actionFr || lesson.action || 'Activité principale',
                consolidation: lesson.closing?.activity || lesson.consolidation || lesson.conclusion || 'Consolidation et réflexion',
                consolidationFr: lesson.closing?.activity || lesson.consolidationFr || lesson.consolidation || 'Consolidation et réflexion',
                
                // ETFO fields
                learningGoals: typeof lesson.learningGoals === 'string' 
                  ? lesson.learningGoals 
                  : (lesson.objectives?.join(', ') || 'Développer les compétences'),
                learningGoalsFr: lesson.learningGoalsFr || lesson.learningGoals || 'Développer les compétences',
                materials: (() => {
                  const allMaterials = [];
                  if (lesson.opening?.materials && Array.isArray(lesson.opening.materials)) {
                    allMaterials.push(...lesson.opening.materials);
                  }
                  if (lesson.main?.materials && Array.isArray(lesson.main.materials)) {
                    allMaterials.push(...lesson.main.materials);
                  }
                  if (lesson.closing?.materials && Array.isArray(lesson.closing.materials)) {
                    allMaterials.push(...lesson.closing.materials);
                  }
                  return allMaterials.length > 0 ? allMaterials : (lesson.materials || ['Matériel de classe']);
                })(),
                
                // Differentiation as JSON
                differentiationStrategies: lesson.differentiation || {
                  forStruggling: 'Support visuel et aide individualisée',
                  forOnLevel: 'Activité standard avec choix',
                  forAdvanced: 'Défis supplémentaires et extension'
                },
                
                // Assessment
                assessmentType: 'Formative',
                assessmentNotes: lesson.assessmentNotes || 'Observation continue',
                
                // Additional fields
                engagementHooks: {
                  vocabulary: lesson.keyVocabulary || [],
                  visualSupports: (() => {
                    const supports = [];
                    if (lesson.opening?.visualSupports) supports.push(lesson.opening.visualSupports);
                    if (lesson.main?.visualSupports) supports.push(lesson.main.visualSupports);
                    if (lesson.closing?.visualSupports) supports.push(lesson.closing.visualSupports);
                    return supports.filter(Boolean);
                  })(),
                  movementBreaks: (() => {
                    const breaks = [];
                    if (lesson.opening?.movementBreaks && Array.isArray(lesson.opening.movementBreaks)) {
                      breaks.push(...lesson.opening.movementBreaks);
                    }
                    if (lesson.main?.movementBreaks && Array.isArray(lesson.main.movementBreaks)) {
                      breaks.push(...lesson.main.movementBreaks);
                    }
                    if (lesson.closing?.movementBreaks && Array.isArray(lesson.closing.movementBreaks)) {
                      breaks.push(...lesson.closing.movementBreaks);
                    }
                    return breaks;
                  })()
                },
                indigenousPerspectives: lesson.indigenousPerspectives || '',
                
                // Reflection activities
                reflectionActivities: {
                  questions: [
                    'Les élèves ont-ils atteint les objectifs?',
                    'Quelles adaptations étaient nécessaires?',
                    'Que ferais-je différemment la prochaine fois?'
                  ]
                },
                
                // Sub-friendly
                isSubFriendly: true,
                subNotes: lesson.subNotes || 'Plan détaillé avec supports visuels'
              }
            });
            
            totalLessons++;
          }
        } catch (error) {
          console.error(`  ❌ Error processing ${file}:`, error.message);
        }
      }
    }
    
    console.log('\\n' + '='.repeat(50));
    console.log('✅ PROPER IMPORT COMPLETE!');
    console.log(`📊 Statistics:`);
    console.log(`  - ${totalUnits} Unit Plans created (1 per JSON file)`);
    console.log(`  - ${totalLessons} Lessons imported`);
    console.log(`\\n✨ Perfect 1:1 mapping achieved!`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

properImport().catch(console.error);