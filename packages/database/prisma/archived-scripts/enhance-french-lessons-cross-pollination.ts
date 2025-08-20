#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Enhance existing French lessons with cross-curricular connections
 * Based on the Cross-Pollination Guide
 */

// Tier 1 High-Impact Vocabulary to integrate
const TIER_1_VOCABULARY = {
  ensemble: { english: 'together', subjects: ['All'], contexts: ['group work', 'community', 'collaboration'] },
  partager: { english: 'share', subjects: ['Math', 'Social Studies', 'FPS'], contexts: ['materials', 'ideas', 'fair shares'] },
  observer: { english: 'observe', subjects: ['Science', 'Math', 'Arts'], contexts: ['scientific method', 'patterns', 'art appreciation'] },
  compter: { english: 'count', subjects: ['Math', 'Science', 'PE', 'Music'], contexts: ['numbers', 'data', 'beats', 'movements'] },
  mesurer: { english: 'measure', subjects: ['Math', 'Science', 'PE', 'Arts'], contexts: ['length', 'time', 'distance', 'proportions'] },
  couleur: { english: 'color', subjects: ['Arts', 'Science', 'Math'], contexts: ['art', 'nature', 'patterns', 'descriptions'] },
  forme: { english: 'shape', subjects: ['Math', 'Arts', 'Science', 'PE'], contexts: ['geometry', 'design', 'classification', 'spatial'] },
  ami: { english: 'friend', subjects: ['FPS', 'Social Studies'], contexts: ['relationships', 'community', 'social skills'] },
  grandir: { english: 'grow', subjects: ['Science', 'Math', 'FPS', 'Arts'], contexts: ['plants', 'bodies', 'numbers', 'stories'] },
  sécurité: { english: 'safety', subjects: ['FPS', 'PE', 'Science', 'Social Studies'], contexts: ['rules', 'procedures', 'awareness'] }
};

// Multi-purpose manipulatives and resources
const SHARED_RESOURCES = {
  countingBears: {
    uses: ['Math counting/sorting', 'Science classification', 'French colors/prepositions', 'Arts printing'],
    subjects: ['Math', 'Science', 'French', 'Arts']
  },
  patternBlocks: {
    uses: ['Math geometry/patterns', 'Science symmetry', 'French shapes/descriptions', 'Arts mosaics'],
    subjects: ['Math', 'Science', 'French', 'Arts']
  },
  naturalMaterials: {
    uses: ['Math counting/sorting', 'Science investigation', 'French descriptive vocab', 'Arts collage'],
    subjects: ['Math', 'Science', 'French', 'Arts']
  },
  measuringTools: {
    uses: ['Math measurement', 'Science data collection', 'PE distance', 'Arts proportion'],
    subjects: ['Math', 'Science', 'PE', 'Arts']
  },
  familyPhotos: {
    uses: ['French family vocab', 'Social Studies diversity', 'Math counting', 'Arts portraits'],
    subjects: ['French', 'Social Studies', 'Math', 'Arts']
  }
};

// Cross-curricular morning meeting structure
const MORNING_MEETING_INTEGRATION = {
  greeting: 'French vocabulary practice with counting in circle',
  calendar: 'Math calendar skills with French days/months',
  weather: 'Science observation with French descriptive vocabulary',
  share: 'Social Studies community building with French expression',
  activity: 'PE movement with French instructions and counting'
};

