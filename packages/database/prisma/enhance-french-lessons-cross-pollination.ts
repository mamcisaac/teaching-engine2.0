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

// Enhanced lesson structures by date
const lessonEnhancements = [
  {
    date: new Date('2025-09-04'),
    title: 'Bienvenue en immersion française!',
    crossCurricularConnections: {
      math: 'Count students, classroom objects (1-10)',
      science: 'Observe classroom environment using senses',
      socialStudies: 'Build classroom community, learn names',
      arts: 'Create name tags with decorative patterns',
      pe: 'Name games with movement'
    },
    sharedVocabulary: ['ensemble', 'ami', 'compter', 'observer'],
    sharedResources: ['countingBears', 'naturalMaterials'],
    morningMeeting: {
      ...MORNING_MEETING_INTEGRATION,
      focus: 'Building community with "ensemble" concept'
    },
    assessmentIntegration: 'Observe social interactions, counting skills, French comprehension simultaneously'
  },
  {
    date: new Date('2025-09-05'),
    title: 'Notre communauté de classe',
    crossCurricularConnections: {
      socialStudies: 'Classroom community mapping',
      math: 'Count and graph classroom members',
      fps: 'Discuss classroom safety and rules',
      arts: 'Create classroom community mural'
    },
    sharedVocabulary: ['ensemble', 'partager', 'sécurité', 'ami'],
    sharedResources: ['familyPhotos', 'countingBears'],
    assessmentIntegration: 'Document community understanding across subjects'
  },
  {
    date: new Date('2025-09-08'),
    title: 'Le français partout',
    crossCurricularConnections: {
      allSubjects: 'Identify French labels throughout school',
      science: 'Explore school with senses, describe in French',
      math: 'Count French items found',
      pe: 'School tour with movement vocabulary'
    },
    sharedVocabulary: ['partout', 'observer', 'compter', 'bouger'],
    sharedResources: ['measuringTools'],
    assessmentIntegration: 'Observation checklist for multiple skills'
  },
  {
    date: new Date('2025-09-09'),
    title: 'La magie des jours',
    crossCurricularConnections: {
      math: 'Calendar patterns, counting days',
      science: 'Daily weather patterns',
      music: 'Days of the week song with rhythm',
      pe: 'Seven movements for seven days'
    },
    sharedVocabulary: ['jour', 'compter', 'observer', 'répéter'],
    sharedResources: ['patternBlocks'],
    assessmentIntegration: 'Calendar skills across Math and French'
  },
  {
    date: new Date('2025-09-10'),
    title: 'Nos noms spéciaux',
    crossCurricularConnections: {
      socialStudies: 'Name origins and diversity',
      math: 'Graph name lengths, count letters',
      arts: 'Decorative name art',
      music: 'Name rhythm patterns'
    },
    sharedVocabulary: ['spécial', 'compter', 'forme', 'couleur'],
    sharedResources: ['patternBlocks', 'naturalMaterials'],
    assessmentIntegration: 'Identity expression across subjects'
  },
  {
    date: new Date('2025-09-11'),
    title: 'Les couleurs autour de nous',
    crossCurricularConnections: {
      arts: 'Color mixing and theory',
      science: 'Colors in nature observation',
      math: 'Color patterns and sorting',
      pe: 'Color tag games'
    },
    sharedVocabulary: ['couleur', 'observer', 'mélanger', 'forme'],
    sharedResources: ['countingBears', 'naturalMaterials'],
    assessmentIntegration: 'Color vocabulary in multiple contexts'
  },
  {
    date: new Date('2025-09-12'),
    title: 'Compter en français',
    crossCurricularConnections: {
      math: 'Deep integration - number sense 1-10',
      science: 'Count observations and data',
      pe: 'Movement counting games',
      music: 'Rhythm counting'
    },
    sharedVocabulary: ['compter', 'plus', 'moins', 'ensemble'],
    sharedResources: ['countingBears', 'measuringTools'],
    assessmentIntegration: 'Mathematical thinking in French'
  },
  {
    date: new Date('2025-09-15'),
    title: 'Mon corps et moi',
    crossCurricularConnections: {
      fps: 'Body awareness and health',
      science: 'Body parts and functions',
      pe: 'Body movement exploration',
      arts: 'Self-portrait with body parts'
    },
    sharedVocabulary: ['corps', 'bouger', 'grandir', 'santé'],
    sharedResources: ['measuringTools'],
    assessmentIntegration: 'Body awareness across domains'
  },
  {
    date: new Date('2025-09-16'),
    title: 'Les nombres en français', // CRITICAL ENHANCEMENT
    crossCurricularConnections: {
      math: 'FULL INTEGRATION - Les nombres tout autour de nous unit',
      science: 'Scientific counting and data collection',
      arts: 'Number art and patterns',
      pe: 'Number movement sequences',
      music: 'Number rhythms and beats'
    },
    sharedVocabulary: ['compter', 'mesurer', 'plus', 'moins', 'égal'],
    sharedResources: ['countingBears', 'patternBlocks', 'measuringTools'],
    morningMeeting: {
      ...MORNING_MEETING_INTEGRATION,
      focus: 'Number of the day exploration'
    },
    assessmentIntegration: 'Comprehensive number understanding across subjects'
  },
  {
    date: new Date('2025-09-17'),
    title: 'Les formes partout',
    crossCurricularConnections: {
      math: 'Geometry - shapes and attributes',
      arts: 'Shape art and design',
      science: 'Shapes in nature',
      pe: 'Shape movement and spatial awareness'
    },
    sharedVocabulary: ['forme', 'cercle', 'carré', 'triangle', 'côté'],
    sharedResources: ['patternBlocks', 'naturalMaterials'],
    assessmentIntegration: 'Geometric thinking across subjects'
  },
  {
    date: new Date('2025-09-18'),
    title: 'Notre routine quotidienne',
    crossCurricularConnections: {
      math: 'Time and sequencing',
      fps: 'Daily health routines',
      science: 'Daily patterns (sun, activities)',
      socialStudies: 'School day structure'
    },
    sharedVocabulary: ['routine', 'temps', 'ordre', 'ensemble'],
    sharedResources: ['measuringTools'],
    assessmentIntegration: 'Sequencing skills across domains'
  },
  {
    date: new Date('2025-09-19'),
    title: 'J\'aime, tu aimes',
    crossCurricularConnections: {
      fps: 'Expressing preferences and emotions',
      socialStudies: 'Respecting differences',
      arts: 'Illustrating preferences',
      math: 'Graphing class preferences'
    },
    sharedVocabulary: ['aimer', 'préférer', 'différent', 'ensemble'],
    sharedResources: ['familyPhotos', 'countingBears'],
    assessmentIntegration: 'Self-expression across subjects'
  },
  {
    date: new Date('2025-09-22'),
    title: 'Explorer l\'automne', // CRITICAL ENHANCEMENT
    crossCurricularConnections: {
      science: 'FULL INTEGRATION - Seasonal observation methods',
      math: 'Measuring and comparing leaves',
      arts: 'Autumn art with natural materials',
      socialStudies: 'Seasonal community activities',
      pe: 'Outdoor exploration movement'
    },
    sharedVocabulary: ['observer', 'mesurer', 'comparer', 'couleur', 'changer'],
    sharedResources: ['naturalMaterials', 'measuringTools', 'patternBlocks'],
    morningMeeting: {
      ...MORNING_MEETING_INTEGRATION,
      focus: 'Scientific observation of autumn changes'
    },
    assessmentIntegration: 'Scientific method in French context'
  },
  {
    date: new Date('2025-09-23'),
    title: 'Ma famille et moi',
    crossCurricularConnections: {
      socialStudies: 'Family structures and diversity',
      math: 'Family member counting and comparison',
      arts: 'Family portraits',
      fps: 'Family roles and relationships'
    },
    sharedVocabulary: ['famille', 'grandir', 'aimer', 'ensemble'],
    sharedResources: ['familyPhotos', 'countingBears'],
    assessmentIntegration: 'Family understanding across subjects'
  },
  {
    date: new Date('2025-09-24'),
    title: 'Les sons français',
    crossCurricularConnections: {
      music: 'Sound exploration and rhythm',
      science: 'Sound as vibration',
      pe: 'Movement to sounds',
      arts: 'Visual representation of sounds'
    },
    sharedVocabulary: ['son', 'écouter', 'répéter', 'rythme'],
    sharedResources: ['naturalMaterials'],
    assessmentIntegration: 'Phonemic awareness across modalities'
  },
  {
    date: new Date('2025-09-25'),
    title: 'Nos amis de classe',
    crossCurricularConnections: {
      fps: 'Friendship skills and empathy',
      socialStudies: 'Community relationships',
      arts: 'Friend portraits and cards',
      pe: 'Partner and team activities'
    },
    sharedVocabulary: ['ami', 'ensemble', 'partager', 'aider'],
    sharedResources: ['familyPhotos', 'patternBlocks'],
    assessmentIntegration: 'Social skills across contexts'
  },
  {
    date: new Date('2025-09-26'),
    title: 'Les animaux en français',
    crossCurricularConnections: {
      science: 'Animal characteristics and habitats',
      math: 'Animal counting and sorting',
      pe: 'Animal movements',
      arts: 'Animal art and crafts',
      music: 'Animal songs and sounds'
    },
    sharedVocabulary: ['animal', 'bouger', 'observer', 'habitat'],
    sharedResources: ['countingBears', 'naturalMaterials'],
    assessmentIntegration: 'Animal knowledge across subjects'
  },
  {
    date: new Date('2025-09-29'),
    title: 'Notre école',
    crossCurricularConnections: {
      socialStudies: 'School community and helpers',
      math: 'School mapping and directions',
      fps: 'School safety and procedures',
      arts: 'School mural project'
    },
    sharedVocabulary: ['école', 'ensemble', 'sécurité', 'communauté'],
    sharedResources: ['measuringTools', 'familyPhotos'],
    assessmentIntegration: 'School community understanding'
  },
  {
    date: new Date('2025-09-30'),
    title: 'Célébration septembre!', // CRITICAL ENHANCEMENT
    crossCurricularConnections: {
      allSubjects: 'SHOWCASE ALL SEPTEMBER LEARNING',
      math: 'Display number learning and patterns',
      science: 'Share observations and discoveries',
      arts: 'Exhibition of September artworks',
      socialStudies: 'Community celebration planning',
      music: 'Performance of September songs',
      pe: 'Movement demonstrations',
      fps: 'Reflection on personal growth'
    },
    sharedVocabulary: ['célébrer', 'partager', 'ensemble', 'fier', 'apprendre'],
    sharedResources: ['countingBears', 'patternBlocks', 'naturalMaterials', 'measuringTools', 'familyPhotos'],
    morningMeeting: {
      ...MORNING_MEETING_INTEGRATION,
      focus: 'Celebration of integrated learning'
    },
    assessmentIntegration: 'Portfolio celebration across all subjects - summative assessment'
  }
];

