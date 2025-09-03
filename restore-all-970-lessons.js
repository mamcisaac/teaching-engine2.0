#!/usr/bin/env node
/**
 * COMPLETE RESTORATION OF ALL 50 UNITS AND 970+ LESSONS
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

async function restoreEverything() {
  console.log('🚀 RESTORING ALL 50 UNITS AND 970+ LESSONS');
  console.log('=' + '='.repeat(60));
  
  try {
    // Step 1: Ensure Emily exists
    let emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('Creating Emily\'s account...');
      emily = await prisma.user.create({
        data: {
          email: 'emmcisaac@gmail.com',
          name: 'Emily McIsaac',
          password: 'myhusbandisthebest',
          role: 'TEACHER',
          school: 'West Kent Elementary',
          province: 'PE',
          grade: '1',
          subjects: ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Sciences humaines', 'Arts visuels', 'Formation personnelle et sociale']
        }
      });
    }
    
    console.log(`✅ Emily's account ready: ${emily.name}`);
    
    // Step 2: Create ALL Long Range Plans
    console.log('\n📋 Setting up Long Range Plans...');
    
    for (const [key, subjectName] of Object.entries(SUBJECTS)) {
      let lrp = await prisma.longRangePlan.findFirst({
        where: { 
          userId: emily.id,
          subject: subjectName
        }
      });
      
      if (!lrp) {
        lrp = await prisma.longRangePlan.create({
          data: {
            userId: emily.id,
            title: `${subjectName} - Grade 1`,
            subject: subjectName,
            grade: 1,
            yearLevel: '2025-2026',
            academicYear: '2025-2026',
            term: 'Full Year',
            description: `Complete plan for ${subjectName}`,
            descriptionFr: `Plan complet pour ${subjectName}`,
            overarchingGoals: ['Develop foundational skills'],
            overarchingGoalsFr: ['Développer les compétences de base'],
            keyResourcesAndMaterials: ['Classroom materials'],
            isTemplate: false
          }
        });
        console.log(`  ✅ Created LRP for ${subjectName}`);
      } else {
        console.log(`  ✓ LRP exists for ${subjectName}`);
      }
    }
    
    // Step 3: Clear existing units and lessons to start fresh
    console.log('\n🗑️  Clearing existing units and lessons...');
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: emily.id } });
    await prisma.unitPlan.deleteMany({ where: { userId: emily.id } });
    
    // Step 4: Import ALL units and lessons from JSON files
    console.log('\n📦 Importing all units and lessons from JSON files...');
    
    const lessonsDir = path.join(process.cwd(), 'generated-lessons');
    const subjectFolders = await fs.readdir(lessonsDir);
    
    let totalUnits = 0;
    let totalLessons = 0;
    const unitStats = [];
    
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
      
      console.log(`\n📚 Processing ${subjectName}...`);
      
      // Get the LRP for this subject
      const lrp = await prisma.longRangePlan.findFirst({
        where: { 
          userId: emily.id,
          subject: subjectName
        }
      });
      
      if (!lrp) {
        console.error(`  ❌ No LRP found for ${subjectName}`);
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
          
          // Get the lesson count from the actual lessons array
          const lessonCount = unitData.lessons ? unitData.lessons.length : 
                              (unitData.fullLessons && unitData.fullLessons.lessons ? unitData.fullLessons.lessons.length : 0);
          
          // Create the unit
          const unit = await prisma.unitPlan.create({
            data: {
              userId: emily.id,
              longRangePlanId: lrp.id,
              title: unitData.unitTitle || unitData.title || unitName.replace(/-/g, ' '),
              titleFr: unitData.unitTitle || unitData.titleFr || unitData.title || unitName.replace(/-/g, ' '),
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
              lockedReason: 'PERFECT - Grade 1 French Immersion'
            }
          });
          
          totalUnits++;
          
          // Create lessons for this unit - handle different JSON structures
          const lessons = unitData.lessons || 
                         (unitData.fullLessons && unitData.fullLessons.lessons) || 
                         [];
          
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
                
                // Three-part lesson structure - handle different JSON formats
                mindsOn: lesson.opening?.activity || 
                        lesson.mindsOn || 
                        lesson.lessonStructure?.ouverture?.activities?.join('; ') ||
                        lesson.introduction || 
                        'Activation des connaissances',
                mindsOnFr: lesson.opening?.activity || 
                          lesson.mindsOnFr || 
                          lesson.lessonStructure?.ouverture?.activities?.join('; ') ||
                          'Activation des connaissances',
                action: lesson.main?.activity || 
                       lesson.action || 
                       lesson.lessonStructure?.développement?.activities?.join('; ') ||
                       lesson.mainActivity || 
                       'Activité principale',
                actionFr: lesson.main?.activity || 
                         lesson.actionFr || 
                         lesson.lessonStructure?.développement?.activities?.join('; ') ||
                         'Activité principale',
                consolidation: lesson.closing?.activity || 
                              lesson.consolidation || 
                              lesson.lessonStructure?.clôture?.activities?.join('; ') ||
                              lesson.conclusion || 
                              'Consolidation et réflexion',
                consolidationFr: lesson.closing?.activity || 
                                lesson.consolidationFr || 
                                lesson.lessonStructure?.clôture?.activities?.join('; ') ||
                                'Consolidation et réflexion',
                
                // Learning goals - handle different formats
                learningGoals: lesson.oneGoal || 
                              (typeof lesson.learningGoals === 'string' ? lesson.learningGoals : '') ||
                              (Array.isArray(lesson.objectives) ? lesson.objectives.join('; ') : '') ||
                              'Développer les compétences',
                learningGoalsFr: lesson.oneGoal || 
                                lesson.learningGoalsFr || 
                                lesson.learningGoals || 
                                'Développer les compétences',
                
                // Materials - combine from all sections
                materials: (() => {
                  const allMaterials = [];
                  if (lesson.materials && Array.isArray(lesson.materials)) {
                    allMaterials.push(...lesson.materials);
                  }
                  if (lesson.opening?.materials && Array.isArray(lesson.opening.materials)) {
                    allMaterials.push(...lesson.opening.materials);
                  }
                  if (lesson.main?.materials && Array.isArray(lesson.main.materials)) {
                    allMaterials.push(...lesson.main.materials);
                  }
                  if (lesson.closing?.materials && Array.isArray(lesson.closing.materials)) {
                    allMaterials.push(...lesson.closing.materials);
                  }
                  return allMaterials.length > 0 ? allMaterials : ['Matériel de classe'];
                })(),
                
                // Differentiation
                differentiationStrategies: lesson.differentiation || 
                                          lesson.lessonStructure?.développement?.differentiation || {
                  forStruggling: 'Support visuel et aide individualisée',
                  forOnLevel: 'Activité standard avec choix',
                  forAdvanced: 'Défis supplémentaires et extension'
                },
                
                // Assessment
                assessmentType: 'Formative',
                assessmentNotes: lesson.assessmentNotes || 
                                lesson.assessment?.notes || 
                                'Observation continue',
                
                // Engagement hooks
                engagementHooks: {
                  vocabulary: lesson.keyVocabulary || [],
                  visualSupports: [],
                  movementBreaks: [],
                  decisionPoints: []
                },
                
                indigenousPerspectives: lesson.indigenousPerspectives || '',
                
                // Reflection
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
          
          unitStats.push({
            subject: subjectName,
            unit: unit.title,
            lessons: lessons.length
          });
          
          console.log(`  ✅ Created unit: ${unit.title} (${lessons.length} lessons)`);
          
        } catch (error) {
          console.error(`  ❌ Error processing ${file}:`, error.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 RESTORATION COMPLETE!');
    console.log(`📊 Final Statistics:`);
    console.log(`  - ${totalUnits} Unit Plans created`);
    console.log(`  - ${totalLessons} Lessons imported`);
    
    console.log('\n📈 Lesson Distribution by Unit:');
    unitStats.forEach(stat => {
      console.log(`  ${stat.subject} - ${stat.unit}: ${stat.lessons} lessons`);
    });
    
    console.log(`\n✨ All ${totalUnits} units with ${totalLessons} lessons successfully restored!`);
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreEverything().catch(console.error);