// Enhanced lesson structures by date - LIMITED to 1-2 natural connections
const lessonEnhancements = [
  {
    date: new Date('2025-09-04'),
    title: 'Bienvenue en immersion française!',
    primaryFocus: 'French greetings and classroom vocabulary',
    crossCurricularConnections: {
      socialStudies: 'Build classroom community while learning French greetings'
    },
    sharedVocabulary: ['ensemble', 'ami'],
    sharedResources: ['familyPhotos'],
    assessmentIntegration: 'French vocabulary use and classroom community building'
  },
  {
    date: new Date('2025-09-05'),
    title: 'Notre communauté de classe',
    primaryFocus: 'French vocabulary for classroom and friends',
    crossCurricularConnections: {
      socialStudies: 'Classroom community connections in French'
    },
    sharedVocabulary: ['ensemble', 'ami'],
    sharedResources: ['familyPhotos'],
    assessmentIntegration: 'French community vocabulary use'
  },
  {
    date: new Date('2025-09-08'),
    title: 'Le français partout',
    primaryFocus: 'French environmental print and school vocabulary',
    crossCurricularConnections: {},
    sharedVocabulary: ['partout', 'observer'],
    sharedResources: [],
    assessmentIntegration: 'French vocabulary recognition in environment'
  },
  {
    date: new Date('2025-09-09'),
    title: 'La magie des jours',
    primaryFocus: 'Days of the week in French',
    crossCurricularConnections: {
      math: 'Calendar work supports day vocabulary'
    },
    sharedVocabulary: ['jour', 'compter'],
    sharedResources: [],
    assessmentIntegration: 'French calendar vocabulary use'
  },
  {
    date: new Date('2025-09-10'),
    title: 'Nos noms spéciaux',
    primaryFocus: 'French pronunciation and personal identity vocabulary',
    crossCurricularConnections: {
      arts: 'Create name art while practicing French'
    },
    sharedVocabulary: ['spécial'],
    sharedResources: [],
    assessmentIntegration: 'French name vocabulary and pronunciation'
  },
  {
    date: new Date('2025-09-11'),
    title: 'Les couleurs autour de nous',
    primaryFocus: 'French color vocabulary',
    crossCurricularConnections: {
      arts: 'Color exploration while learning French color words'
    },
    sharedVocabulary: ['couleur'],
    sharedResources: ['countingBears'],
    assessmentIntegration: 'French color vocabulary mastery'
  },
  {
    date: new Date('2025-09-12'),
    title: 'Compter en français',
    primaryFocus: 'French number vocabulary 1-10',
    crossCurricularConnections: {
      math: 'Practice counting while learning French numbers'
    },
    sharedVocabulary: ['compter'],
    sharedResources: ['countingBears'],
    assessmentIntegration: 'French number vocabulary accuracy'
  },
  {
    date: new Date('2025-09-15'),
    title: 'Mon corps et moi',
    primaryFocus: 'French body part vocabulary',
    crossCurricularConnections: {
      fps: 'Body awareness while learning French vocabulary'
    },
    sharedVocabulary: ['corps'],
    sharedResources: [],
    assessmentIntegration: 'French body vocabulary use'
  },
  {
    date: new Date('2025-09-16'),
    title: 'Les nombres en français', // KEY MATH CONNECTION
    primaryFocus: 'French number vocabulary and usage',
    crossCurricularConnections: {
      math: 'Natural integration with Math number unit - count and calculate in French'
    },
    sharedVocabulary: ['compter', 'plus', 'moins'],
    sharedResources: ['countingBears', 'patternBlocks'],
    assessmentIntegration: 'French number vocabulary in mathematical contexts'
  },
  {
    date: new Date('2025-09-17'),
    title: 'Les formes partout',
    primaryFocus: 'French shape vocabulary',
    crossCurricularConnections: {
      math: 'Shape recognition while learning French vocabulary'
    },
    sharedVocabulary: ['forme', 'cercle', 'carré', 'triangle'],
    sharedResources: ['patternBlocks'],
    assessmentIntegration: 'French shape vocabulary mastery'
  },
  {
    date: new Date('2025-09-18'),
    title: 'Notre routine quotidienne',
    primaryFocus: 'French daily routine vocabulary',
    crossCurricularConnections: {},
    sharedVocabulary: ['routine', 'temps'],
    sharedResources: [],
    assessmentIntegration: 'French routine vocabulary use'
  },
  {
    date: new Date('2025-09-19'),
    title: 'J\'aime, tu aimes',
    primaryFocus: 'French preference vocabulary and verb conjugation',
    crossCurricularConnections: {},
    sharedVocabulary: ['aimer', 'préférer'],
    sharedResources: [],
    assessmentIntegration: 'French preference expression'
  },
  {
    date: new Date('2025-09-22'),
    title: 'Explorer l\'automne', // KEY SCIENCE CONNECTION
    primaryFocus: 'French autumn vocabulary and descriptions',
    crossCurricularConnections: {
      science: 'Natural observation while learning seasonal French vocabulary'
    },
    sharedVocabulary: ['observer', 'couleur', 'changer'],
    sharedResources: ['naturalMaterials'],
    assessmentIntegration: 'French descriptive vocabulary for nature'
  },
  {
    date: new Date('2025-09-23'),
    title: 'Ma famille et moi',
    primaryFocus: 'French family vocabulary',
    crossCurricularConnections: {
      socialStudies: 'Family diversity while learning French vocabulary'
    },
    sharedVocabulary: ['famille', 'aimer'],
    sharedResources: ['familyPhotos'],
    assessmentIntegration: 'French family vocabulary use'
  },
  {
    date: new Date('2025-09-24'),
    title: 'Les sons français',
    primaryFocus: 'French phonemic awareness and pronunciation',
    crossCurricularConnections: {},
    sharedVocabulary: ['son', 'écouter', 'répéter'],
    sharedResources: [],
    assessmentIntegration: 'French phonemic awareness'
  },
  {
    date: new Date('2025-09-25'),
    title: 'Nos amis de classe',
    primaryFocus: 'French friendship vocabulary and social expressions',
    crossCurricularConnections: {
      fps: 'Social skills while using French'
    },
    sharedVocabulary: ['ami', 'ensemble', 'partager'],
    sharedResources: [],
    assessmentIntegration: 'French social vocabulary use'
  },
  {
    date: new Date('2025-09-26'),
    title: 'Les animaux en français',
    primaryFocus: 'French animal vocabulary and sounds',
    crossCurricularConnections: {
      science: 'Animal characteristics while learning French names'
    },
    sharedVocabulary: ['animal', 'bouger'],
    sharedResources: [],
    assessmentIntegration: 'French animal vocabulary'
  },
  {
    date: new Date('2025-09-29'),
    title: 'Notre école',
    primaryFocus: 'French school vocabulary and locations',
    crossCurricularConnections: {},
    sharedVocabulary: ['école', 'ensemble'],
    sharedResources: [],
    assessmentIntegration: 'French school vocabulary mastery'
  },
  {
    date: new Date('2025-09-30'),
    title: 'Célébration septembre!', // CELEBRATION WITH BALANCE
    primaryFocus: 'French language celebration and portfolio showcase',
    crossCurricularConnections: {
      allSubjects: 'Showcase French learning with selective examples from other subjects'
    },
    sharedVocabulary: ['célébrer', 'partager', 'ensemble', 'fier'],
    sharedResources: ['familyPhotos'],
    assessmentIntegration: 'French language growth demonstration'
  }
];