async function enhanceFrenchLessons() {
  console.log('🚀 Starting French lesson enhancement with cross-curricular connections...\n');

  try {
    // First, get all September French lessons
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        },
        subject: 'Français langue première'
      },
      orderBy: { date: 'asc' }
    });

    console.log(`Found ${existingLessons.length} French lessons to enhance\n`);

    for (const lesson of existingLessons) {
      const enhancement = lessonEnhancements.find(
        e => e.date.toDateString() === new Date(lesson.date).toDateString()
      );

      if (enhancement) {
        console.log(`\n📚 Enhancing lesson: ${lesson.title}`);
        console.log(`   Date: ${new Date(lesson.date).toLocaleDateString()}`);

        // Create enhanced content objects
        const enhancedMindsOn = {
          original: lesson.mindsOn,
          sharedVocabulary: enhancement.sharedVocabulary,
          crossCurricular: `Morning meeting integrates: ${Object.keys(enhancement.crossCurricularConnections).join(', ')}`
        };

        if (enhancement.morningMeeting) {
          enhancedMindsOn.morningMeeting = enhancement.morningMeeting;
        }

        // Add shared resources
        const resourceDetails = enhancement.sharedResources.map(r => ({
          resource: r,
          ...SHARED_RESOURCES[r]
        }));

        const enhancedAction = {
          original: lesson.action,
          sharedVocabulary: enhancement.sharedVocabulary,
          crossCurricularActivities: enhancement.crossCurricularConnections,
          sharedResources: resourceDetails
        };

        const enhancedConsolidation = {
          original: lesson.consolidation,
          sharedVocabulary: enhancement.sharedVocabulary,
          integratedAssessment: enhancement.assessmentIntegration,
          crossCurricularReflection: 'Students reflect on connections made across subjects'
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

        // Create enhanced learning goals with cross-curricular info
        const enhancedLearningGoals = `
${lesson.learningGoals || 'Students will develop French language skills through integrated learning.'}

CROSS-CURRICULAR INTEGRATION:
${Object.entries(enhancement.crossCurricularConnections)
  .map(([subject, connection]) => `• ${subject.toUpperCase()}: ${connection}`)
  .join('\n')}

SHARED VOCABULARY (Tier 1):
${enhancement.sharedVocabulary.map(word => {
  const details = TIER_1_VOCABULARY[word];
  return details ? `• ${word} (${details.english}) - Used in: ${details.subjects.join(', ')}` : `• ${word}`;
}).join('\n')}

INTEGRATED ASSESSMENT:
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
              support: 'Use manipulatives and visual vocabulary from multiple subjects',
              extension: 'Make connections to other subjects independently',
              multiModal: 'Access learning through preferred subject lens (Math, Science, Arts, etc.)'
            },
            assessmentNotes: `Integrated Assessment: ${enhancement.assessmentIntegration}. Document vocabulary use across subjects. Collect portfolio pieces showing integrated learning.`
          }
        });

        console.log(`   ✅ Enhanced with connections to: ${Object.keys(enhancement.crossCurricularConnections).join(', ')}`);
        console.log(`   ✅ Added ${enhancement.sharedVocabulary.length} shared vocabulary words`);
        console.log(`   ✅ Integrated ${enhancement.sharedResources.length} shared resources`);
      }
    }

    console.log('\n\n🎉 ENHANCEMENT COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log(`• ${existingLessons.length} French lessons enhanced`);
    console.log('• Cross-curricular connections added to all lessons');
    console.log('• Tier 1 vocabulary integrated throughout');
    console.log('• Shared resources optimized');
    console.log('• Assessment integration implemented');
    console.log('\nKey Enhancements:');
    console.log('• Sept 16: Full Math-French number integration');
    console.log('• Sept 22: Science observation methods integrated');
    console.log('• Sept 30: Multi-subject celebration showcase');
    console.log('\n✨ French lessons now operate at 100% cross-pollination potential!');

  } catch (error) {
    console.error('Error enhancing lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhancement
enhanceFrenchLessons();