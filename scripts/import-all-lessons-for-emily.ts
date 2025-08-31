#!/usr/bin/env tsx
/**
 * Import all 977 lessons for Emily's Grade 1 French Immersion Class
 * This script loads all lessons from the generated-lessons folder
 * and creates proper database records for Emily
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

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

async function importAllLessons() {
  console.log('🚀 Starting comprehensive lesson import for Emily McIsaac');
  console.log('=' + '='.repeat(60));
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s account not found! Please run seed first.');
    }
    
    console.log(`✅ Found Emily: ${emily.name} (${emily.email})`);
    
    // Update Emily's language preference to French
    await prisma.user.update({
      where: { id: emily.id },
      data: { 
        preferredLanguage: 'fr',
        grade: '1',
        program: 'French Immersion'
      }
    });
    console.log('✅ Updated Emily\'s language to French');
    
    // Create subjects for Emily if they don't exist
    for (const [key, name] of Object.entries(SUBJECTS)) {
      const existing = await prisma.subject.findFirst({
        where: { 
          userId: emily.id,
          name: name
        }
      });
      
      if (!existing) {
        await prisma.subject.create({
          data: {
            name: name,
            nameFr: name,
            nameEn: name.replace('(Immersion)', '(Immersion)'),
            userId: emily.id
          }
        });
        console.log(`  ✅ Created subject: ${name}`);
      }
    }
    
    // Clear existing data to start fresh
    console.log('\n🧹 Clearing existing curriculum data...');
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: emily.id } });
    await prisma.unitPlan.deleteMany({ where: { userId: emily.id } });
    await prisma.longRangePlan.deleteMany({ where: { userId: emily.id } });
    
    // Create Long Range Plans (one per subject)
    console.log('\n📅 Creating Long Range Plans...');
    const lrpMap = new Map();
    
    for (const [key, subjectName] of Object.entries(SUBJECTS)) {
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: emily.id,
          title: `Plan annuel - ${subjectName}`,
          titleFr: `Plan annuel - ${subjectName}`,
          subject: subjectName,
          grade: 1,
          academicYear: '2025-2026',
          term: 'Full Year',
          goals: `Développer les compétences en ${subjectName} pour les élèves de 1re année`,
          goalsFr: `Développer les compétences en ${subjectName} pour les élèves de 1re année`,
          description: `Comprehensive ${subjectName} program for Grade 1 French Immersion`,
          descriptionFr: `Programme complet de ${subjectName} pour l'immersion française de 1re année`,
          overarchingQuestions: `Comment pouvons-nous explorer ${subjectName} en français?`,
          assessmentOverview: 'Observation, Conversation, Produit - Triangulation des preuves',
          resourceNeeds: 'Ressources approuvées par le MEO et l\'ÎPÉ',
          professionalGoals: 'Développer l\'expertise en enseignement différencié'
        }
      });
      lrpMap.set(subjectName, lrp.id);
      console.log(`  ✅ Created LRP: ${lrp.title}`);
    }
    
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
      
      console.log(`\n📚 Processing ${subjectName}...`);
      const lrpId = lrpMap.get(subjectName);
      
      // Find all full lesson files in this subject
      const files = await fs.readdir(subjectPath);
      const fullLessonFiles = files.filter(f => f.endsWith('-full.json'));
      
      for (const file of fullLessonFiles) {
        const unitName = file.replace('-full.json', '');
        const filePath = path.join(subjectPath, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const unitData = JSON.parse(content);
          
          // Create Unit Plan
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
          console.log(`  ✅ Created unit: ${unit.title}`);
          
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
                
                // Three-part lesson structure - mapped from rich source content
                mindsOn: lesson.opening?.activity || lesson.mindsOn || lesson.introduction || 'Activation des connaissances',
                mindsOnFr: lesson.opening?.activity || lesson.mindsOnFr || lesson.mindsOn || 'Activation des connaissances',
                action: lesson.main?.activity || lesson.action || lesson.mainActivity || 'Activité principale',
                actionFr: lesson.main?.activity || lesson.actionFr || lesson.action || 'Activité principale',
                consolidation: lesson.closing?.activity || lesson.consolidation || lesson.conclusion || 'Consolidation et réflexion',
                consolidationFr: lesson.closing?.activity || lesson.consolidationFr || lesson.consolidation || 'Consolidation et réflexion',
                
                // ETFO fields - mapped from rich source content
                learningGoals: lesson.oneGoal || (typeof lesson.learningGoals === 'string' 
                  ? lesson.learningGoals 
                  : (lesson.objectives?.join(', ') || 'Développer les compétences en français')),
                learningGoalsFr: lesson.oneGoal || lesson.learningGoalsFr || lesson.learningGoals || 'Développer les compétences en français',
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
                
                // Additional fields - mapped from rich source content
                engagementHooks: {
                  vocabulary: lesson.keyVocabulary || [],
                  visualSupports: [
                    lesson.opening?.visualSupports,
                    lesson.main?.visualSupports,
                    lesson.closing?.visualSupports
                  ].filter(Boolean),
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
                  })(),
                  decisionPoints: (() => {
                    const points = [];
                    if (lesson.opening?.decisionPoints && Array.isArray(lesson.opening.decisionPoints)) {
                      points.push(...lesson.opening.decisionPoints);
                    }
                    if (lesson.main?.decisionPoints && Array.isArray(lesson.main.decisionPoints)) {
                      points.push(...lesson.main.decisionPoints);
                    }
                    if (lesson.closing?.decisionPoints && Array.isArray(lesson.closing.decisionPoints)) {
                      points.push(...lesson.closing.decisionPoints);
                    }
                    return points;
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
    
    // Create curriculum expectations if they don't exist
    const expectationCount = await prisma.curriculumExpectation.count();
    if (expectationCount < 50) {
      console.log('\n📋 Creating PEI curriculum expectations...');
      await createCurriculumExpectations();
    }
    
    // Create students for Emily's class
    console.log('\n👥 Creating Grade 1 students...');
    await createStudents(emily.id);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT COMPLETE!');
    console.log(`📊 Statistics:`);
    console.log(`  - ${Object.keys(SUBJECTS).length} subjects configured`);
    console.log(`  - ${lrpMap.size} Long Range Plans created`);
    console.log(`  - ${totalUnits} Unit Plans imported`);
    console.log(`  - ${totalLessons} Lessons imported`);
    console.log(`\n🎉 Emily can now log in with:`);
    console.log(`  Email: emmcisaac@gmail.com`);
    console.log(`  Password: myhusbandisthebest`);
    console.log(`  Language: French`);
    console.log(`\n🏫 Ready for Grade 1 French Immersion at West Kent Elementary!`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createCurriculumExpectations() {
  // Sample PEI expectations for Grade 1
  const expectations = [
    // French
    { code: 'CO1.1', subject: 'Français (Immersion)', strand: 'Communication orale', 
      description: 'Écouter et répondre aux consignes simples', grade: 1 },
    { code: 'L1.1', subject: 'Français (Immersion)', strand: 'Lecture',
      description: 'Lire des textes simples avec vocabulaire familier', grade: 1 },
    { code: 'E1.1', subject: 'Français (Immersion)', strand: 'Écriture',
      description: 'Écrire des phrases simples', grade: 1 },
    
    // Math
    { code: 'N1.1', subject: 'Mathématiques', strand: 'Numération',
      description: 'Compter jusqu\'à 100', grade: 1 },
    { code: 'M1.1', subject: 'Mathématiques', strand: 'Mesure',
      description: 'Comparer des longueurs', grade: 1 },
    
    // Science
    { code: 'SV1.1', subject: 'Sciences de la nature', strand: 'Systèmes vivants',
      description: 'Identifier les caractéristiques des êtres vivants', grade: 1 },
    
    // Social Studies  
    { code: 'SH1.1', subject: 'Sciences humaines', strand: 'Communauté',
      description: 'Décrire sa famille et sa communauté', grade: 1 },
    
    // Arts
    { code: 'AV1.1', subject: 'Arts visuels', strand: 'Création',
      description: 'Explorer les éléments de base des arts visuels', grade: 1 },
    
    // Health
    { code: 'FPS1.1', subject: 'Formation personnelle et sociale', strand: 'Bien-être',
      description: 'Identifier les émotions de base', grade: 1 }
  ];
  
  for (const exp of expectations) {
    // Check if expectation already exists
    const existing = await prisma.curriculumExpectation.findFirst({
      where: { code: exp.code }
    });
    
    if (!existing) {
      await prisma.curriculumExpectation.create({
        data: {
          code: exp.code,
          subject: exp.subject,
          strand: exp.strand,
          strandFr: exp.strand,
          description: exp.description,
          descriptionFr: exp.description,
          grade: exp.grade
        }
      });
    }
  }
  console.log(`  ✅ Created ${expectations.length} curriculum expectations`);
}

async function createStudents(teacherId: number) {
  // First, clear existing students for this teacher
  await prisma.student.deleteMany({
    where: { userId: teacherId }
  });
  
  const students = [
    { firstName: 'Amélie', lastName: 'Bouchard', notes: 'Strong oral communication in French' },
    { firstName: 'Xavier', lastName: 'Leblanc', notes: 'Excels in mathematics, visual learner' },
    { firstName: 'Sophie', lastName: 'Martin', notes: 'Creative, enjoys arts and storytelling' },
    { firstName: 'Luc', lastName: 'Dubois', notes: 'Kinesthetic learner, active in PE' },
    { firstName: 'Émilie', lastName: 'Tremblay', notes: 'IEP for reading support' },
    { firstName: 'Noah', lastName: 'Gauthier', notes: 'English as additional language' },
    { firstName: 'Chloé', lastName: 'Roy', notes: 'Advanced reader' },
    { firstName: 'Thomas', lastName: 'Bergeron', notes: 'Collaborative learner' },
    { firstName: 'Olivia', lastName: 'Lavoie', notes: 'Musical aptitude' },
    { firstName: 'Gabriel', lastName: 'Fortin', notes: 'Curious about science' }
  ];
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    await prisma.student.create({
      data: {
        userId: teacherId,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: `WK${String(i + 1).padStart(3, '0')}`,
        grade: 1,
        program: 'French Immersion',
        homeroom: '1A',
        hasIEP: student.notes?.includes('IEP') || false,
        notes: student.notes,
        enrollmentDate: new Date('2025-09-03'),
        isActive: true,
        status: 'active'
      }
    });
  }
  console.log(`  ✅ Created ${students.length} Grade 1 students`);
}

// Run the import
importAllLessons().catch(console.error);