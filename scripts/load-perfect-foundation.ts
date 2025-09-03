#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function loadPerfectFoundation() {
  console.log('🎯 LOADING PERFECT FOUNDATION: 50 Units + 975 Lessons');
  console.log('=====================================================');

  const EMILY_USER_ID = 23;

  try {
    // 0. First create Emily McIsaac user (required for foreign keys)
    console.log('👤 Creating Emily McIsaac user...');
    const emily = await prisma.user.upsert({
      where: { id: EMILY_USER_ID },
      update: {},
      create: {
        id: EMILY_USER_ID,
        email: 'emmcisaac@gmail.com',
        name: 'Emily McIsaac',
        password: 'password123', // Will be hashed later if needed
        role: 'teacher',
        preferredLanguage: 'en'
      }
    });
    console.log('✅ Emily user created/verified');

    // 1. Load Long Range Plans (required for foreign keys)
    console.log('📋 Loading Long Range Plans...');
    const lrpsPath = path.join(__dirname, '../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/perfect-long-range-plans.json');
    const lrpsData = JSON.parse(fs.readFileSync(lrpsPath, 'utf8'));
    
    for (const lrp of lrpsData) {
      const cleanLrp = {
        id: lrp.id,
        userId: lrp.userId,
        title: lrp.title,
        academicYear: lrp.academicYear,
        term: lrp.term,
        grade: lrp.grade,
        subject: lrp.subject,
        description: lrp.description,
        goals: lrp.goals,
        themes: lrp.themes,
        overarchingQuestions: lrp.overarchingQuestions,
        assessmentOverview: lrp.assessmentOverview,
        resourceNeeds: lrp.resourceNeeds,
        professionalGoals: lrp.professionalGoals,
        titleFr: lrp.titleFr,
        descriptionFr: lrp.descriptionFr,
        goalsFr: lrp.goalsFr,
        createdAt: new Date(lrp.createdAt),
        updatedAt: new Date(lrp.updatedAt)
      };
      
      await prisma.longRangePlan.upsert({
        where: { id: lrp.id },
        update: cleanLrp,
        create: cleanLrp
      });
    }
    
    console.log(`✅ Loaded ${lrpsData.length} Long Range Plans`);
    
    // 2. Load the 50 perfect unit plans from backup
    console.log('📚 Loading 50 strategically perfect unit plans...');
    const unitsPath = path.join(__dirname, '../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json');
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));
    
    console.log(`Found ${unitsData.length} unit plans in backup`);
    
    // 3. Calculate proper hours for each unit
    // Based on CLAUDE.md: 975 lessons total, distributed across units
    // Health/FPS: 73 hours (5 units: 16+15+15+14+13 = 73 hours)
    // Other subjects: remaining hours distributed
    
    const subjectHoursDistribution = {
      'Français (Immersion)': 146.25, // 195 lessons × 45 min = 146.25 hours
      'Mathématiques': 146.25,        // 195 lessons × 45 min = 146.25 hours  
      'Sciences de la nature': 146.25, // 195 lessons × 45 min = 146.25 hours
      'Arts visuels': 146.25,         // 195 lessons × 45 min = 146.25 hours
      'Sciences humaines': 72.75,     // 97 lessons × 45 min = 72.75 hours
      'Formation personnelle et sociale': 73.5 // 98 lessons × 45 min = 73.5 hours
    };
    
    // 4. Process and load units with calculated hours
    let totalHours = 0;
    let processedUnits = 0;
    
    for (const unit of unitsData) {
      // Get subject from longRangePlan
      const subject = unit.longRangePlan?.subject || 'Unknown';
      const subjectTotalHours = subjectHoursDistribution[subject] || 0;
      
      // Calculate hours per unit for this subject
      const unitsInSubject = unitsData.filter(u => u.longRangePlan?.subject === subject).length;
      const hoursPerUnit = unitsInSubject > 0 ? Math.round(subjectTotalHours / unitsInSubject * 100) / 100 : 0;
      
      // Clean the unit data - remove nested objects that don't belong in Prisma create
      const cleanUnit = {
        id: unit.id,
        userId: unit.userId,
        title: unit.title,
        longRangePlanId: unit.longRangePlanId,
        description: unit.description,
        bigIdeas: unit.bigIdeas,
        essentialQuestions: unit.essentialQuestions,
        startDate: new Date(unit.startDate),
        endDate: new Date(unit.endDate),
        estimatedHours: hoursPerUnit,
        titleFr: unit.titleFr,
        descriptionFr: unit.descriptionFr,
        bigIdeasFr: unit.bigIdeasFr,
        assessmentPlan: unit.assessmentPlan,
        successCriteria: unit.successCriteria,
        createdAt: new Date(unit.createdAt),
        updatedAt: new Date(unit.updatedAt),
        communityConnections: unit.communityConnections,
        crossCurricularConnections: unit.crossCurricularConnections,
        culminatingTask: unit.culminatingTask,
        differentiationStrategies: unit.differentiationStrategies,
        environmentalEducation: unit.environmentalEducation,
        fieldTripsAndGuestSpeakers: unit.fieldTripsAndGuestSpeakers,
        indigenousPerspectives: unit.indigenousPerspectives,
        keyVocabulary: unit.keyVocabulary,
        learningSkills: unit.learningSkills,
        parentCommunicationPlan: unit.parentCommunicationPlan,
        priorKnowledge: unit.priorKnowledge,
        socialJusticeConnections: unit.socialJusticeConnections,
        technologyIntegration: unit.technologyIntegration,
        assessmentRubric: unit.assessmentRubric,
        enduringUnderstandings: unit.enduringUnderstandings,
        evidenceTypes: unit.evidenceTypes,
        performanceIndicators: unit.performanceIndicators,
        performanceTask: unit.performanceTask,
        transferableSkills: unit.transferableSkills,
        isLocked: true,
        lockedAt: new Date(),
        lockedReason: 'Strategically perfect - protected from modification'
      };

      // Create/update the unit with proper hours
      await prisma.unitPlan.upsert({
        where: { id: unit.id },
        update: {
          estimatedHours: hoursPerUnit,
          isLocked: true,
          lockedReason: 'Strategically perfect - protected from modification'
        },
        create: cleanUnit
      });
      
      totalHours += hoursPerUnit;
      processedUnits++;
      
      if (processedUnits % 10 === 0) {
        console.log(`✅ Processed ${processedUnits}/${unitsData.length} units`);
      }
    }
    
    console.log(`✅ Loaded ${processedUnits} perfect unit plans`);
    console.log(`📊 Total estimated hours: ${totalHours}`);
    
    // 5. Create the 975 lessons distributed as per CLAUDE.md
    console.log('📝 Creating 975 lessons distributed optimally...');
    
    const lessonDistribution = [
      { subject: 'Français (Immersion)', count: 195, dailyMinutes: 45 },
      { subject: 'Mathématiques', count: 195, dailyMinutes: 45 },
      { subject: 'Sciences de la nature', count: 195, dailyMinutes: 45 },
      { subject: 'Arts visuels', count: 195, dailyMinutes: 45 },
      { subject: 'Sciences humaines', count: 97, dailyMinutes: 45 },
      { subject: 'Formation personnelle et sociale', count: 98, dailyMinutes: 45 }
    ];
    
    let totalLessonsCreated = 0;
    
    for (const dist of lessonDistribution) {
      // Find units for this subject
      const subjectUnits = unitsData.filter(u => u.longRangePlan?.subject === dist.subject);
      
      if (subjectUnits.length === 0) {
        console.log(`⚠️  No units found for ${dist.subject}`);
        continue;
      }
      
      // Distribute lessons across units in this subject
      const lessonsPerUnit = Math.floor(dist.count / subjectUnits.length);
      let remainingLessons = dist.count % subjectUnits.length;
      
      for (let unitIndex = 0; unitIndex < subjectUnits.length; unitIndex++) {
        const unit = subjectUnits[unitIndex];
        const lessonsForThisUnit = lessonsPerUnit + (remainingLessons > 0 ? 1 : 0);
        if (remainingLessons > 0) remainingLessons--;
        
        // Create lessons for this unit
        for (let lessonNum = 1; lessonNum <= lessonsForThisUnit; lessonNum++) {
          await prisma.eTFOLessonPlan.create({
            data: {
              userId: EMILY_USER_ID,
              unitPlanId: unit.id,
              title: `${unit.title} - Leçon ${lessonNum}`,
              date: new Date('2025-09-04'), // Will be scheduled properly later
              duration: dist.dailyMinutes,
              subject: dist.subject,
              grade: 1,
              language: 'fr',
              learningGoals: `Objectif ${lessonNum} pour ${unit.title}`,
              mindsOn: `Activation des connaissances pour la leçon ${lessonNum}`,
              action: `Activité principale pour la leçon ${lessonNum}`,
              consolidation: `Consolidation pour la leçon ${lessonNum}`,
              materials: ['Matériaux de base'],
              differentiationStrategies: {
                forStruggling: ['Support visuel', 'Travail en pairs'],
                forAdvanced: ['Extension créative', 'Tutorat'],
                forELL: ['Support linguistique'],
                forIEP: ['Adaptations personnalisées']
              },
              assessmentType: 'Formative',
              assessmentNotes: 'Observation, Questions-réponses'
            }
          });
          
          totalLessonsCreated++;
          
          if (totalLessonsCreated % 50 === 0) {
            console.log(`✅ Created ${totalLessonsCreated}/975 lessons`);
          }
        }
      }
    }
    
    console.log(`✅ Created ${totalLessonsCreated} lessons total`);
    
    // 6. Verify the perfect foundation
    const unitCount = await prisma.unitPlan.count({ where: { userId: EMILY_USER_ID } });
    const lessonCount = await prisma.eTFOLessonPlan.count({ where: { userId: EMILY_USER_ID } });
    
    console.log('🎉 PERFECT FOUNDATION LOADED SUCCESSFULLY!');
    console.log('==========================================');
    console.log(`📚 Units: ${unitCount} (target: 50)`);
    console.log(`📝 Lessons: ${lessonCount} (target: 975)`);
    console.log(`⏰ Total Hours: ${totalHours} (calculated dynamically)`);
    console.log('🔒 All content is locked and protected');
    
    if (unitCount === 50 && lessonCount === 975) {
      console.log('✅ PERFECTION ACHIEVED! Dashboard will now show dynamic data.');
    } else {
      console.log('⚠️  Numbers don\'t match targets - check logs above');
    }
    
  } catch (error) {
    console.error('❌ Error loading perfect foundation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
loadPerfectFoundation()
  .then(() => {
    console.log('🎯 Perfect foundation loading complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to load perfect foundation:', error);
    process.exit(1);
  });

export { loadPerfectFoundation };