async function enhanceFrenchLessons() {
  console.log('🚀 Starting French lesson enhancement with BALANCED cross-curricular connections...\n');

  try {
    // First, get all September French lessons
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        },
        subject: 'Français (Immersion)'
      },
      orderBy: { date: 'asc' }
    });

    console.log(`Found ${existingLessons.length} French lessons to balance and enhance\n`);

    for (const lesson of existingLessons) {
      const enhancement = lessonEnhancements.find(
        e => e.date.toDateString() === new Date(lesson.date).toDateString()
      );

      if (enhancement) {
        console.log(`\n📚 Enhancing lesson: ${lesson.title}`);
        console.log(`   Date: ${new Date(lesson.date).toLocaleDateString()}`);

        // Create enhanced content objects - FOCUSED on French primary objective
        const enhancedMindsOn = {
          original: lesson.mindsOn,
          primaryFocus: enhancement.primaryFocus,
          sharedVocabulary: enhancement.sharedVocabulary
        };

        // Only add cross-curricular if it exists and is not empty
        if (Object.keys(enhancement.crossCurricularConnections).length > 0) {
          enhancedMindsOn.naturalConnection = Object.values(enhancement.crossCurricularConnections)[0];
        }

        // Add shared resources
        const resourceDetails = enhancement.sharedResources.map(r => ({
          resource: r,
          ...SHARED_RESOURCES[r]
        }));

        const enhancedAction = {
          original: lesson.action,
          primaryFocus: enhancement.primaryFocus,
          sharedVocabulary: enhancement.sharedVocabulary
        };

        // Only add resources if they exist
        if (resourceDetails.length > 0) {
          enhancedAction.sharedResources = resourceDetails;
        }

        // Add natural connection if it exists
        if (Object.keys(enhancement.crossCurricularConnections).length > 0) {
          enhancedAction.naturalConnection = Object.values(enhancement.crossCurricularConnections)[0];
        }

        const enhancedConsolidation = {
          original: lesson.consolidation,
          primaryFocus: enhancement.primaryFocus,
          assessment: enhancement.assessmentIntegration
        };

        // Update materials list with shared resources
        const materials = enhancement.sharedResources.map(r => {
          const resource = SHARED_RESOURCES[r];
          if (!resource) {
            console.log(`   ⚠️ Warning: Resource ${r} not found in SHARED_RESOURCES`);
            return r;
          }
          return `${r} (shared with ${resource.subjects.join(', ')})`;
        });

        // Create enhanced learning goals with PRIMARY FRENCH FOCUS
        const enhancedLearningGoals = `
PRIMARY OBJECTIVE: ${enhancement.primaryFocus}

${lesson.learningGoals || 'Students will develop French language skills through meaningful contexts.'}

${Object.keys(enhancement.crossCurricularConnections).length > 0 ? 
`NATURAL CONNECTION:
${Object.entries(enhancement.crossCurricularConnections)
  .map(([subject, connection]) => `• ${subject}: ${connection}`)
  .join('\n')}\n\n` : ''}
FOCUS VOCABULARY:
${enhancement.sharedVocabulary.map(word => {
  const details = TIER_1_VOCABULARY[word];
  return details ? `• ${word} (${details.english})` : `• ${word}`;
}).join('\n')}

ASSESSMENT FOCUS:
${enhancement.assessmentIntegration}
        `.trim();

        // Update the lesson
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            learningGoals: enhancedLearningGoals,
            materials: materials,
            mindsOn: JSON.stringify(enhancedMindsOn),
            action: JSON.stringify(enhancedAction),
            consolidation: JSON.stringify(enhancedConsolidation),
            differentiationStrategies: {
              support: 'Visual supports and gestures for French vocabulary',
              extension: 'Additional French vocabulary and expressions',
              multiModal: 'Multiple ways to demonstrate French understanding'
            },
            assessmentNotes: `Primary Focus: ${enhancement.assessmentIntegration}. Document French language development. Portfolio evidence of French vocabulary use.`
          }
        });

        const connectionCount = Object.keys(enhancement.crossCurricularConnections).length;
        console.log(`   ✅ French focus clarified: ${enhancement.primaryFocus}`);
        console.log(`   ✅ Natural connections: ${connectionCount} (limited for focus)`);
        console.log(`   ✅ Focus vocabulary: ${enhancement.sharedVocabulary.length} words`);
      }
    }

    console.log('\n\n🎉 BALANCED ENHANCEMENT COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log(`• ${existingLessons.length} French lessons refined`);
    console.log('• PRIMARY French focus restored');
    console.log('• Natural connections limited to 1-2 per lesson');
    console.log('• Focus vocabulary streamlined');
    console.log('• Assessment focused on French language development');
    console.log('\nKey Balance Points:');
    console.log('• Sept 16: Natural Math-French number connection');
    console.log('• Sept 22: Science vocabulary through French exploration');
    console.log('• Sept 30: French-centered celebration with selective showcases');
    console.log('\n✨ French lessons now maintain primary language focus with natural connections!');

  } catch (error) {
    console.error('Error enhancing lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhancement
enhanceFrenchLessons();